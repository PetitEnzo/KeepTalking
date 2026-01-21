-- ============================================
-- Migration: Fix configuration V image
-- Description: Update the image URL for configuration V (key='V') to show 2 fingers in V shape
-- Date: 2026-01-21
-- ============================================

-- Update the image URL for configuration V
UPDATE hand_signs 
SET image_url = 'https://zpdnttetliljjpdtyofx.supabase.co/storage/v1/object/public/hand_signs/config8.jpg'
WHERE key = 'V' AND type = 'consonne';

-- Verify the update
SELECT key, image_url, type 
FROM hand_signs 
WHERE key = 'V';
