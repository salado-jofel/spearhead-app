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
import type { Facility } from "@/app/(interfaces)/facility";
import type { Product } from "@/app/(interfaces)/product";
import { createQBInvoiceFromData } from "./quickbooks-actions";

const ORDER_TABLE = "orders";
const ORDER_COLUMNS =
  "id, created_at, order_id, facility_id, product_id, amount, status, created_by, qb_invoice_id, qb_invoice_status, qb_synced_at, facilities(name, qb_customer_id), products(name, qb_item_id)";
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
  qb_invoice_id: string | null;
  qb_invoice_status: string | null;
  qb_synced_at: string | null;
  facilities: { name: string; qb_customer_id: string | null } | null;
  products: { name: string; qb_item_id: string | null } | null;
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
    facility_qb_customer_id: row.facilities?.qb_customer_id ?? null,
    product_qb_item_id: row.products?.qb_item_id ?? null,
    qb_invoice_id: row.qb_invoice_id ?? null,
    qb_invoice_status: row.qb_invoice_status ?? null,
    qb_synced_at: row.qb_synced_at ?? null,
  };
}

async function getCurrentUser() {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return { user, supabase };
}

// ─── READ ─────────────────────────────────────────────────────────────────────
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
export async function addOrder(formData: FormData): Promise<Order> {
  const { user, supabase } = await getCurrentUser();

  const order_id    = formData.get("order_id")    as string;
  const facility_id = formData.get("facility_id") as string;
  const product_id  = formData.get("product_id")  as string;
  const amount      = parseFloat(formData.get("amount") as string) || 0;

  // ── Step 1: Save to DB first — always ────────────────────
  const { data: insertedRow, error: insertError } = await supabase
    .from(ORDER_TABLE)
    .insert({
      order_id,
      facility_id,
      product_id,
      amount,
      status: "Processing",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !insertedRow) {
    console.error("[addOrder] DB insert error:", insertError?.message);
    throw new Error("Failed to save order to database.");
  }

  const rowId = insertedRow.id as string;

  // ── Step 2: Try QB invoice — non-blocking ────────────────
  try {
    const [{ data: facility }, { data: product }] = await Promise.all([
      supabase.from("facilities").select("name, qb_customer_id").eq("id", facility_id).single(),
      supabase.from("products").select("name, qb_item_id").eq("id", product_id).single(),
    ]);

    if (facility?.qb_customer_id && product?.qb_item_id) {
      const qbInvoiceId = await createQBInvoiceFromData({
        orderDocNumber: order_id,
        qbCustomerId:   facility.qb_customer_id,
        facilityName:   facility.name,
        qbItemId:       product.qb_item_id,
        productName:    product.name,
        amount,
      });

      if (qbInvoiceId) {
        await supabase
          .from(ORDER_TABLE)
          .update({
            qb_invoice_id:     qbInvoiceId,
            qb_invoice_status: "draft",
            qb_synced_at:      new Date().toISOString(),
          })
          .eq("id", rowId);
      }
    } else {
      console.warn("[addOrder] QB sync skipped — facility or product not yet synced to QB.");
    }
  } catch (qbErr) {
    // No QB connected yet or sync failed — order already saved, ignore
    console.warn("[addOrder] QB auto-sync failed (non-blocking):", qbErr);
  }

  // ── Step 3: Fetch full order with joins ───────────────────
  const { data: row, error: fetchError } = await supabase
    .from(ORDER_TABLE)
    .select(ORDER_COLUMNS)
    .eq("id", rowId)
    .single();

  if (fetchError || !row) {
    console.error("[addOrder] Fetch after insert failed:", fetchError?.message);
    throw new Error("Order saved but could not be retrieved.");
  }

  revalidatePath(ORDERS_PATH);
  return flattenOrder(row as unknown as RawOrder);
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
