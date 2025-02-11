import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Database } from './database.types';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('USER_SERVICE_SUPABASE_URL'),
      this.configService.getOrThrow<string>('USER_SERVICE_SUPABASE_KEY'),
    );
  }

  getClient() {
    return this.supabase;
  }
}
