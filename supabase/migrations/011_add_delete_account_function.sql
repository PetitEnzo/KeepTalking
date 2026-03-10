-- ============================================
-- Migration: Add delete account function
-- ============================================
-- This migration adds a function to allow users to delete their own account
-- respecting GDPR right to be forgotten

-- ============================================
-- FUNCTION: Delete user account
-- ============================================
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_user_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  v_auth_user_id := auth.uid();
  
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the user_id from users table
  SELECT user_id INTO v_user_id
  FROM users
  WHERE auth_user_id = v_auth_user_id;

  -- Delete from users table (will cascade to all related tables)
  DELETE FROM users WHERE auth_user_id = v_auth_user_id;

  -- Delete from users_profiles table
  DELETE FROM users_profiles WHERE id = v_auth_user_id;

  -- Delete the auth user (this is the critical part)
  DELETE FROM auth.users WHERE id = v_auth_user_id;

  RAISE NOTICE 'User account deleted successfully';
END;
$$;

-- ============================================
-- GRANT EXECUTE to authenticated users
-- ============================================
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- ============================================
-- COMMENT
-- ============================================
COMMENT ON FUNCTION delete_user_account() IS 'Allow authenticated users to delete their own account and all associated data (GDPR compliance)';
