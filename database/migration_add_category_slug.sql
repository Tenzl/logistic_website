-- Add slug column to categories and backfill from name
ALTER TABLE categories
  ADD COLUMN slug VARCHAR(150) NOT NULL DEFAULT '' AFTER name;

-- Backfill slug from existing name values (simple space-to-hyphen, lowercased)
UPDATE categories
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug = '' OR slug IS NULL;

-- Enforce uniqueness on slug
ALTER TABLE categories
  ADD CONSTRAINT uq_categories_slug UNIQUE (slug);
