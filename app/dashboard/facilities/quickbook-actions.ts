"use server";

import { createClient } from "@/utils/supabase/server";
import { qbRequest } from "@/utils/quickbooks/client";

interface QBCustomer {
  Id?: string;
  SyncToken?: string;
  DisplayName: string;
  CompanyName?: string;
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: { Line1?: string; City?: string; Country?: string };
  Active: boolean;
}

interface QBCustomerResponse {
  Customer: QBCustomer;
}

// ─── Pure QB helper — creates a customer and returns the ID ───────────────────
// No Supabase interaction. Used by addFacility before inserting.
export async function createQBCustomer(
  name: string,
  phone: string | null,
  isActive: boolean,
): Promise<string | null> {
  try {
    const payload: QBCustomer = {
      DisplayName: name,
      CompanyName: name,
      Active: isActive,
      ...(phone && { PrimaryPhone: { FreeFormNumber: phone } }),
    };

    const created = await qbRequest<QBCustomerResponse>(
      "POST",
      "/customer",
      payload,
    );
    return created?.Customer?.Id ?? null;
  } catch (err) {
    console.error("[createQBCustomer] Error:", err);
    return null;
  }
}

// ─── Sync single facility to QB Customer (used for edit + bulk re-sync) ───────
export async function syncFacilityToQuickBooks(
  facilityId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .select("*")
      .eq("id", facilityId)
      .single();

    if (facilityError || !facility) {
      return { success: false, message: "Facility not found" };
    }

    console.log("[QB Facility] Syncing facility:", facility.name);

    const customerPayload: QBCustomer = {
      DisplayName: facility.name,
      CompanyName: facility.name,
      Active: facility.status === "Active",
      ...(facility.phone && {
        PrimaryPhone: { FreeFormNumber: facility.phone },
      }),
    };

    let qbCustomerId: string;

    if (facility.qb_customer_id) {
      // Update existing QB customer
      console.log(
        "[QB Facility] Updating existing QB customer:",
        facility.qb_customer_id,
      );

      const existing = await qbRequest<QBCustomerResponse>(
        "GET",
        `/customer/${facility.qb_customer_id}`,
      );

      if (!existing?.Customer?.SyncToken) {
        return {
          success: false,
          message: "Failed to fetch existing QB customer",
        };
      }

      const updated = await qbRequest<QBCustomerResponse>("POST", "/customer", {
        ...customerPayload,
        Id: facility.qb_customer_id,
        SyncToken: existing.Customer.SyncToken,
      });

      if (!updated?.Customer?.Id) {
        return { success: false, message: "Failed to update QB customer" };
      }

      qbCustomerId = updated.Customer.Id;
    } else {
      // Create new QB customer
      console.log("[QB Facility] Creating new QB customer");

      const created = await qbRequest<QBCustomerResponse>(
        "POST",
        "/customer",
        customerPayload,
      );

      if (!created?.Customer?.Id) {
        return { success: false, message: "Failed to create QB customer" };
      }

      qbCustomerId = created.Customer.Id;
    }

    // Save QB customer ID back to Supabase
    const { error: updateError } = await supabase
      .from("facilities")
      .update({
        qb_customer_id: qbCustomerId,
        qb_synced_at: new Date().toISOString(),
      })
      .eq("id", facilityId);

    if (updateError) {
      return {
        success: false,
        message: "Customer created in QB but failed to save sync status",
      };
    }

    console.log("[QB Facility] Sync successful! QB Customer ID:", qbCustomerId);

    // NOTE: revalidatePath removed — caller (actions.ts) handles revalidation

    return {
      success: true,
      message: `Successfully synced to QuickBooks (Customer ID: ${qbCustomerId})`,
    };
  } catch (err) {
    console.error("[QB Facility] Unexpected error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error occurred",
    };
  }
}

// ─── Sync ALL facilities to QB ────────────────────────────────────────────────
export async function syncAllFacilitiesToQuickBooks(): Promise<{
  success: number;
  failed: number;
  messages: string[];
}> {
  const supabase = await createClient();

  const { data: facilities, error } = await supabase
    .from("facilities")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error || !facilities) {
    return { success: 0, failed: 0, messages: ["Failed to fetch facilities"] };
  }

  let success = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const facility of facilities) {
    const result = await syncFacilityToQuickBooks(facility.id);
    if (result.success) {
      success++;
      messages.push(`${facility.name}: ${result.message}`);
    } else {
      failed++;
      messages.push(`${facility.name}: ${result.message}`);
    }
  }

  return { success, failed, messages };
}
