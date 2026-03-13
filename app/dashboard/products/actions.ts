"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbInsert, dbUpdate, dbDelete } from "@/utils/supabase/db";
import type {
  Product,
  InsertProductPayload,
  UpdateProductPayload,
} from "@/app/(interfaces)/product";

const PRODUCT_TABLE = "products";
const PRODUCT_COLUMNS = "id, created_at, name, price";
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
  const payload: InsertProductPayload = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string) || 0,
  };

  const { data, error } = await dbInsert<InsertProductPayload, Product>({
    table: PRODUCT_TABLE,
    payload,
    select: PRODUCT_COLUMNS,
  });

  if (error || !data) {
    console.error("[addProduct] Supabase error:", JSON.stringify(error));
    throw new Error(error?.message ?? "Failed to add product");
  }

  revalidatePath(PRODUCTS_PATH);
  return data;
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
