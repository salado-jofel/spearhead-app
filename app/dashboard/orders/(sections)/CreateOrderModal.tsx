"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Hash, Building2, Package, DollarSign } from "lucide-react";
import { addOrder } from "../actions";
import { useAppDispatch } from "@/store/hooks";
import { addOrderToStore } from "../(redux)/orders-slice";
import type { Order } from "@/app/(interfaces)/order";
import type { Facility } from "@/app/(interfaces)/facility";
import type { Product } from "@/app/(interfaces)/product";
import { createClient } from "@/utils/supabase/client";

export function CreateOrderModal() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [facilityId, setFacilityId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  // ── Generate next order ID ───────────────────────────────────────
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(3, "0");
    setOrderId(`ORD-${pad(Math.floor(Math.random() * 999) + 1)}`);
  }, [open]);

  // ── Fetch facilities and products for dropdowns ──────────────────
  useEffect(() => {
    if (!open) return;

    const supabase = createClient();

    async function fetchData() {
      const [{ data: fData }, { data: pData }] = await Promise.all([
        supabase.from("facilities").select("id, name").eq("status", "Active"),
        supabase.from("products").select("id, name, price, facility_id"),
      ]);
      setFacilities((fData as Facility[]) ?? []);
      setProducts((pData as Product[]) ?? []);
    }

    fetchData();
  }, [open]);

  // ── Filter products by selected facility ─────────────────────────
  const filteredProducts = facilityId
    ? products.filter((p) => p.facility_id === facilityId)
    : products;

  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit(formData: FormData) {
    formData.set("order_id", orderId);
    formData.set("facility_id", facilityId);
    formData.set("product_id", productId);

    const optimistic: Order = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      order_id: orderId,
      facility_id: facilityId,
      product_id: productId,
      amount: parseFloat(formData.get("amount") as string) || 0,
      status: "Draft",
      facility_name: facilities.find((f) => f.id === facilityId)?.name ?? "—",
      product_name: selectedProduct?.name ?? "—",
    };

    dispatch(addOrderToStore(optimistic));
    setOpen(false);
    setFacilityId("");
    setProductId("");

    await addOrder(formData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2db0b0] hover:bg-[#249191] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Create New Order
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          {/* Order ID */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Hash className="w-4 h-4 text-[#2db0b0]" />
              Order ID
            </label>
            <Input
              name="order_id"
              value={orderId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOrderId(e.target.value)
              }
              placeholder="ORD-001"
              required
            />
          </div>

          {/* Facility */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Building2 className="w-4 h-4 text-[#2db0b0]" />
              Facility
            </label>
            <select
              value={facilityId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setFacilityId(e.target.value);
                setProductId(""); // reset product on facility change
              }}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            >
              <option value="">Select facility</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Package className="w-4 h-4 text-[#2db0b0]" />
              Product
            </label>
            <select
              value={productId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setProductId(e.target.value)
              }
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            >
              <option value="">Select product</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <DollarSign className="w-4 h-4 text-[#2db0b0]" />
              Amount
            </label>
            <Input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={selectedProduct?.price ?? ""}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2db0b0] hover:bg-[#249191] text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
