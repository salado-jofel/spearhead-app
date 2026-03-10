import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns an initialized Supabase client instance
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  return await createClient();
}

/**
 * INSERT: Inserts a record into any table
 */
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

/**
 * SELECT: Fetches records from any table with optional column selection and ordering
 */
export async function dbSelect<T>({
  table,
  columns = "*",
  order,
}: {
  table: string;
  columns?: string;
  order?: { column: string; ascending?: boolean };
}): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const supabase = await getSupabaseClient();

  let query = supabase.from(table).select(columns);

  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? false });
  }

  const { data, error } = await query;

  return { data: data as T[] | null, error };
}

/**
 * UPDATE: Updates records in any table by a given column match
 */
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

/**
 * DELETE: Deletes a record by a given column match
 */
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
