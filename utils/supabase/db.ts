import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSupabaseClient(): Promise<SupabaseClient> {
  return await createClient();
}

export async function dbInsert<T extends Record<string, unknown>>({
  table,
  payload,
}: {
  table: string;
  payload: T | T[];
}) {
  const supabase = await getSupabaseClient();

  const { error } = await supabase
    .from(table)
    .insert(Array.isArray(payload) ? payload : [payload]);

  return { error };
}

export async function dbSelect<T>({
  table,
  columns = "*",
  order,
  filter,
}: {
  table: string;
  columns?: string;
  order?: { column: string; ascending?: boolean };
  filter?: { column: string; value: string };
}): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const supabase = await getSupabaseClient();

  let query = supabase.from(table).select(columns);

  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? false });
  }

  const { data, error } = await query;

  return { data: data as T[] | null, error };
}

export async function dbUpdate<T extends Record<string, unknown>>({
  table,
  payload,
  column,
  value,
}: {
  table: string;
  payload: Partial<T>;
  column: string;
  value: string;
}) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq(column, value)
    .select();

  return { data, error };
}

export async function dbDelete({
  table,
  column,
  value,
}: {
  table: string;
  column: string;
  value: string;
}) {
  const supabase = await getSupabaseClient();

  const { error } = await supabase.from(table).delete().eq(column, value);

  return { error };
}
