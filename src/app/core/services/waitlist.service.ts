import { inject, Injectable } from '@angular/core';
import { SUPABASE } from '../supabase/supabase.client';
import type { Database } from '../supabase/database.types';
import type { TrackingPayload } from '../lib/tracking';

export type WaitlistStatus = Database['public']['Enums']['waitlist_status'];
export type WaitlistEntry = Database['public']['Tables']['waitlist_entries']['Row'];

export type WaitlistSubmission = {
  firstName: string;
  surname: string;
  email: string;
  countryName: string;
  countryCode: string;
  dialCode: string;
  interests: string[];
  marketingOptIn: boolean;
  tracking: TrackingPayload;
};

export type WaitlistQuery = {
  search?: string;
  country?: string;
  interest?: string;
  marketing?: 'all' | 'yes' | 'no';
  status?: WaitlistStatus | 'all';
  from?: string;
  to?: string;
  sortBy?: 'created_at' | 'first_name' | 'email' | 'country_name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export type WaitlistPage = {
  rows: WaitlistEntry[];
  total: number;
  page: number;
  pageSize: number;
};

export type DashboardSummary = {
  total: number;
  today: number;
  week: number;
  month: number;
  optIns: number;
  topCountries: [string, number][];
  topInterests: [string, number][];
  recent: Pick<
    WaitlistEntry,
    | 'id'
    | 'first_name'
    | 'surname'
    | 'email'
    | 'country_name'
    | 'country_code'
    | 'interests'
    | 'marketing_opt_in'
    | 'created_at'
    | 'status'
  >[];
};

export class DuplicateEmailError extends Error {
  constructor() {
    super('This email is already on the waitlist.');
    this.name = 'DuplicateEmailError';
  }
}

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly supabase = inject(SUPABASE);

  async create(input: WaitlistSubmission): Promise<void> {
    const { error } = await this.supabase.from('waitlist_entries').insert({
      first_name: input.firstName,
      surname: input.surname,
      email: input.email.toLowerCase(),
      country_name: input.countryName,
      country_code: input.countryCode,
      dial_code: input.dialCode,
      interests: input.interests,
      marketing_opt_in: input.marketingOptIn,
      ...input.tracking,
    });

    if (error) {
      if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
        throw new DuplicateEmailError();
      }
      throw new Error(error.message);
    }
  }

  async list(q: WaitlistQuery): Promise<WaitlistPage> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;

    let query = this.supabase.from('waitlist_entries').select('*', { count: 'exact' });

    if (q.search?.trim()) {
      const s = `%${q.search.trim()}%`;
      query = query.or(`first_name.ilike.${s},surname.ilike.${s},email.ilike.${s}`);
    }
    if (q.country && q.country !== 'all') query = query.eq('country_code', q.country);
    if (q.interest && q.interest !== 'all') query = query.contains('interests', [q.interest]);
    if (q.marketing === 'yes') query = query.eq('marketing_opt_in', true);
    if (q.marketing === 'no') query = query.eq('marketing_opt_in', false);
    if (q.status && q.status !== 'all') query = query.eq('status', q.status);
    if (q.from) query = query.gte('created_at', new Date(q.from).toISOString());
    if (q.to) {
      const to = new Date(q.to);
      to.setHours(23, 59, 59, 999);
      query = query.lte('created_at', to.toISOString());
    }

    query = query
      .order(q.sortBy ?? 'created_at', { ascending: (q.sortDir ?? 'desc') === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { rows: data ?? [], total: count ?? 0, page, pageSize };
  }

  async get(id: string): Promise<WaitlistEntry> {
    const { data, error } = await this.supabase
      .from('waitlist_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Registration not found');
    return data;
  }

  async updateStatus(id: string, status: WaitlistStatus): Promise<void> {
    const { error } = await this.supabase.from('waitlist_entries').update({ status }).eq('id', id);
    if (error) throw new Error(error.message);
  }

  async remove(ids: string[]): Promise<void> {
    const { error } = await this.supabase.from('waitlist_entries').delete().in('id', ids);
    if (error) throw new Error(error.message);
  }

  async dashboard(): Promise<DashboardSummary> {
    const { data, error } = await this.supabase
      .from('waitlist_entries')
      .select(
        'country_name,country_code,interests,marketing_opt_in,created_at,first_name,surname,email,id,status',
      )
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - ((startOfDay.getDay() + 6) % 7));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const since = (d: Date) => rows.filter((r) => new Date(r.created_at) >= d).length;

    const tally = (keys: string[]): [string, number][] => {
      const map = new Map<string, number>();
      for (const k of keys) map.set(k, (map.get(k) ?? 0) + 1);
      return [...map.entries()].sort((a, b) => b[1] - a[1]);
    };

    return {
      total: rows.length,
      today: since(startOfDay),
      week: since(startOfWeek),
      month: since(startOfMonth),
      optIns: rows.filter((r) => r.marketing_opt_in).length,
      topCountries: tally(rows.map((r) => r.country_name)).slice(0, 6),
      topInterests: tally(rows.flatMap((r) => r.interests)).slice(0, 8),
      recent: rows.slice(0, 8),
    };
  }
}

export function toCsv(rows: WaitlistEntry[]): string {
  const headers = [
    'First Name',
    'Surname',
    'Email',
    'Country',
    'Dial Code',
    'Interests',
    'Marketing Opt-in',
    'Status',
    'Signup Date',
    'Source',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Term',
    'UTM Content',
    'Landing Page',
    'Referrer',
  ];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.first_name,
      r.surname,
      r.email,
      r.country_name,
      r.dial_code,
      r.interests.join('; '),
      r.marketing_opt_in ? 'Yes' : 'No',
      r.status,
      new Date(r.created_at).toISOString(),
      r.source,
      r.utm_source,
      r.utm_medium,
      r.utm_campaign,
      r.utm_term,
      r.utm_content,
      r.landing_page,
      r.referrer,
    ]
      .map(esc)
      .join(','),
  );
  return [headers.map(esc).join(','), ...lines].join('\n');
}
