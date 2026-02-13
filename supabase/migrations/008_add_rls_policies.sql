-- ============================================
-- Migration: Add RLS Policies for Admin Actions
-- ============================================
-- This migration adds Row Level Security policies to allow admins
-- to delete word contributions

-- ============================================
-- Enable RLS on word_contributions if not already enabled
-- ============================================
ALTER TABLE word_contributions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY: Allow admins to delete word contributions
-- ============================================
CREATE POLICY "Admins can delete word contributions"
ON word_contributions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- POLICY: Allow admins to update word contributions
-- ============================================
CREATE POLICY "Admins can update word contributions"
ON word_contributions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- POLICY: Allow users to insert their own contributions
-- ============================================
CREATE POLICY "Users can insert their own contributions"
ON word_contributions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT user_id FROM users WHERE auth_user_id = auth.uid()
  )
);

-- ============================================
-- POLICY: Allow users to view all contributions
-- ============================================
CREATE POLICY "Users can view all contributions"
ON word_contributions
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Admins can delete word contributions" ON word_contributions IS 'Allow admin users to delete any word contribution';
COMMENT ON POLICY "Admins can update word contributions" ON word_contributions IS 'Allow admin users to update any word contribution (approve/reject)';
COMMENT ON POLICY "Users can insert their own contributions" ON word_contributions IS 'Allow authenticated users to create their own word contributions';
COMMENT ON POLICY "Users can view all contributions" ON word_contributions IS 'Allow all authenticated users to view word contributions';
