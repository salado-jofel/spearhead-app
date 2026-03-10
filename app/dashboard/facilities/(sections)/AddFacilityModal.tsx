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
import { Plus } from "lucide-react";
import { addFacility } from "../actions";

const FACILITY_TYPES: string[] = [
  "Hospital",
  "Clinic",
  "Pharmacy",
  "Laboratory",
  "Rehabilitation Center",
  "Dental Clinic",
  "Birthing Center",
];

export function AddFacilityModal() {
  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    formData.set("type", type);
    await addFacility(formData);
    setOpen(false);
    setType("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2db0b0] hover:bg-[#249191] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Facility
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {/* Facility Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Facility Name
            </label>
            <Input
              name="name"
              placeholder="e.g. St. Luke's Medical Center"
              required
            />
          </div>

          {/* Facility Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger className="w-full">
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
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Contact Person
            </label>
            <Input
              name="contact"
              placeholder="e.g. Dr. Juan dela Cruz"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input
              name="phone"
              type="tel"
              placeholder="e.g. +63 912 345 6789"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2db0b0] hover:bg-[#249191] text-white"
          >
            Save Facility
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
