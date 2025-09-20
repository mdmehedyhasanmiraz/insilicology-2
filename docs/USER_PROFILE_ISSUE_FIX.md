# User Profile Creation Issue - Fix Documentation

## Problem Description

When users sign up through the academic workshop form, only their email was being recorded in the `users` table. Other important data like:
- Full Name
- Phone/WhatsApp
- University
- Department
- Academic Year
- Academic Session

Was not being saved to the database.

## Root Cause

The issue was in the signup flow:

1. **Timing Issue**: The `signupWithEmail` function tried to create the user profile immediately after `supabase.auth.signUp()`, but the user might not be available yet, especially if email confirmation is required.

2. **Incomplete Data Storage**: The function was only storing basic information and not all the academic fields collected in the form.

3. **No Fallback Mechanism**: If the initial profile creation failed, there was no retry mechanism.

## Solutions Implemented

### 1. Fixed Signup Action (`app/(auth)/signup/actions.ts`)

- **Improved User Metadata Storage**: Now stores all academic information in `user_metadata` during signup
- **Better Error Handling**: Uses the user data from the signup response instead of trying to get it separately
- **Comprehensive Profile Creation**: Creates user profile with all collected information

### 2. Database Triggers

Created two database migration files:

#### `database/create_user_profile_trigger.sql`
- **Comprehensive Trigger**: Automatically creates user profiles when new users are created in `auth.users`
- **Metadata Extraction**: Extracts all academic information from `raw_user_meta_data`
- **Conflict Resolution**: Handles cases where profiles already exist

#### `database/create_simple_user_profile_trigger.sql`
- **Simple Fallback**: Basic trigger that just ensures a user profile row exists
- **Minimal Dependencies**: Less likely to have permission issues

### 3. Enhanced Academic Workshop Form (`components/workshops/AcademicWorkshopEnrollForm.tsx`)

- **Profile Creation Fallback**: Added logic to ensure user profiles are created even if the initial signup fails
- **Immediate Profile Update**: Updates profile information when users sign in successfully
- **Error Handling**: Better error handling and logging for profile creation failures

### 4. Utility Functions (`utils/userProfileUtils.ts`)

- **`ensureUserProfile()`**: Centralized function to create/update user profiles
- **`getUserProfile()`**: Function to retrieve user profile information
- **Consistent Error Handling**: Standardized error handling across the application

## Implementation Steps

### Step 1: Run Database Migrations

```sql
-- Run the comprehensive trigger first
\i database/create_user_profile_trigger.sql

-- If that fails due to permissions, use the simple version
\i database/create_simple_user_profile_trigger.sql
```

### Step 2: Deploy Code Changes

1. **Signup Action**: Updated to handle all academic fields
2. **Academic Workshop Form**: Enhanced with profile creation fallback
3. **Utility Functions**: Added for consistent profile management

### Step 3: Test the Fix

1. **Create a new academic workshop signup**
2. **Verify all fields are saved** in the `users` table
3. **Check both scenarios**:
   - Immediate sign-in (no email confirmation required)
   - Email confirmation required

## Database Schema Requirements

The `users` table must have these columns:

```sql
CREATE TABLE public.users (
  id uuid NOT NULL PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NULL,
  whatsapp text NULL,
  university text NULL,
  department text NULL,
  academic_year text NULL,
  academic_session text NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'student',
  -- ... other fields
);
```

## Testing Checklist

- [ ] New user signup through academic workshop form
- [ ] All form fields are saved to `users` table
- [ ] Profile creation works with email confirmation
- [ ] Profile creation works without email confirmation
- [ ] Existing users can update their academic information
- [ ] Error handling works properly

## Monitoring

After deployment, monitor:

1. **Database logs** for any trigger errors
2. **Application logs** for profile creation failures
3. **User registration success rate**
4. **Data completeness** in the `users` table

## Rollback Plan

If issues arise:

1. **Disable triggers**: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`
2. **Revert code changes** to previous working version
3. **Investigate and fix** the specific issue
4. **Re-enable triggers** after fixing

## Future Improvements

1. **Real-time Profile Sync**: Consider using Supabase real-time subscriptions
2. **Profile Validation**: Add validation rules for academic fields
3. **Bulk Profile Updates**: Allow admins to update multiple user profiles
4. **Profile Completion Tracking**: Track which users have incomplete profiles
