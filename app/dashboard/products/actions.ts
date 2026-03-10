"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbUpdate, dbDelete } from "@/utils/supabase/db";
import type { Product, UpdateProductPayload } from "@/app/(interfaces)/product";

const PRODUCT_TABLE = "products";
const PRODUCT_COLUMNS =
  "id, created_at, name, price, facility_id, facilities(name)";
const PRODUCTS_PATH = "/dashboard/products";

// ─── Helper: flatten joined facility name ─────────────────────────────────────
function flattenProduct(row: {
  id: string;
  created_at: string;
  name: string;
  price: number;
  facility_id: string;
  facilities: { name: string } | null;
}): Product {
  return {
    id: row.id,
    created_at: row.created_at,
    name: row.name,
    price: row.price,
    facility_id: row.facility_id,
    facility_name: row.facilities?.name ?? "—",
  };
}

/**
 * READ: Fetches ALL products across all facilities
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await dbSelect<{
    id: string;
    created_at: string;
    name: string;
    price: number;
    facility_id: string;
    facilities: { name: string } | null;
  }>({
    table: PRODUCT_TABLE,
    columns: PRODUCT_COLUMNS,
    order: { column: "created_at", ascending: false },
  });

  if (error) {
    console.error("[getAllProducts] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map(flattenProduct);
}

/**
 * UPDATE: Updates a product by id
 */
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

/**
 * DELETE: Deletes a product by id
 */
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
