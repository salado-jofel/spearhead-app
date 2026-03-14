"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbInsert, dbUpdate, dbDelete, getSupabaseClient } from "@/utils/supabase/db";
import type {
  Product,
  InsertProductPayload,
  UpdateProductPayload,
} from "@/app/(interfaces)/product";
import { createQBItem, syncProductToQuickBooks } from "./quickbooks-actions";

const PRODUCT_TABLE = "products";
const PRODUCT_COLUMNS = "id, created_at, name, price, qb_item_id, qb_synced_at";
const PRODUCTS_PATH = "/dashboard/products";

// ─── READ ─────────────────────────────────────────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await dbSelect<Product>({
    table: PRODUCT_TABLE,
    columns: PRODUCT_COLUMNS,
    order: { column: "created_at", ascending: false },
  });

  if (error) {
    console.error("[getAllProducts] Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

export async function addProduct(formData: FormData): Promise<Product> {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string) || 0;

  // ── Step 1: Save to DB first — always ────────────────────
  const { data: product, error: insertError } = await dbInsert<
    InsertProductPayload,
    Product
  >({
    table: PRODUCT_TABLE,
    payload: { name, price },
    select: PRODUCT_COLUMNS,
  });

  if (insertError || !product) {
    console.error("[addProduct] DB insert error:", insertError);
    throw new Error("Failed to save product to database.");
  }

  // ── Step 2: Try QB sync — non-blocking ───────────────────
  try {
    const qbItemId = await createQBItem(name, price);

    if (qbItemId) {
      const supabase = await getSupabaseClient();
      await supabase
        .from(PRODUCT_TABLE)
        .update({
          qb_item_id: qbItemId,
          qb_synced_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      // Reflect QB fields on the returned object
      product.qb_item_id = qbItemId;
      product.qb_synced_at = new Date().toISOString();
    } else {
      console.warn("[addProduct] QB sync skipped — no QB connection.");
    }
  } catch (qbErr) {
    // No QB connected yet — product is already saved, ignore
    console.warn("[addProduct] QB auto-sync failed (non-blocking):", qbErr);
  }

  revalidatePath(PRODUCTS_PATH);
  return product;
}


// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function editProduct(productId: string, formData: FormData) {
  try {
    const payload: UpdateProductPayload = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string) || 0,
    };

    const { error } = await dbUpdate<UpdateProductPayload>({
      table: PRODUCT_TABLE,
      payload,
      column: "id",
      value: productId,
    });

    if (error) {
      console.error("[editProduct] Supabase error:", error.message);
      throw new Error("Failed to update product");
    }

    // Non-blocking QB sync for edits — revalidatePath is handled below
    syncProductToQuickBooks(productId).catch((err) => {
      console.error("[editProduct] QB sync error (non-blocking):", err);
    });

    revalidatePath(PRODUCTS_PATH);
  } catch (err) {
    console.error("[editProduct] Unexpected error:", err);
    throw new Error("An unexpected error occurred while updating the product");
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteProduct(productId: string) {
  try {
    const { error } = await dbDelete({
      table: PRODUCT_TABLE,
      column: "id",
      value: productId,
    });

    if (error) {
      console.error("[deleteProduct] Supabase error:", error.message);
      throw new Error("Failed to delete product");
    }

    revalidatePath(PRODUCTS_PATH);
  } catch (err) {
    console.error("[deleteProduct] Unexpected error:", err);
    throw new Error("An unexpected error occurred while deleting the product");
  }
}
