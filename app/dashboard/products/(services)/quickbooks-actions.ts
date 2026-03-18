"use server";

import { createClient } from "@/utils/supabase/server";
import { qbRequest, qbRequestOrThrow } from "@/utils/quickbooks/client";
import { getValidAccessToken } from "@/utils/quickbooks/client";
import { requireUser } from "@/utils/auth-guard";

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
  Item: QBItem & { Id: string; SyncToken: string };
}

// ── Income account ref ────────────────────────────────────────────────────────

async function getIncomeAccountRef(): Promise<{
  value: string;
  name: string;
} | null> {
  const auth = await getValidAccessToken();
  if (!auth) return null;

  const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || "sandbox";
  const QB_BASE_URL =
    QB_ENVIRONMENT === "sandbox"
      ? "https://sandbox-quickbooks.api.intuit.com"
      : "https://quickbooks.api.intuit.com";

  const query = `SELECT * FROM Account WHERE AccountType = 'Income' MAXRESULTS 1`;
  const url = `${QB_BASE_URL}/v3/company/${auth.realmId}/query?query=${encodeURIComponent(query)}&minorversion=65`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error("[QB Product] Account query failed:", response.status);
    return null;
  }

  const data = await response.json();
  const accounts = data?.QueryResponse?.Account;
  if (!accounts?.length) return null;

  return { value: accounts[0].Id, name: accounts[0].Name };
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createQBItem(
  name: string,
  price: number,
): Promise<string> {
  const incomeAccountRef = await getIncomeAccountRef();
  if (!incomeAccountRef) {
    throw new Error("[createQBItem] No income account found in QuickBooks.");
  }

  const res = await qbRequestOrThrow<QBItemResponse>("POST", "/item", {
    Name: name,
    Description: name,
    UnitPrice: price,
    Type: "Service",
    IncomeAccountRef: incomeAccountRef,
    Active: true,
  });

  if (!res?.Item?.Id) {
    throw new Error("[createQBItem] QB returned no Item ID.");
  }

  return res.Item.Id;
}
// ── Deactivate ────────────────────────────────────────────────────────────────

export async function deactivateQBItem(qbItemId: string): Promise<void> {
  // Fetch current SyncToken
  const existing = await qbRequestOrThrow<QBItemResponse>(
    "GET",
    `/item/${qbItemId}`,
  );

  await qbRequestOrThrow<QBItemResponse>("POST", "/item", {
    Id: qbItemId,
    SyncToken: existing.Item.SyncToken,
    Name: existing.Item.Name,
    UnitPrice: existing.Item.UnitPrice,
    Type: existing.Item.Type,
    IncomeAccountRef: existing.Item.IncomeAccountRef,
    Active: false,
  });
}

// ── Reactivate ────────────────────────────────────────────────────────────────

export async function reactivateQBItem(
  qbItemId: string,
  name: string,
  price: number,
): Promise<void> {
  const existing = await qbRequestOrThrow<QBItemResponse>(
    "GET",
    `/item/${qbItemId}`,
  );

  const incomeAccountRef = await getIncomeAccountRef();
  if (!incomeAccountRef)
    throw new Error("No income account found for reactivation.");

  await qbRequestOrThrow<QBItemResponse>("POST", "/item", {
    Id: qbItemId,
    SyncToken: existing.Item.SyncToken,
    Name: name,
    Description: name,
    UnitPrice: price,
    Type: "Service",
    IncomeAccountRef: incomeAccountRef,
    Active: true,
  });
}

// ── Sync single product ───────────────────────────────────────────────────────
// Accepts optional override payload so editProduct can pass new values
// before the DB is updated (same pattern as facility's updateQBCustomer)

export async function syncProductToQuickBooks(
  productId: string,
  override?: { name: string; price: number },
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, price, qb_item_id, qb_synced_at")
      .eq("id", productId)
      .single();

    if (error || !product)
      return { success: false, message: "Product not found" };

    const name = override?.name ?? product.name;
    const price = override?.price ?? parseFloat(product.price) ?? 0;

    const incomeAccountRef = await getIncomeAccountRef();
    if (!incomeAccountRef) {
      return {
        success: false,
        message: "No income account found in QuickBooks",
      };
    }

    const itemPayload = {
      Name: name,
      Description: name,
      UnitPrice: price,
      Type: "Service",
      IncomeAccountRef: incomeAccountRef,
      Active: true,
    };

    let qbItemId: string;

    if (product.qb_item_id) {
      // Update existing
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
      // Create new
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

    // Update DB sync metadata
    await supabase
      .from("products")
      .update({
        qb_item_id: qbItemId,
        qb_synced_at: new Date().toISOString(),
      })
      .eq("id", productId);

    return {
      success: true,
      message: `Synced to QuickBooks (Item ID: ${qbItemId})`,
    };
  } catch (err) {
    console.error("[syncProductToQuickBooks] Error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error",
    };
  }
}

// ── Sync ALL products ─────────────────────────────────────────────────────────

export async function syncAllProductsToQuickBooks(): Promise<{
  success: number;
  failed: number;
  messages: string[];
}> {
  await requireUser();

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error || !products) {
    return { success: 0, failed: 0, messages: ["Failed to fetch products"] };
  }

  const settled = await Promise.allSettled(
    products.map((p) =>
      syncProductToQuickBooks(p.id).then((r) => ({ name: p.name, result: r })),
    ),
  );

  let success = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      const { name, result } = outcome.value;
      result.success ? success++ : failed++;
      messages.push(`${name}: ${result.message}`);
    } else {
      failed++;
      messages.push(`Unknown: ${String(outcome.reason)}`);
    }
  }

  return { success, failed, messages };
}
