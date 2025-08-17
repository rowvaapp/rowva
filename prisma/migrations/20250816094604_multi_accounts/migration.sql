/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider,externalId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Account_userId_provider_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN "accountEmail" TEXT;
ALTER TABLE "Account" ADD COLUMN "displayName" TEXT;
ALTER TABLE "Account" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Account" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Account" ADD COLUMN "workspaceName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT NOT NULL,
    "notionPageId" TEXT NOT NULL,
    "checksum" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mappingId" TEXT,
    "googleAccountId" TEXT,
    CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Link_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "Mapping" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Link_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("checksum", "createdAt", "gmailMessageId", "gmailThreadId", "id", "notionPageId", "updatedAt", "userId") SELECT "checksum", "createdAt", "gmailMessageId", "gmailThreadId", "id", "notionPageId", "updatedAt", "userId" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE UNIQUE INDEX "Link_gmailMessageId_key" ON "Link"("gmailMessageId");
CREATE TABLE "new_Mapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gmailLabel" TEXT NOT NULL,
    "notionDatabaseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "googleAccountId" TEXT,
    "notionAccountId" TEXT,
    CONSTRAINT "Mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mapping_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mapping_notionAccountId_fkey" FOREIGN KEY ("notionAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mapping" ("createdAt", "gmailLabel", "id", "notionDatabaseId", "userId") SELECT "createdAt", "gmailLabel", "id", "notionDatabaseId", "userId" FROM "Mapping";
DROP TABLE "Mapping";
ALTER TABLE "new_Mapping" RENAME TO "Mapping";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_provider_externalId_key" ON "Account"("userId", "provider", "externalId");
