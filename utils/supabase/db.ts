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
  filters,
}: {
  table: string;
  columns?: string;
  order?: { column: string; ascending?: boolean };
  filter?: { column: string; value: string }; // single (backward compat)
  filters?: { column: string; value: string }[]; // ← NEW: multiple filters
}): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const supabase = await getSupabaseClient();

  let query = supabase.from(table).select(columns);

  // single filter — kept for backward compatibility
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }

  // multiple filters — applied as AND conditions
  if (filters && filters.length > 0) {
    for (const f of filters) {
      query = query.eq(f.column, f.value);
    }
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
  guards, // ← NEW: extra .eq() ownership guards
}: {
  table: string;
  payload: Partial<T>;
  column: string;
  value: string;
  guards?: { column: string; value: string }[];
}) {
  const supabase = await getSupabaseClient();

  let query = supabase.from(table).update(payload).eq(column, value);

  if (guards && guards.length > 0) {
    for (const g of guards) {
      query = query.eq(g.column, g.value);
    }
  }

  const { data, error } = await query.select();

  return { data, error };
}

export async function dbDelete({
  table,
  column,
  value,
  guards, // ← NEW: extra .eq() ownership guards
}: {
  table: string;
  column: string;
  value: string;
  guards?: { column: string; value: string }[];
}) {
  const supabase = await getSupabaseClient();

  let query = supabase.from(table).delete().eq(column, value);

  if (guards && guards.length > 0) {
    for (const g of guards) {
      query = query.eq(g.column, g.value);
    }
  }

  const { error } = await query;

  return { error };
}
