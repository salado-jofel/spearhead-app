export interface Facility {
  id?: string;
  created_at?: string;
  name: string;
  type: string;
  contact: string;
  phone: string;
  status: string;
  qb_customer_id?: string | null; 
  qb_synced_at?: string | null; 
}

export type InsertFacilityPayload = Omit<Facility, "id" | "created_at">;
export type UpdateFacilityPayload = Partial<InsertFacilityPayload>;
