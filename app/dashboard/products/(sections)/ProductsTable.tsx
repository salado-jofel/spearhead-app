"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addProductToStore,
  updateProductInStore,
  removeProductFromStore,
} from "../(redux)/products-slice";
import { addProduct, editProduct, deleteProduct } from "../actions";
import type { Product } from "@/app/(interfaces)/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubmitButton from "@/app/(components)/SubmitButton";
import ConfirmModal from "@/app/(components)/ConfirmModal";
import {
  Package,
  Trash2,
  Pencil,
  X,
  Check,
  Plus,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// ─── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const created: Product = await addProduct(formData);
      dispatch(addProductToStore(created));
      setOpen(false);
    } catch (err) {
      console.error("[AddProductModal] Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isSubmitting) setOpen(val);
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-[#2db0b0] hover:bg-[#249191] text-white cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Add New Product
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Package className="w-4 h-4 text-[#2db0b0]" />
              Product Name
            </label>
            <Input
              name="name"
              placeholder="e.g. Paracetamol 500mg"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <DollarSign className="w-4 h-4 text-[#2db0b0]" />
              Price
            </label>
            <Input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 99.00"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="text-slate-600 cursor-pointer"
            >
              Cancel
            </Button>
            <SubmitButton
              type="submit"
              isPending={isSubmitting}
              cta={
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Product
                </>
              }
              isPendingMesssage="Saving..."
              variant="default"
              size="default"
              classname="bg-[#2db0b0] hover:bg-[#249191] text-white cursor-pointer"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(product.name);
  const [price, setPrice] = useState<string>(String(product.price));
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    if (!product.id) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("price", price);
      await editProduct(product.id, formData);
      dispatch(
        updateProductInStore({
          ...product,
          name,
          price: parseFloat(price) || 0,
        }),
      );
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!product.id) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      dispatch(removeProductFromStore(product.id));
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancel() {
    setName(product.name);
    setPrice(String(product.price));
    setIsEditing(false);
  }

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Product?"
        description={`"${product.name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        {/* Name */}
        <td className="px-4 py-3">
          {isEditing ? (
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="h-8 text-sm"
              disabled={isSaving}
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-[#2db0b0]" />
              </div>
              <span className="text-slate-700 font-medium text-sm">
                {product.name}
              </span>
            </div>
          )}
        </td>

        {/* Price */}
        <td className="px-4 py-3">
          {isEditing ? (
            <Input
              value={price}
              type="number"
              min="0"
              step="0.01"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPrice(e.target.value)
              }
              className="h-8 text-sm w-32"
              disabled={isSaving}
            />
          ) : (
            <span className="text-slate-700 font-medium text-sm">
              ${Number(product.price).toFixed(2)}
            </span>
          )}
        </td>

        {/* Date Added */}
        <td className="px-4 py-3 text-slate-400 text-sm">
          {product.created_at
            ? new Date(product.created_at).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </td>

        {/* QuickBooks — display only, auto-synced */}
        <td className="px-4 py-3">
          {product.qb_item_id ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              QB Synced
              {product.qb_synced_at && (
                <span className="text-slate-400 font-normal">
                  ·{" "}
                  {new Date(product.qb_synced_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <XCircle className="w-3.5 h-3.5" />
              Not Synced
            </span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
                <SubmitButton
                  type="button"
                  onClick={handleSave}
                  isPending={isSaving}
                  cta={<Check className="w-4 h-4" />}
                  isPendingMesssage=""
                  variant="ghost"
                  size="icon-xs"
                  classname="text-[#2db0b0] hover:text-[#249191] hover:bg-transparent cursor-pointer"
                />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-300 hover:text-[#2db0b0] transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Edit product"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductsTable() {
  const items = useAppSelector((state) => state.products.items);
  const search = useAppSelector((state) => state.products.search);

  const filtered: Product[] = useMemo(() => {
    return items.filter((p: Product) => {
      const q = search.toLowerCase();
      return search === "" || p.name?.toLowerCase().includes(q);
    });
  }, [items, search]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-267px)]">
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-slate-700">All Products</h2>
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">{items.length}</span>{" "}
            products
          </p>
        </div>
        <AddProductModal />
      </div>

      {/* ── Scrollable Table ── */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#2db0b0] text-white">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Date Added</th>
              <th className="px-4 py-3 font-medium">QuickBooks</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product: Product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>

        {/* ── Empty State ── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-base font-medium text-slate-400">
              No Products Found
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
        <p className="text-xs text-slate-400">
          Showing{" "}
          <span className="font-medium text-slate-600">{filtered.length}</span>{" "}
          of <span className="font-medium text-slate-600">{items.length}</span>{" "}
          products
        </p>
      </div>
    </div>
  );
}
