/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the username column as nullable first
ALTER TABLE "public"."users" ADD COLUMN "username" TEXT;

-- Step 2: Update existing users with unique usernames based on their email
UPDATE "public"."users" 
SET "username" = CONCAT(
  LOWER(REPLACE(split_part("email", '@', 1), '.', '_')),
  '_',
  SUBSTR(REPLACE("id"::text, '-', ''), 1, 6)
)
WHERE "username" IS NULL;

-- Step 3: Make the column NOT NULL after all users have usernames
ALTER TABLE "public"."users" ALTER COLUMN "username" SET NOT NULL;

-- Step 4: Create unique index
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");
