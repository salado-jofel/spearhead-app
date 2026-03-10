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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  async function handleSubmit(formData: FormData) {
    const optimistic: Product = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string) || 0,
      facility_id: facilityId,
      facility_name: facilityName,
    };

    dispatch(addProductToStore(optimistic));
    setOpen(false);
    await addProduct(facilityId, formData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Product Name
            </label>
            <Input name="name" placeholder="e.g. Paracetamol 500mg" required />
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
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#2db0b0] hover:bg-[#249191] text-white"
          >
            Save Product
          </Button>
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

  async function handleSave() {
    if (!product.id) return;

    const updated: Product = {
      ...product,
      name,
      price: parseFloat(price) || 0,
    };

    dispatch(updateProductInStore(updated));
    setIsEditing(false);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("price", price);
    await editProduct(product.id, facilityId, formData);
  }

  async function handleDelete() {
    if (!product.id) return;
    dispatch(removeProductFromStore(product.id));
    await deleteProduct(product.id, facilityId);
  }

  function handleCancel() {
    setName(product.name);
    setPrice(String(product.price));
    setIsEditing(false);
  }

  return (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPrice(e.target.value)
            }
            className="h-8 text-sm w-32"
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
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="p-1.5 text-[#2db0b0] hover:text-[#249191] transition-colors rounded"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-300 hover:text-[#2db0b0] transition-colors rounded"
                title="Edit product"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded"
                title="Delete product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
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
