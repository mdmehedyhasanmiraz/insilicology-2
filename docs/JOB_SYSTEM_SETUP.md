# Job System Setup Guide

## Environment Variables Required

To use the job posting and application system, you need to set up the following environment variables in your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How to Get These Values

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings > API**
3. **Copy the following values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Example .env.local File

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdG5wdmJqYjJqY3hqY2JqY2JqYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1NzQ5NjAwLCJleHAiOjE5NjEzMjU2MDB9.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdG5wdmJqYjJqY3hqY2JqY2JqYyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDU3NDk2MDAsImV4cCI6MTk2MTMyNTYwMH0.example
```

## Important Notes

- **Never commit your `.env.local` file** to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges, keep it secure
- The `NEXT_PUBLIC_` variables are exposed to the browser
- The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side

## Database Setup

Make sure you've run the SQL commands provided in the original request to create the jobs and applications tables in your Supabase database.

## Storage Setup

Create a storage bucket named `resumes` in your Supabase project:
- Go to Storage in your Supabase dashboard
- Create a new bucket called `resumes`
- Set it to public
- Configure file size limit to 2MB
- Allow file types: pdf, docx, doc

## Testing

After setting up the environment variables:
1. Restart your development server
2. Visit `/career` to see the job listings
3. Add some test jobs to your database
4. Test the application form at `/career/[job-slug]/apply` 