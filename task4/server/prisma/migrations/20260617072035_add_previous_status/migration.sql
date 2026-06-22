-- AlterTable
ALTER TABLE "User" ADD COLUMN     "previousStatus" "UserStatus" NOT NULL DEFAULT 'unverified';
