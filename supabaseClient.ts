import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctqvqftwplpgviavcevn.supabase.co';
const supabaseKey = 'sb_publishable_1-BFpM0hSkpNkRszwKkcOw_azNe2s6e';

export const supabase = createClient(supabaseUrl, supabaseKey);