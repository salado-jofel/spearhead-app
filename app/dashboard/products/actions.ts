"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbInsert, dbUpdate, dbDelete } from "@/utils/supabase/db";
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

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function addProduct(formData: FormData): Promise<Product> {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;

    // ── Step 1: Create QB Item FIRST ─────────────────────────
    console.log("[addProduct] Creating QB item for:", name);
    const qbItemId = await createQBItem(name, price);

    if (!qbItemId) {
      throw new Error(
        "Failed to sync product to QuickBooks. Product not saved.",
      );
    }

    console.log("[addProduct] QB item created:", qbItemId);

    // ── Step 2: Insert product WITH qb fields already set ────
    const payload: InsertProductPayload & {
      qb_item_id: string;
      qb_synced_at: string;
    } = {
      name,
      price,
      qb_item_id: qbItemId,
      qb_synced_at: new Date().toISOString(),
    };

    const { data, error } = await dbInsert<typeof payload, Product>({
      table: PRODUCT_TABLE,
      payload,
      select: PRODUCT_COLUMNS,
    });

    if (error || !data) {
      console.error("[addProduct] Supabase error:", JSON.stringify(error));
      throw new Error("QB item created but failed to save product to database");
    }

    revalidatePath(PRODUCTS_PATH);
    return data;
  } catch (err) {
    console.error("[addProduct] Unexpected error:", err);
    throw err instanceof Error
      ? err
      : new Error("An unexpected error occurred while creating the product");
  }
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
