"use server";

import { revalidatePath } from "next/cache";
import { dbInsert, dbSelect, dbUpdate, dbDelete, getSupabaseClient } from "@/utils/supabase/db";
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
  const supabase = await getSupabaseClient();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const contact = formData.get("contact") as string;
  const phone = formData.get("phone") as string;

  // ── Step 1: Save to DB first — always ────────────────────
  const { data: insertedRow, error: insertError } = await supabase
    .from(FACILITY_TABLE)
    .insert({ name, type, contact, phone, status: "Active" })
    .select("id")
    .single();

  if (insertError || !insertedRow) {
    console.error("[addFacility] DB insert error:", insertError?.message);
    throw new Error("Failed to save facility to database.");
  }

  const rowId = insertedRow.id as string;

  // ── Step 2: Try QB sync — non-blocking ───────────────────
  try {
    const qbCustomerId = await createQBCustomer(name, phone, true);

    if (qbCustomerId) {
      await supabase
        .from(FACILITY_TABLE)
        .update({
          qb_customer_id: qbCustomerId,
          qb_synced_at: new Date().toISOString(),
        })
        .eq("id", rowId);
    } else {
      console.warn("[addFacility] QB sync skipped — no QB connection.");
    }
  } catch (qbErr) {
    // No QB connected yet or sync failed — facility is already saved, ignore
    console.warn("[addFacility] QB auto-sync failed (non-blocking):", qbErr);
  }

  // ── Step 3: Fetch full facility row ──────────────────────
  const { data: row, error: fetchError } = await supabase
    .from(FACILITY_TABLE)
    .select(FACILITY_COLUMNS)
    .eq("id", rowId)
    .single();

  if (fetchError || !row) {
    console.error(
      "[addFacility] Fetch after insert failed:",
      fetchError?.message,
    );
    throw new Error("Facility saved but could not be retrieved.");
  }

  revalidatePath(FACILITY_PATH);
  return row as Facility;
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
