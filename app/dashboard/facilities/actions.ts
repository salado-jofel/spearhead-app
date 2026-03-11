"use server";

import { revalidatePath } from "next/cache";
import { dbInsert, dbSelect, dbUpdate, dbDelete } from "@/utils/supabase/db";
import type {
  Facility,
  InsertFacilityPayload,
  UpdateFacilityPayload,
} from "@/app/(interfaces)/facility";

const FACILITY_TABLE = "facilities";
const FACILITY_COLUMNS = "id, created_at, name, type, contact, phone, status";
const FACILITY_PATH = "/dashboard/facilities";

/**
 * READ: Fetches all facilities ordered by creation date
 */
export async function getFacilities(): Promise<Facility[]> {
  const { data, error } = await dbSelect<Facility>({
    table: FACILITY_TABLE,
    columns: FACILITY_COLUMNS,
    order: { column: "created_at", ascending: false },
  });

  if (error) {
    console.error("[getFacilities] Supabase error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * CREATE: Adds a new facility and returns the created row
 */
export async function addFacility(formData: FormData): Promise<Facility> {
  try {
    const payload: InsertFacilityPayload = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      contact: formData.get("contact") as string,
      phone: formData.get("phone") as string,
      status: "Active",
    };

    const { error } = await dbInsert<InsertFacilityPayload>({
      table: FACILITY_TABLE,
      payload,
    });

    if (error) {
      console.error("[addFacility] Supabase error:", error.message);
      throw new Error("Failed to create facility");
    }

    // ── Fetch the row we just inserted ──────────────────────
    const { data, error: fetchError } = await dbSelect<Facility>({
      table: FACILITY_TABLE,
      columns: FACILITY_COLUMNS,
      filter: { column: "name", value: payload.name },
      order: { column: "created_at", ascending: false },
    });

    if (fetchError || !data?.[0]) {
      throw new Error("Failed to retrieve created facility");
    }

    revalidatePath(FACILITY_PATH);
    return data[0];
  } catch (err) {
    console.error("[addFacility] Unexpected error:", err);
    throw new Error("An unexpected error occurred while creating the facility");
  }
}

/**
 * UPDATE: Updates an existing facility by id
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

    revalidatePath(FACILITY_PATH);
  } catch (err) {
    console.error("[editFacility] Unexpected error:", err);
    throw new Error("An unexpected error occurred while updating the facility");
  }
}

/**
 * DELETE: Removes a facility and all its associated products
 * (Assuming you set up ON DELETE CASCADE in SQL)
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

    revalidatePath(FACILITY_PATH);
  } catch (err) {
    console.error("[deleteFacility] Unexpected error:", err);
    throw new Error("An unexpected error occurred while deleting the facility");
  }
}
