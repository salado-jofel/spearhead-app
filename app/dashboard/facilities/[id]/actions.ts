"use server";

import { revalidatePath } from "next/cache";
import { dbSelect, dbUpdate, dbDelete, dbInsert } from "@/utils/supabase/db";
import type {
  Facility,
  UpdateFacilityPayload,
} from "@/app/(interfaces)/facility";

const FACILITY_TABLE = "facilities";
const FACILITY_COLUMNS = "id, created_at, name, type, contact, phone, status";

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
