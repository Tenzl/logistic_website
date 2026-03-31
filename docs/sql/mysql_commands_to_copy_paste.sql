-- 1. Drop existing unique index on code (It's usually named 'code' or 'UK_...').
-- If the index is named differently, you can run `SHOW CREATE TABLE provinces` to find the exact name.
ALTER TABLE `seatrans`.`provinces` DROP INDEX `code`;

-- 2. Modify the column data type to INT
ALTER TABLE `seatrans`.`provinces` MODIFY COLUMN `code` INT NULL;

-- 3. Re-create the unique index for the code column
ALTER TABLE `seatrans`.`provinces` ADD UNIQUE INDEX `uk_provinces_code` (`code`);
