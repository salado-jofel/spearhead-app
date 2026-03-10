export interface Profile {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export type UpdateProfilePayload = Omit<Profile, "id">;
