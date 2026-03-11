"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Phone, Plus, User } from "lucide-react";
import { addFacility } from "../actions";
import { useAppDispatch } from "@/store/hooks";
import { addFacilityToStore } from "../(redux)/facilities-slice";
import SubmitButton from "@/app/(components)/SubmitButton";
import type { Facility } from "@/app/(interfaces)/facility";

const FACILITY_TYPES: string[] = [
  "Hospital",
  "Clinic",
  "Pharmacy",
  "Laboratory",
  "Rehabilitation Center",
  "Dental Clinic",
  "Birthing Center",
];

function FieldWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddFacilityModal() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(formData: FormData) {
    formData.set("type", type);
    setIsSubmitting(true);
    try {
      const created: Facility = await addFacility(formData);
      dispatch(addFacilityToStore(created));
      setOpen(false);
      setType("");
    } catch (err) {
      console.error("[AddFacilityModal] Error:", err);
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
        <Button className="bg-[#2db0b0] hover:bg-[#249191] text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Facility
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl max-w-md">
        {/* ── Modal Header ── */}
        <div className="bg-[#2db0b0] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-semibold">
                Add New Facility
              </DialogTitle>
              <p className="text-teal-100 text-xs mt-0.5">
                Fill in the details to register a new facility
              </p>
            </div>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await handleSubmit(formData);
          }}
          className="px-6 py-5 space-y-4"
        >
          {/* Facility Name */}
          <FieldWrapper label="Facility Name">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                name="name"
                placeholder="e.g. St. Luke's Medical Center"
                required
                disabled={isSubmitting}
                className="pl-9 border-slate-200 focus-visible:ring-[#2db0b0] text-sm"
              />
            </div>
          </FieldWrapper>

          {/* Facility Type */}
          <FieldWrapper label="Facility Type">
            <Select
              value={type}
              onValueChange={setType}
              required
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full border-slate-200 focus:ring-[#2db0b0] text-sm">
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {FACILITY_TYPES.map((t: string) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          {/* Contact Person */}
          <FieldWrapper label="Contact Person">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                name="contact"
                placeholder="e.g. Dr. Juan dela Cruz"
                required
                disabled={isSubmitting}
                className="pl-9 border-slate-200 focus-visible:ring-[#2db0b0] text-sm"
              />
            </div>
          </FieldWrapper>

          {/* Phone */}
          <FieldWrapper label="Phone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                name="phone"
                type="tel"
                placeholder="e.g. +63 912 345 6789"
                required
                disabled={isSubmitting}
                className="pl-9 border-slate-200 focus-visible:ring-[#2db0b0] text-sm"
              />
            </div>
          </FieldWrapper>

          {/* ── Actions ── */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 text-sm disabled:opacity-50"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <SubmitButton
              type="submit"
              isPending={isSubmitting}
              isPendingMesssage="Saving..."
              cta="Save Facility"
              variant={null}
              size="default"
              classname="flex-1 bg-[#2db0b0] hover:bg-[#249191] text-white text-sm shadow-sm"
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
