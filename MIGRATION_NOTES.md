# Database Migration Notes

## Notes Canvas Field

The Notes Canvas feature requires a `notes_canvas` JSONB column in the `todos` table. This field is not in the original `SQLCODE.md` schema but is required by the application.

To add this field, run the following SQL in your Supabase SQL editor:

```sql
-- Add notes_canvas column to todos table
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS notes_canvas JSONB;
```

This column stores the notes canvas data as JSON, including text notes and images with their positions.

