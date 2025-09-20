// // utils/supabase/client.ts
// 'use client';

// import { createBrowserClient } from '@supabase/ssr';

// export const createClient = () =>
//   createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () =>
  createClientComponentClient();
