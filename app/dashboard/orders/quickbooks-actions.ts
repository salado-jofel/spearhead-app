"use server";

import { createClient } from "@/utils/supabase/server";
import { qbRequest, getValidAccessToken } from "@/utils/quickbooks/client";
import { revalidatePath } from "next/cache";

interface QBInvoiceLine {
  Amount: number;
  DetailType: string;
  SalesItemLineDetail: {
    ItemRef: {
      value: string;
      name?: string;
    };
    UnitPrice: number;
    Qty: number;
  };
}

interface QBInvoice {
  Id?: string;
  SyncToken?: string;
  DocNumber?: string;
  CustomerRef: {
    value: string;
    name?: string;
  };
  Line: QBInvoiceLine[];
  PrivateNote?: string;
}

interface QBInvoiceResponse {
  Invoice: QBInvoice;
}

// ─── Create QB Invoice for an order ──────────────────────────────────────────
export async function createQuickBooksInvoice(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // 1. Get order with facility and product details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        facilities:facility_id (
          id,
          name,
          qb_customer_id
        ),
        products:product_id (
          id,
          name,
          qb_item_id
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { success: false, message: "Order not found" };
    }

    console.log("[QB Invoice] Creating invoice for order:", order.order_id);

    // 2. Check if facility is synced to QB
    if (!order.facilities?.qb_customer_id) {
      return {
        success: false,
        message:
          "Facility not synced to QuickBooks. Please sync the facility first.",
      };
    }

    // 3. Check if product is synced to QB
    if (!order.products?.qb_item_id) {
      return {
        success: false,
        message:
          "Product not synced to QuickBooks. Please sync the product first.",
      };
    }

    // 4. Build QB Invoice payload
    const invoicePayload: QBInvoice = {
      DocNumber: order.order_id,
      CustomerRef: {
        value: order.facilities.qb_customer_id,
        name: order.facilities.name,
      },
      Line: [
        {
          Amount: parseFloat(order.amount) || 0,
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: {
              value: order.products.qb_item_id,
              name: order.products.name,
            },
            UnitPrice: parseFloat(order.amount) || 0,
            Qty: 1,
          },
        },
      ],
      PrivateNote: `Order ${order.order_id} from Spearhead Medical Dashboard`,
    };

    // 5. Create invoice in QB
    const created = await qbRequest<QBInvoiceResponse>(
      "POST",
      "/invoice",
      invoicePayload,
    );

    if (!created?.Invoice?.Id) {
      return { success: false, message: "Failed to create QB invoice" };
    }

    const qbInvoiceId = created.Invoice.Id;
    console.log("[QB Invoice] Created invoice ID:", qbInvoiceId);

    // 6. Save QB invoice ID back to Supabase
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        qb_invoice_id: qbInvoiceId,
        qb_invoice_status: "draft",
        qb_synced_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[QB Invoice] Supabase update error:", updateError);
      return {
        success: false,
        message: "Invoice created in QB but failed to save sync status",
      };
    }

    revalidatePath("/dashboard/orders");

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

// ─── Get QB Invoice status ────────────────────────────────────────────────────
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
      EmailStatus?: string;
    };

    const balance = (invoice as { Balance?: number }).Balance ?? 0;
    const total = (invoice as { TotalAmt?: number }).TotalAmt ?? 0;

    if (balance === 0 && total > 0) return "paid";
    if (balance > 0) return "unpaid";
    return "draft";
  } catch (err) {
    console.error("[QB Invoice] getStatus error:", err);
    return null;
  }
}

// ─── Void QB Invoice ──────────────────────────────────────────────────────────
export async function voidQuickBooksInvoice(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("qb_invoice_id")
      .eq("id", orderId)
      .single();

    if (error || !order?.qb_invoice_id) {
      return { success: false, message: "No QB invoice found for this order" };
    }

    // Get current invoice to get SyncToken
    const existing = await qbRequest<QBInvoiceResponse>(
      "GET",
      `/invoice/${order.qb_invoice_id}`,
    );

    if (!existing?.Invoice?.SyncToken) {
      return { success: false, message: "Failed to fetch QB invoice" };
    }

    // Void the invoice
    const auth = await getValidAccessToken();
    if (!auth) return { success: false, message: "No QB connection" };

    const QB_ENVIRONMENT = process.env.QB_ENVIRONMENT || "sandbox";
    const QB_BASE_URL =
      QB_ENVIRONMENT === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com";

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
          Id: order.qb_invoice_id,
          SyncToken: existing.Invoice.SyncToken,
        }),
      },
    );

    if (!response.ok) {
      return { success: false, message: "Failed to void QB invoice" };
    }

    await supabase
      .from("orders")
      .update({ qb_invoice_status: "void" })
      .eq("id", orderId);

    revalidatePath("/dashboard/orders");

    return { success: true, message: "Invoice voided in QuickBooks" };
  } catch (err) {
    console.error("[QB Invoice] voidInvoice error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unexpected error occurred",
    };
  }
}
