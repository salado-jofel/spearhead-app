export interface Product {
  id?: string;
  created_at?: string;
  name: string;
  price: number;
  facility_id: string;
  facility_name?: string; // joined from facilities table
}

export type InsertProductPayload = Omit<
  Product,
  "id" | "created_at" | "facility_name"
>;
export type UpdateProductPayload = Partial<InsertProductPayload>;
