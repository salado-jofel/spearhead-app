"use server";

import { createClient } from "@/utils/supabase/server";
import { qbRequest } from "@/utils/quickbooks/client";

interface QBItem {
  Id?: string;
  SyncToken?: string;
  Name: string;
  Description?: string;
  UnitPrice: number;
  Type: string;
  IncomeAccountRef: { value: string; name?: string };
  Active: boolean;
}

interface QBItemResponse {
  Item: QBItem;
}

// ─── Get income account ref ───────────────────────────────────────────────────
async function getIncomeAccountRef(): Promise<{
  value: string;
  name: string;
} | null> {
  const auth = await import("@/utils/quickbooks/client").then((m) =>
    m.getValidAccessToken(),
  );

  if (!auth) return null;

  const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || "sandbox";
  const QB_BASE_URL =
    QB_ENVIRONMENT === "sandbox"
      ? "https://sandbox-quickbooks.api.intuit.com"
      : "https://quickbooks.api.intuit.com";

  const query = `SELECT * FROM Account WHERE AccountType = 'Income' MAXRESULTS 1`;
  const url = `${QB_BASE_URL}/v3/company/${auth.realmId}/query?query=${encodeURIComponent(query)}&minorversion=65`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error(
      "[QB Product] Account query failed:",
      response.status,
      await response.text(),
    );
    return null;
  }

  const data = await response.json();
  const accounts = data?.QueryResponse?.Account;

  if (accounts && accounts.length > 0) {
    return { value: accounts[0].Id, name: accounts[0].Name };
  }

  return null;
}

// ─── Pure QB helper — creates a QB item and returns the ID ───────────────────
// No Supabase interaction. Used by addProduct before inserting.
export async function createQBItem(
  name: string,
  price: number,
): Promise<string | null> {
  try {
    const incomeAccountRef = await getIncomeAccountRef();

    if (!incomeAccountRef) {
      console.error("[createQBItem] No income account found");
      return null;
    }

    const payload: QBItem = {
      Name: name,
      Description: name,
      UnitPrice: price,
      Type: "Service",
      IncomeAccountRef: incomeAccountRef,
      Active: true,
    };

    const created = await qbRequest<QBItemResponse>("POST", "/item", payload);
    return created?.Item?.Id ?? null;
  } catch (err) {
    console.error("[createQBItem] Error:", err);
    return null;
  }
}

// ─── Sync single product to QB Item (used for edit + bulk re-sync) ────────────
export async function syncProductToQuickBooks(
  productId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return { success: false, message: "Product not found" };
    }

    console.log("[QB Product] Syncing product:", product.name);

    const incomeAccountRef = await getIncomeAccountRef();

    if (!incomeAccountRef) {
      return {
        success: false,
        message: "No income account found in QuickBooks",
      };
    }

    const itemPayload: QBItem = {
      Name: product.name,
      Description: product.name,
      UnitPrice: parseFloat(product.price) || 0,
      Type: "Service",
      IncomeAccountRef: incomeAccountRef,
      Active: true,
    };

    let qbItemId: string;

    if (product.qb_item_id) {
      console.log(
        "[QB Product] Updating existing QB item:",
        product.qb_item_id,
      );

      const existing = await qbRequest<QBItemResponse>(
        "GET",
        `/item/${product.qb_item_id}`,
      );

      if (!existing?.Item?.SyncToken) {
        return { success: false, message: "Failed to fetch existing QB item" };
      }

      const updated = await qbRequest<QBItemResponse>("POST", "/item", {
        ...itemPayload,
        Id: product.qb_item_id,
        SyncToken: existing.Item.SyncToken,
      });

      if (!updated?.Item?.Id) {
        return { success: false, message: "Failed to update QB item" };
      }

      qbItemId = updated.Item.Id;
    } else {
      console.log("[QB Product] Creating new QB item");

      const created = await qbRequest<QBItemResponse>(
        "POST",
        "/item",
        itemPayload,
      );

      if (!created?.Item?.Id) {
        return { success: false, message: "Failed to create QB item" };
      }

      qbItemId = created.Item.Id;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        qb_item_id: qbItemId,
        qb_synced_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      return {
        success: false,
        message: "Item created in QB but failed to save sync status",
      };
    }

    console.log("[QB Product] Sync successful! QB Item ID:", qbItemId);

    // NOTE: revalidatePath removed — caller (actions.ts) handles revalidation

    return {
      success: true,
      message: `Successfully synced to QuickBooks (Item ID: ${qbItemId})`,
    };
  } catch (err) {
    console.error("[QB Product] Unexpected error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error occurred",
    };
  }
}

// ─── Sync ALL products to QB ──────────────────────────────────────────────────
export async function syncAllProductsToQuickBooks(): Promise<{
  success: number;
  failed: number;
  messages: string[];
}> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error || !products) {
    return { success: 0, failed: 0, messages: ["Failed to fetch products"] };
  }

  let success = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const product of products) {
    const result = await syncProductToQuickBooks(product.id);
    if (result.success) {
      success++;
      messages.push(`✅ ${product.name}: ${result.message}`);
    } else {
      failed++;
      messages.push(`❌ ${product.name}: ${result.message}`);
    }
  }

  return { success, failed, messages };
}
