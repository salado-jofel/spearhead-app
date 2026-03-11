"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addProductToStore,
  updateProductInStore,
  removeProductFromStore,
} from "../(redux)/facility-slice";
import { addProduct, editProduct, deleteProduct } from "../actions";
import type { Product } from "@/app/(interfaces)/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/app/(components)/SubmitButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConfirmModal from "@/app/(components)/ConfirmModal";
import {
  Plus,
  Trash2,
  Pencil,
  Package,
  X,
  Check,
  Building2,
} from "lucide-react";

// ─── Add Modal ────────────────────────────────────────────────────────────────
function AddProductModal({
  facilityId,
  facilityName,
}: {
  facilityId: string;
  facilityName: string;
}) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const created: Product = await addProduct(facilityId, formData);
      dispatch(addProductToStore(created));
      setOpen(false);
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
        <Button
          size="sm"
          className="bg-[#2db0b0] hover:bg-[#249191] text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        {/* ── Facility Badge ── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
          <Building2 className="w-4 h-4 text-[#2db0b0]" />
          <span className="text-sm text-slate-600">
            Facility:{" "}
            <span className="font-medium text-slate-800">{facilityName}</span>
          </span>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await handleSubmit(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Product Name
            </label>
            <Input
              name="name"
              placeholder="e.g. Paracetamol 500mg"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Price ($)
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
          <SubmitButton
            type="submit"
            isPending={isSubmitting}
            isPendingMesssage="Saving..."
            cta="Save Product"
            variant={null}
            size="default"
            classname="w-full bg-[#2db0b0] hover:bg-[#249191] text-white"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({
  product,
  facilityId,
}: {
  product: Product;
  facilityId: string;
}) {
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
      await editProduct(product.id, facilityId, formData);
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

  function handleDeleteClick() {
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!product.id) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id, facilityId);
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
        description={`"${product.name}" will be permanently removed from this facility.`}
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
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
              disabled={isSaving}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0">
                <Package className="w-3.5 h-3.5 text-[#2db0b0]" />
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
              onChange={(e) => setPrice(e.target.value)}
              className="h-8 text-sm w-32"
              disabled={isSaving}
            />
          ) : (
            <span className="text-slate-600 text-sm font-medium">
              ${Number(product.price).toFixed(2)}
            </span>
          )}
        </td>

        {/* Facility */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-500 text-sm">
              {product.facility_name ?? "—"}
            </span>
          </div>
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

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                {/* Cancel */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Save */}
                <SubmitButton
                  type="button"
                  onClick={handleSave}
                  isPending={isSaving}
                  cta={<Check className="w-4 h-4" />}
                  variant="ghost"
                  size="icon-xs"
                  classname="text-[#2db0b0] hover:text-[#249191] hover:bg-transparent"
                />
              </>
            ) : (
              <>
                {/* Edit */}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-300 hover:text-[#2db0b0] transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Edit product"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed"
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
  const item = useAppSelector((state) => state.facility.item);
  const products = useAppSelector((state) => state.facility.products);

  if (!item?.id) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-slate-700">Products</h2>
          <p className="text-xs text-slate-400">
            {products.length} product{products.length !== 1 ? "s" : ""} in this
            facility
          </p>
        </div>
        <AddProductModal facilityId={item.id} facilityName={item.name} />
      </div>

      {/* ── Table ── */}
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-[#2db0b0] text-white">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Facility</th>
            <th className="px-4 py-3 font-medium">Date Added</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <ProductRow
              key={product.id}
              product={product}
              facilityId={item.id!}
            />
          ))}
        </tbody>
      </table>

      {/* ── Empty State ── */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">No Products Yet</p>
          <p className="text-xs text-slate-300 mt-0.5">
            Add your first product to this facility
          </p>
        </div>
      )}
    </div>
  );
}
