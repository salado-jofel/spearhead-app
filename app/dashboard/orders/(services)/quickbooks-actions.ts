"use server";

import { createClient } from "@/utils/supabase/server";
import {
  qbRequest,
  qbRequestOrThrow,
  getValidAccessToken,
} from "@/utils/quickbooks/client";
import { requireUser } from "@/utils/auth-guard";

interface QBInvoiceLine {
  Amount: number;
  DetailType: string;
  SalesItemLineDetail: {
    ItemRef: { value: string; name?: string };
    UnitPrice: number;
    Qty: number;
  };
}

interface QBInvoice {
  Id?: string;
  SyncToken?: string;
  DocNumber?: string;
  CustomerRef: { value: string; name?: string };
  Line: QBInvoiceLine[];
  PrivateNote?: string;
}

interface QBInvoiceResponse {
  Invoice: QBInvoice & { Id: string; SyncToken: string };
}

// ── Create invoice — throws on failure ───────────────────────────────────────

export async function createQBInvoiceFromData(params: {
  orderDocNumber: string;
  qbCustomerId: string;
  facilityName: string;
  qbItemId: string;
  productName: string;
  amount: number;
}): Promise<string> {
  const payload: QBInvoice = {
    DocNumber: params.orderDocNumber,
    CustomerRef: { value: params.qbCustomerId, name: params.facilityName },
    Line: [
      {
        Amount: params.amount,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: params.qbItemId, name: params.productName },
          UnitPrice: params.amount,
          Qty: 1,
        },
      },
    ],
    PrivateNote: `Order ${params.orderDocNumber} from Spearhead Medical Dashboard`,
  };

  const created = await qbRequestOrThrow<QBInvoiceResponse>(
    "POST",
    "/invoice",
    payload,
  );

  if (!created?.Invoice?.Id) {
    throw new Error("[createQBInvoiceFromData] QB returned no Invoice ID.");
  }

  return created.Invoice.Id;
}

// ── Sync single order invoice ─────────────────────────────────────────────────

export async function createQuickBooksInvoice(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        facilities:facility_id (id, name, qb_customer_id),
        products:product_id    (id, name, qb_item_id)
      `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { success: false, message: "Order not found" };
    }
    if (!order.facilities?.qb_customer_id) {
      return { success: false, message: "Facility not synced to QuickBooks" };
    }
    if (!order.products?.qb_item_id) {
      return { success: false, message: "Product not synced to QuickBooks" };
    }

    const qbInvoiceId = await createQBInvoiceFromData({
      orderDocNumber: order.order_id,
      qbCustomerId: order.facilities.qb_customer_id,
      facilityName: order.facilities.name,
      qbItemId: order.products.qb_item_id,
      productName: order.products.name,
      amount: parseFloat(order.amount) || 0,
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        qb_invoice_id: qbInvoiceId,
        qb_invoice_status: "draft",
        qb_synced_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return {
        success: false,
        message: "Invoice created in QB but failed to save sync status",
      };
    }

    return {
      success: true,
      message: `Invoice created in QuickBooks (ID: ${qbInvoiceId})`,
    };
  } catch (err) {
    console.error("[QB Invoice] Unexpected error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error occurred",
    };
  }
}

// ── Get QB Invoice status ─────────────────────────────────────────────────────

export async function getQuickBooksInvoiceStatus(
  qbInvoiceId: string,
): Promise<string | null> {
  try {
    const result = await qbRequest<QBInvoiceResponse>(
      "GET",
      `/invoice/${qbInvoiceId}`,
    );
    if (!result?.Invoice) return null;

    const invoice = result.Invoice as QBInvoice & {
      Balance?: number;
      TotalAmt?: number;
    };

    const balance = invoice.Balance ?? 0;
    const total = invoice.TotalAmt ?? 0;

    if (balance === 0 && total > 0) return "paid";
    if (balance > 0) return "unpaid";
    return "draft";
  } catch (err) {
    console.error("[QB Invoice] getStatus error:", err);
    return null;
  }
}

// ── Void QB Invoice ───────────────────────────────────────────────────────────
// Accepts raw qbInvoiceId directly.
// DB status update (qb_invoice_status) is the caller's responsibility.

export async function voidQuickBooksInvoice(
  qbInvoiceId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await qbRequest<QBInvoiceResponse>(
      "GET",
      `/invoice/${qbInvoiceId}`,
    );
    if (!existing?.Invoice?.SyncToken) {
      return { success: false, message: "Failed to fetch QB invoice" };
    }

    const auth = await getValidAccessToken();
    if (!auth) return { success: false, message: "No QB connection" };

    const QB_BASE_URL =
      process.env.QB_ENVIRONMENT === "production"
        ? "https://quickbooks.api.intuit.com"
        : "https://sandbox-quickbooks.api.intuit.com";

    const response = await fetch(
      `${QB_BASE_URL}/v3/company/${auth.realmId}/invoice?operation=void&minorversion=65`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Id: qbInvoiceId,
          SyncToken: existing.Invoice.SyncToken,
        }),
      },
    );

    if (!response.ok) {
      return { success: false, message: "Failed to void QB invoice" };
    }

    return { success: true, message: "Invoice voided in QuickBooks" };
  } catch (err) {
    console.error("[QB Invoice] voidInvoice error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error",
    };
  }
}

// ── Sync ALL unsynced orders ──────────────────────────────────────────────────

export async function syncAllOrdersToQuickBooks(): Promise<{
  success: number;
  failed: number;
  messages: string[];
}> {
  await requireUser();

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_id")
    .is("qb_invoice_id", null);

  if (error || !orders) {
    return {
      success: 0,
      failed: 1,
      messages: ["Failed to fetch unsynced orders"],
    };
  }

  const settled = await Promise.allSettled(
    orders.map((o) =>
      createQuickBooksInvoice(o.id).then((r) => ({
        order_id: o.order_id,
        result: r,
      })),
    ),
  );

  let success = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      const { order_id, result } = outcome.value;
      result.success ? success++ : failed++;
      messages.push(`${order_id}: ${result.message}`);
    } else {
      failed++;
      messages.push(`Unknown: ${String(outcome.reason)}`);
    }
  }

  return { success, failed, messages };
}
