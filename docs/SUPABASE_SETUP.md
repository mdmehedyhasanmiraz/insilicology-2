# Supabase Setup Guide

## Environment Variables Required

You need to add these environment variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Get These Values

### 1. Go to Your Supabase Dashboard
- Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project

### 2. Get the URL and Keys
- Go to **Settings** → **API**
- Copy the following values:

#### Project URL
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
```

#### Anon/Public Key
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Service Role Key (Admin)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

### Service Role Key Security
- **NEVER** expose the `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Only use it in server-side code (API routes, server actions)
- This key has full admin access to your database

### Anon Key
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to use in client-side code
- It respects your Row Level Security (RLS) policies

## Current Setup Status

### ✅ Working (with fallback)
- Job creation and updates will work with either admin or anon key
- The system automatically falls back to anon key if admin key is missing

### 🔧 Recommended
- Add the `SUPABASE_SERVICE_ROLE_KEY` for full admin functionality
- This ensures all admin operations work properly

## Testing

After adding the environment variables:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test job creation**:
   - Go to `/admin/jobs/new`
   - Create a new job
   - Should work without errors

3. **Test job editing**:
   - Go to `/admin/jobs/[slug]`
   - Edit a job
   - Should work without errors

## Troubleshooting

### "Admin access not available" Error
- Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify the key is valid in your Supabase dashboard
- Restart your development server after adding the variable

### "Supabase environment variables not configured" Error
- Check if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify the values are correct
- Make sure there are no extra spaces or quotes

### RLS Policy Errors
- Ensure your RLS policies are set up correctly in Supabase
- Check that admin users have the correct role in the `users` table 