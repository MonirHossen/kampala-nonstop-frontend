import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import type { Database } from './database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

function isOpaqueApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

/**
 * Opaque publishable keys are not bearer JWTs, so the default Authorization
 * header has to be stripped or Supabase rejects the request.
 */
function createSupabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }

    if (isOpaqueApiKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

export function createSupabase(): TypedSupabaseClient {
  const url = environment.supabaseUrl;
  const key = environment.supabasePublishableKey;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Set supabaseUrl and supabasePublishableKey in src/environments.',
    );
  }

  return createClient<Database>(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const SUPABASE = new InjectionToken<TypedSupabaseClient>('SupabaseClient', {
  factory: createSupabase,
});
