-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gmailLabel" TEXT NOT NULL,
    "notionDatabaseId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "googleAccountId" TEXT,
    "notionAccountId" TEXT,
    CONSTRAINT "Mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mapping_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mapping_notionAccountId_fkey" FOREIGN KEY ("notionAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mapping" ("createdAt", "gmailLabel", "googleAccountId", "id", "notionAccountId", "notionDatabaseId", "userId") SELECT "createdAt", "gmailLabel", "googleAccountId", "id", "notionAccountId", "notionDatabaseId", "userId" FROM "Mapping";
DROP TABLE "Mapping";
ALTER TABLE "new_Mapping" RENAME TO "Mapping";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
