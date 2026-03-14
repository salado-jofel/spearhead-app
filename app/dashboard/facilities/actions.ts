"use server";

import { revalidatePath } from "next/cache";
import { dbInsert, dbSelect, dbUpdate, dbDelete } from "@/utils/supabase/db";
import type {
  Facility,
  InsertFacilityPayload,
  UpdateFacilityPayload,
} from "@/app/(interfaces)/facility";
import {
  createQBCustomer,
  syncFacilityToQuickBooks,
} from "./quickbook-actions";

const FACILITY_TABLE = "facilities";
const FACILITY_COLUMNS =
  "id, created_at, name, type, contact, phone, status, qb_customer_id, qb_synced_at";
const FACILITY_PATH = "/dashboard/facilities";

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

export async function addFacility(formData: FormData): Promise<Facility> {
  try {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const contact = formData.get("contact") as string;
    const phone = formData.get("phone") as string;

    // ── Step 1: Create QB Customer FIRST ────────────────────
    console.log("[addFacility] Creating QB customer for:", name);
    const qbCustomerId = await createQBCustomer(name, phone, true);

    if (!qbCustomerId) {
      throw new Error(
        "Failed to sync facility to QuickBooks. Facility not saved.",
      );
    }

    console.log("[addFacility] QB customer created:", qbCustomerId);

    // ── Step 2: Insert facility WITH qb fields already set ──
    const payload: InsertFacilityPayload & {
      qb_customer_id: string;
      qb_synced_at: string;
    } = {
      name,
      type,
      contact,
      phone,
      status: "Active",
      qb_customer_id: qbCustomerId,
      qb_synced_at: new Date().toISOString(),
    };

    const { error } = await dbInsert({ table: FACILITY_TABLE, payload });

    if (error) {
      console.error("[addFacility] Supabase error:", error.message);
      throw new Error(
        "QB customer created but failed to save facility to database",
      );
    }

    // ── Step 3: Fetch the inserted row ───────────────────────
    const { data, error: fetchError } = await dbSelect<Facility>({
      table: FACILITY_TABLE,
      columns: FACILITY_COLUMNS,
      filter: { column: "name", value: name },
      order: { column: "created_at", ascending: false },
    });

    if (fetchError || !data?.[0]) {
      throw new Error("Facility created but failed to retrieve it");
    }

    revalidatePath(FACILITY_PATH);
    return data[0];
  } catch (err) {
    console.error("[addFacility] Unexpected error:", err);
    throw err instanceof Error
      ? err
      : new Error("An unexpected error occurred while creating the facility");
  }
}

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

    // Non-blocking QB sync for edits — revalidatePath is handled below
    syncFacilityToQuickBooks(id).catch((err) => {
      console.error("[editFacility] QB sync error (non-blocking):", err);
    });

    revalidatePath(FACILITY_PATH);
  } catch (err) {
    console.error("[editFacility] Unexpected error:", err);
    throw new Error("An unexpected error occurred while updating the facility");
  }
}

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
