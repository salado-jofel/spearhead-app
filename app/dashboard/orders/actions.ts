"use server";

import { revalidatePath } from "next/cache";
import {
  dbSelect,
  dbInsert,
  dbUpdate,
  dbDelete,
  getSupabaseClient,
} from "@/utils/supabase/db";
import type {
  Order,
  InsertOrderPayload,
  UpdateOrderPayload,
} from "@/app/(interfaces)/order";
import { Facility } from "@/app/(interfaces)/facility";
import { Product } from "@/app/(interfaces)/product";

const ORDER_TABLE = "orders";
const ORDER_COLUMNS =
  "id, created_at, order_id, facility_id, product_id, amount, status, created_by, facilities(name), products(name)";
const ORDERS_PATH = "/dashboard/orders";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helper: get current authenticated user ───────────────────────────────────
async function getCurrentUser() {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return { user, supabase };
}

// ─── READ: current user's orders only ────────────────────────────────────────
export async function getAllOrders(): Promise<Order[]> {
  try {
    const { user, supabase } = await getCurrentUser();

    const { data, error } = await dbSelect<RawOrder>({
      table: ORDER_TABLE,
      columns: ORDER_COLUMNS,
      filters: [{ column: "created_by", value: user.id }],
      order: { column: "created_at", ascending: false },
    });

    if (error) {
      console.error("[getAllOrders] Supabase error:", error.message);
      return [];
    }

    const orders = (data ?? []).map(flattenOrder);

    // Fetch current user's email from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", user.id)
      .single();

    const email = profile?.email ?? user.email ?? undefined;

    return orders.map((o) => ({ ...o, created_by_email: email }));
  } catch (err) {
    console.error("[getAllOrders] Unexpected error:", err);
    return [];
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function addOrder(formData: FormData) {
  try {
    const { user } = await getCurrentUser();

    const payload: InsertOrderPayload = {
      order_id: formData.get("order_id") as string,
      facility_id: formData.get("facility_id") as string,
      product_id: formData.get("product_id") as string,
      amount: parseFloat(formData.get("amount") as string) || 0,
      status: "Processing",
      created_by: user.id,
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

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateOrderStatus(orderId: string, formData: FormData) {
  try {
    const { user } = await getCurrentUser();

    const payload: UpdateOrderPayload = {
      status: formData.get("status") as Order["status"],
    };

    const { error } = await dbUpdate<UpdateOrderPayload>({
      table: ORDER_TABLE,
      payload,
      column: "id",
      value: orderId,
      guards: [{ column: "created_by", value: user.id }],
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

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteOrder(orderId: string) {
  try {
    const { user } = await getCurrentUser();

    const { error } = await dbDelete({
      table: ORDER_TABLE,
      column: "id",
      value: orderId,
      guards: [{ column: "created_by", value: user.id }],
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

// ─── Dropdown helpers ─────────────────────────────────────────────────────────
export async function getActiveFacilities(): Promise<Facility[]> {
  try {
    const { data, error } = await dbSelect<Facility>({
      table: "facilities",
      columns: "id, name, status",
      order: { column: "name", ascending: true },
    });

    if (error) {
      console.error("[getActiveFacilities] Supabase error:", error.message);
      return [];
    }

    return (data ?? []).filter((f) => f.status === "Active");
  } catch (err) {
    console.error("[getActiveFacilities] Unexpected error:", err);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await dbSelect<Product>({
    table: "products",
    columns: "id, name, price", 
    order: { column: "name", ascending: true },
  });

  if (error) {
    console.error("[getAllProducts] Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

