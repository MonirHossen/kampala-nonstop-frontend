import { inject, Injectable } from '@angular/core';
import { SUPABASE } from '../supabase/supabase.client';
import type { Database } from '../supabase/database.types';

export type SiteSettings = Database['public']['Tables']['site_settings']['Row'];
export type SiteSettingsPatch = Database['public']['Tables']['site_settings']['Update'];

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly supabase = inject(SUPABASE);

  async get(): Promise<SiteSettings | null> {
    const { data, error } = await this.supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, patch: SiteSettingsPatch): Promise<void> {
    const { error } = await this.supabase.from('site_settings').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
  }
}
