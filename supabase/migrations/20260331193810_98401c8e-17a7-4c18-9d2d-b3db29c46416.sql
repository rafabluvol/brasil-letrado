-- Remove all duplicates, keeping only the newest per user+title
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, titulo ORDER BY created_at DESC NULLS LAST, id) AS rn
  FROM student_books
)
DELETE FROM student_books
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Enforce uniqueness at database level - impossible to duplicate
CREATE UNIQUE INDEX IF NOT EXISTS student_books_user_id_titulo_uidx
ON student_books (user_id, titulo);