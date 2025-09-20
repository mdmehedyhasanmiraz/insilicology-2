# Workshop Recordings Implementation

This document outlines the implementation of workshop recordings support in the admin system.

## Overview

The system now supports associating video recordings with both courses and workshops. Previously, videos could only be associated with courses. The implementation maintains backward compatibility while adding new functionality.

## Database Changes

### Migration File: `database/add_workshop_support_to_course_videos.sql`

This migration adds workshop support to the existing `course_videos` table:

1. **Adds `workshop_id` column**: References the `workshops` table
2. **Makes `course_id` nullable**: Since videos can now be associated with workshops
3. **Adds constraint**: Ensures a video is associated with either a course OR workshop, but not both
4. **Adds index**: For better query performance on workshop_id

### Key Changes

- `workshop_id uuid REFERENCES public.workshops(id) ON DELETE CASCADE`
- `course_id` is now nullable
- Constraint: `(course_id IS NOT NULL AND workshop_id IS NULL) OR (course_id IS NULL AND workshop_id IS NOT NULL)`

## Admin Interface Updates

### 1. Recordings List Page (`/admin/recordings`)

- **New columns**: Added "ধরন" (Type) and "নাম" (Name) columns
- **Type badges**: Visual indicators for course (blue) vs workshop (green)
- **Enhanced display**: Shows whether each video belongs to a course or workshop

### 2. New Recording Page (`/admin/recordings/new`)

- **Entity type selection**: Radio buttons to choose between course or workshop
- **Dynamic form**: Shows relevant fields based on selection
- **Course fields**: Course selection + optional batch selection
- **Workshop fields**: Workshop selection only
- **Smart submission**: Automatically sets appropriate foreign keys

### 3. Edit Recording Page (`/admin/recordings/[id]`)

- **Entity type detection**: Automatically detects existing video type
- **Type switching**: Allows changing between course and workshop
- **Data preservation**: Maintains existing data when switching types

## Implementation Details

### Data Structure

```typescript
interface CourseVideo {
  id: string
  title: string
  youtube_url: string
  is_published: boolean
  created_at: string
  course_id: string | null      // Now nullable
  workshop_id: string | null    // New field
  course: { title: string } | null
  workshop: { title: string } | null
}
```

### Form Logic

- **Entity Type Selection**: Radio buttons control which form fields are shown
- **Validation**: Ensures either course_id or workshop_id is set, but not both
- **Batch Support**: Only available for course videos (maintains existing functionality)

### Database Queries

- **Fetching**: Enhanced to include both course and workshop relationships
- **Inserting**: Smart insertion based on entity type
- **Updating**: Handles type switching and constraint validation

## Usage Instructions

### For Admins

1. **Create New Recording**:
   - Choose between course or workshop
   - Select the specific course/workshop
   - Fill in video details
   - Submit

2. **Edit Existing Recording**:
   - Change entity type if needed
   - Update video details
   - Save changes

3. **View All Recordings**:
   - See type badges for easy identification
   - Filter by type if needed
   - Manage all videos from one interface

### For Developers

1. **Apply Migration**:
   ```sql
   -- Run the migration file in your Supabase SQL editor
   -- or apply via your preferred method
   ```

2. **Test Functionality**:
   - Create recordings for both courses and workshops
   - Switch between types
   - Verify constraint enforcement

## Benefits

1. **Unified Management**: Single interface for all video recordings
2. **Flexibility**: Videos can be associated with either courses or workshops
3. **Backward Compatibility**: Existing course videos continue to work
4. **Data Integrity**: Constraint ensures proper relationships
5. **Better UX**: Clear visual indicators and intuitive form flow

## Future Enhancements

1. **Filtering**: Add filters by type, course, or workshop
2. **Bulk Operations**: Select multiple videos for batch operations
3. **Analytics**: Track video usage by type
4. **API Endpoints**: Expose workshop recordings via API

## Notes

- The migration makes `course_id` nullable, which is a breaking change
- Existing videos will maintain their course associations
- New videos can be associated with either courses or workshops
- The constraint ensures data integrity
- All existing functionality for course videos is preserved
