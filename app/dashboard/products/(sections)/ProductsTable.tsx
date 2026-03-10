"use client";

import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateProductInStore,
  removeProductFromStore,
} from "../(redux)/products-slice";
import { editProduct, deleteProduct } from "../actions";
import type { Product } from "@/app/(interfaces)/product";
import { Input } from "@/components/ui/input";
import { Package, Building2, Trash2, Pencil, X, Check } from "lucide-react";

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({ product }: { product: Product }) {
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
    await editProduct(product.id, formData);
  }

  async function handleDelete() {
    if (!product.id) return;
    dispatch(removeProductFromStore(product.id));
    await deleteProduct(product.id);
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
          />
        ) : (
          <span className="text-slate-700 font-medium text-sm">
            ${Number(product.price).toFixed(2)}
          </span>
        )}
      </td>

      {/* Facility */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
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
  const items = useAppSelector((state) => state.products.items);
  const search = useAppSelector((state) => state.products.search);
  const facilityFilter = useAppSelector(
    (state) => state.products.facilityFilter,
  );

  const filtered: Product[] = useMemo(() => {
    return items.filter((p: Product) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        p.name?.toLowerCase().includes(q) ||
        p.facility_name?.toLowerCase().includes(q);

      const matchesFacility =
        facilityFilter === "All Facilities" ||
        p.facility_name === facilityFilter;

      return matchesSearch && matchesFacility;
    });
  }, [items, search, facilityFilter]);

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
      </div>

      {/* ── Scrollable Table ── */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          {/* ── Sticky Header ── */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#2db0b0] text-white">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Facility</th>
              <th className="px-4 py-3 font-medium">Date Added</th>
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
