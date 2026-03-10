"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbInsert, dbUpdate, dbDelete } from "@/utils/supabase/db";
import { getSupabaseClient } from "@/utils/supabase/db";
import type {
  Order,
  InsertOrderPayload,
  UpdateOrderPayload,
} from "@/app/(interfaces)/order";

const ORDER_TABLE = "orders";
const ORDER_COLUMNS =
  "id, created_at, order_id, facility_id, product_id, amount, status, created_by, facilities(name), products(name)";
const ORDERS_PATH = "/dashboard/orders";

// ─── Helper: get current logged in user id ────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── Helper: get current logged in user email ─────────────────────────────────
async function getCurrentUserEmail(): Promise<string | null> {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

// ─── Helper: flatten joined names ─────────────────────────────────────────────
type RawOrder = {
  id: string;
  created_at: string;
  order_id: string;
  facility_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_by: string | null;
  facilities: { name: string } | null;
  products: { name: string } | null;
};

function flattenOrder(row: RawOrder): Order {
  return {
    id: row.id,
    created_at: row.created_at,
    order_id: row.order_id,
    facility_id: row.facility_id,
    product_id: row.product_id,
    amount: row.amount,
    status: row.status as Order["status"],
    created_by: row.created_by ?? undefined,
    facility_name: row.facilities?.name ?? "—",
    product_name: row.products?.name ?? "—",
  };
}

/**
 * READ: Fetches all orders with joined facility, product names
 * Note: created_by email is fetched separately via admin API
 *       or stored as denormalized field
 */
export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await dbSelect<RawOrder>({
    table: ORDER_TABLE,
    columns: ORDER_COLUMNS,
    order: { column: "created_at", ascending: false },
  });

  if (error) {
    console.error("[getAllOrders] Supabase error:", error.message);
    return [];
  }

  // ── Fetch user emails for all unique created_by ids ──────────────
  const orders = (data ?? []).map(flattenOrder);
  const userIds = Array.from(
    new Set(orders.map((o) => o.created_by).filter(Boolean)),
  ) as string[];

  if (userIds.length > 0) {
    const supabase = await getSupabaseClient();
    const emailMap: Record<string, string> = {};

    // Fetch emails using auth admin (service role) or profiles table
    // Using profiles table approach (works without service role key)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    if (profiles) {
      profiles.forEach((p: { id: string; email: string }) => {
        emailMap[p.id] = p.email;
      });
    }

    return orders.map((o) => ({
      ...o,
      created_by_email: o.created_by
        ? (emailMap[o.created_by] ?? o.created_by)
        : undefined,
    }));
  }

  return orders;
}

/**
 * CREATE: Adds a new order — auto-assigns created_by from session
 */
export async function addOrder(formData: FormData) {
  try {
    const userId = await getCurrentUserId();

    const payload: InsertOrderPayload = {
      order_id: formData.get("order_id") as string,
      facility_id: formData.get("facility_id") as string,
      product_id: formData.get("product_id") as string,
      amount: parseFloat(formData.get("amount") as string) || 0,
      status: "Draft",
      created_by: userId ?? undefined,
    };

    const { error } = await dbInsert<InsertOrderPayload>({
      table: ORDER_TABLE,
      payload,
    });

    if (error) {
      console.error("[addOrder] Supabase error:", error.message);
      throw new Error("Failed to create order");
    }

    revalidatePath(ORDERS_PATH);
  } catch (err) {
    console.error("[addOrder] Unexpected error:", err);
    throw new Error("An unexpected error occurred while creating the order");
  }
}

/**
 * UPDATE: Updates order status
 */
export async function updateOrderStatus(orderId: string, formData: FormData) {
  try {
    const payload: UpdateOrderPayload = {
      status: formData.get("status") as Order["status"],
    };

    const { error } = await dbUpdate<UpdateOrderPayload>({
      table: ORDER_TABLE,
      payload,
      column: "id",
      value: orderId,
    });

    if (error) {
      console.error("[updateOrderStatus] Supabase error:", error.message);
      throw new Error("Failed to update order status");
    }

    revalidatePath(ORDERS_PATH);
  } catch (err) {
    console.error("[updateOrderStatus] Unexpected error:", err);
    throw new Error("An unexpected error occurred while updating the order");
  }
}

/**
 * DELETE: Deletes an order
 */
export async function deleteOrder(orderId: string) {
  try {
    const { error } = await dbDelete({
      table: ORDER_TABLE,
      column: "id",
      value: orderId,
    });

    if (error) {
      console.error("[deleteOrder] Supabase error:", error.message);
      throw new Error("Failed to delete order");
    }

    revalidatePath(ORDERS_PATH);
  } catch (err) {
    console.error("[deleteOrder] Unexpected error:", err);
    throw new Error("An unexpected error occurred while deleting the order");
  }
}
