"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFacilityInStore } from "../(redux)/facility-slice";
import { editFacility } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/app/(components)/SubmitButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  User,
  Building2,
  Activity,
  Pencil,
  X,
  Check,
  Calendar,
} from "lucide-react";
import type { UpdateFacilityPayload } from "@/app/(interfaces)/facility";

const FACILITY_TYPES: string[] = [
  "Hospital",
  "Clinic",
  "Pharmacy",
  "Laboratory",
  "Rehabilitation Center",
  "Dental Clinic",
  "Birthing Center",
];

const STATUS_OPTIONS: string[] = ["Active", "Inactive", "Pending"];

function FieldRow({
  icon,
  label,
  value,
  editing,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[#2db0b0]/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#2db0b0]">{icon}</span>
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        {editing && children ? (
          children
        ) : (
          <p className="text-slate-700 font-medium truncate">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}

export default function FacilityDetails() {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => state.facility.item);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [type, setType] = useState<string>(item?.type ?? "");
  const [status, setStatus] = useState<string>(item?.status ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item?.id) return;

    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("status", status);

    const payload: UpdateFacilityPayload = {
      name: formData.get("name") as string,
      type,
      contact: formData.get("contact") as string,
      phone: formData.get("phone") as string,
      status,
    };

    setIsSaving(true);
    try {
      await editFacility(item.id, formData);
      dispatch(updateFacilityInStore(payload));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setType(item?.type ?? "");
    setStatus(item?.status ?? "");
    setIsEditing(false);
  }

  if (!item) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
      {/* ── Card Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-slate-700">
            Facility Information
          </h2>
          <p className="text-xs text-slate-400">
            View and manage facility details
          </p>
        </div>

        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setType(item.type);
              setStatus(item.status);
              setIsEditing(true);
            }}
            className="text-[#2db0b0] border-[#2db0b0]/40 hover:bg-teal-50 hover:border-[#2db0b0]"
          >
            <Pencil className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Edit Details</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>

            <SubmitButton
              type="submit"
              form="facility-edit-form"
              isPending={isSaving}
              isPendingMesssage="Saving..."
              cta={
                <>
                  <Check className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Save Changes</span>
                </>
              }
              variant={null}
              size="sm"
              classname="bg-[#2db0b0] hover:bg-[#249191] text-white shadow-sm"
            />
          </div>
        )}
      </div>

      {/* ── Card Body (unchanged) ── */}
      <form id="facility-edit-form" onSubmit={handleSubmit} className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <FieldRow
            icon={<Building2 className="w-4 h-4" />}
            label="Facility Name"
            value={item.name}
            editing={isEditing}
          >
            <Input
              name="name"
              defaultValue={item.name}
              required
              disabled={isSaving}
            />
          </FieldRow>

          <FieldRow
            icon={<Building2 className="w-4 h-4" />}
            label="Type"
            value={item.type}
            editing={isEditing}
          >
            <Select value={type} onValueChange={setType} disabled={isSaving}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FACILITY_TYPES.map((t: string) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow
            icon={<User className="w-4 h-4" />}
            label="Contact Person"
            value={item.contact}
            editing={isEditing}
          >
            <Input
              name="contact"
              defaultValue={item.contact}
              required
              disabled={isSaving}
            />
          </FieldRow>

          <FieldRow
            icon={<Phone className="w-4 h-4" />}
            label="Phone"
            value={item.phone}
            editing={isEditing}
          >
            <Input
              name="phone"
              type="tel"
              defaultValue={item.phone}
              required
              disabled={isSaving}
            />
          </FieldRow>

          <FieldRow
            icon={<Activity className="w-4 h-4" />}
            label="Status"
            value={item.status}
            editing={isEditing}
          >
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s: string) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow
            icon={<Calendar className="w-4 h-4" />}
            label="Created At"
            value={
              item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"
            }
            editing={false}
          />
        </div>
      </form>
    </div>
  );
}
