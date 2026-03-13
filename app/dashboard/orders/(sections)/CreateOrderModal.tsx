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
import { addOrder, getActiveFacilities, getAllProducts } from "../actions";
import { useAppDispatch } from "@/store/hooks";
import { addOrderToStore } from "../(redux)/orders-slice";
import type { Order } from "@/app/(interfaces)/order";
import type { Facility } from "@/app/(interfaces)/facility";
import type { Product } from "@/app/(interfaces)/product";
import SubmitButton from "@/app/(components)/SubmitButton";

export function CreateOrderModal() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [facilityId, setFacilityId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);

  // ── Generate order ID on open ────────────────────────────────────
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(3, "0");
    setOrderId(`ORD-${pad(Math.floor(Math.random() * 999) + 1)}`);
  }, [open]);

  // ── Fetch facilities and products ────────────────────────────────
  useEffect(() => {
    if (!open) return;
    async function fetchData() {
      const [fetchedFacilities, fetchedProducts] = await Promise.all([
        getActiveFacilities(),
        getAllProducts(),
      ]);
      setFacilities(fetchedFacilities);
      setProducts(fetchedProducts);
    }
    fetchData();
  }, [open]);

  // ── Products: show ALL — no facility_id filter (column was dropped) ──
  const selectedProduct = products.find((p) => p.id === productId);

  function resetForm() {
    setFacilityId("");
    setProductId("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
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
      status: "Processing",
      facility_name: facilities.find((f) => f.id === facilityId)?.name ?? "—",
      product_name: selectedProduct?.name ?? "—",
    };

    try {
      await addOrder(formData);
      dispatch(addOrderToStore(optimistic));
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error("[CreateOrderModal] Error:", err);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isPending) setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#2db0b0] hover:bg-[#249191] text-white cursor-pointer">
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Order ID */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Hash className="w-4 h-4 text-[#2db0b0]" />
              Order ID
            </label>
            <Input
              name="order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
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
              onChange={(e) => setFacilityId(e.target.value)}
              required
              disabled={isPending || facilities.length === 0}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white disabled:opacity-50"
            >
              <option value="">
                {facilities.length === 0
                  ? "Loading facilities..."
                  : "Select facility"}
              </option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product — all products, no facility filter */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Package className="w-4 h-4 text-[#2db0b0]" />
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              disabled={isPending || products.length === 0}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white disabled:opacity-50"
            >
              <option value="">
                {products.length === 0
                  ? "Loading products..."
                  : "Select product"}
              </option>
              {products.map((p) => (
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
              disabled={isPending}
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <SubmitButton
              type="submit"
              isPending={isPending}
              cta={
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Order
                </>
              }
              isPendingMesssage="Creating..."
              variant="default"
              size="default"
              classname="bg-[#2db0b0] hover:bg-[#249191] text-white"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
