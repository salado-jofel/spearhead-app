"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbUpdate, dbDelete, dbInsert } from "@/utils/supabase/db";
import type {
  Facility,
  UpdateFacilityPayload,
} from "@/app/(interfaces)/facility";
import type {
  Product,
  InsertProductPayload,
  UpdateProductPayload,
} from "@/app/(interfaces)/product";

const FACILITY_TABLE = "facilities";
const FACILITY_COLUMNS = "id, created_at, name, type, contact, phone, status";

const PRODUCT_TABLE = "products";
const PRODUCT_COLUMNS =
  "id, created_at, name, price, facility_id, facilities(name)";

function getFacilityPath(id: string) {
  return `/dashboard/facilities/${id}`;
}

// ─── FACILITY ─────────────────────────────────────────────────────────────────

/**
 * READ: Fetches a single facility by id
 */
export async function getFacilityById(id: string): Promise<Facility | null> {
  const { data, error } = await dbSelect<Facility>({
    table: FACILITY_TABLE,
    columns: FACILITY_COLUMNS,
    filter: { column: "id", value: id },
  });

  if (error) {
    console.error("[getFacilityById] Supabase error:", error.message);
    return null;
  }

  return data?.[0] ?? null;
}

/**
 * UPDATE: Updates a facility by id
 */
export async function editFacility(id: string, formData: FormData) {
  try {
    const payload: UpdateFacilityPayload = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      contact: formData.get("contact") as string,
      phone: formData.get("phone") as string,
      status: formData.get("status") as string,
    };

    const { error } = await dbUpdate<UpdateFacilityPayload>({
      table: FACILITY_TABLE,
      payload,
      column: "id",
      value: id,
    });

    if (error) {
      console.error("[editFacility] Supabase error:", error.message);
      throw new Error("Failed to update facility");
    }

    revalidatePath(getFacilityPath(id));
    revalidatePath("/dashboard/facilities");
  } catch (err) {
    console.error("[editFacility] Unexpected error:", err);
    throw new Error("An unexpected error occurred while updating the facility");
  }
}

/**
 * DELETE: Deletes a facility by id
 */
export async function deleteFacility(id: string) {
  try {
    const { error } = await dbDelete({
      table: FACILITY_TABLE,
      column: "id",
      value: id,
    });

    if (error) {
      console.error("[deleteFacility] Supabase error:", error.message);
      throw new Error("Failed to delete facility");
    }

    revalidatePath("/dashboard/facilities");
  } catch (err) {
    console.error("[deleteFacility] Unexpected error:", err);
    throw new Error("An unexpected error occurred while deleting the facility");
  }
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

/**
 * READ: Fetches all products for a facility
 */
export async function getProductsByFacilityId(
  facilityId: string,
): Promise<Product[]> {
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
    filter: { column: "facility_id", value: facilityId },
    order: { column: "created_at", ascending: false },
  });

  if (error) {
    console.error("[getProductsByFacilityId] Supabase error:", error.message);
    return [];
  }

  // ── Flatten joined facility name into product ───────────────────────────
  return (data ?? []).map((row) => ({
    id: row.id,
    created_at: row.created_at,
    name: row.name,
    price: row.price,
    facility_id: row.facility_id,
    facility_name: row.facilities?.name ?? "—",
  }));
}

/**
 * CREATE: Adds a new product to a facility
 */
export async function addProduct(
  facilityId: string,
  formData: FormData,
): Promise<Product> {
  try {
    const payload: InsertProductPayload = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      facility_id: facilityId,
    };

    const { error } = await dbInsert<InsertProductPayload>({
      table: PRODUCT_TABLE,
      payload,
    });

    if (error) {
      console.error("[addProduct] Supabase error:", error.message);
      throw new Error("Failed to add product");
    }

    // ── Fetch the row we just inserted ──────────────────────
    const { data, error: fetchError } = await dbSelect<{
      id: string;
      created_at: string;
      name: string;
      price: number;
      facility_id: string;
      facilities: { name: string } | null;
    }>({
      table: PRODUCT_TABLE,
      columns: PRODUCT_COLUMNS,
      filter: { column: "facility_id", value: facilityId },
      order: { column: "created_at", ascending: false },
    });

    if (fetchError || !data?.[0]) {
      throw new Error("Failed to retrieve created product");
    }

    const row = data[0];

    revalidatePath(getFacilityPath(facilityId));

    return {
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      price: row.price,
      facility_id: row.facility_id,
      facility_name: row.facilities?.name ?? "—",
    };
  } catch (err) {
    console.error("[addProduct] Unexpected error:", err);
    throw new Error("An unexpected error occurred while adding the product");
  }
}

/**
 * UPDATE: Updates a product by id
 */
export async function editProduct(
  productId: string,
  facilityId: string,
  formData: FormData,
) {
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

    revalidatePath(getFacilityPath(facilityId));
  } catch (err) {
    console.error("[editProduct] Unexpected error:", err);
    throw new Error("An unexpected error occurred while updating the product");
  }
}

/**
 * DELETE: Deletes a product by id
 */
export async function deleteProduct(productId: string, facilityId: string) {
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

    revalidatePath(getFacilityPath(facilityId));
  } catch (err) {
    console.error("[deleteProduct] Unexpected error:", err);
    throw new Error("An unexpected error occurred while deleting the product");
  }
}
