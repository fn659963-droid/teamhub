ALTER TABLE "shared_accounts" ADD COLUMN "previousUserId" TEXT;
ALTER TABLE "shared_accounts" ADD CONSTRAINT "shared_accounts_previousUserId_fkey" FOREIGN KEY ("previousUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
