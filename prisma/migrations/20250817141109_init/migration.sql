-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "extraJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "displayName" TEXT,
    "accountEmail" TEXT,
    "workspaceId" TEXT,
    "workspaceName" TEXT,
    "gmailHistoryId" TEXT,
    "gmailWatchActive" BOOLEAN NOT NULL DEFAULT false,
    "gmailWatchExpiresAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mapping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailLabel" TEXT NOT NULL,
    "gmailLabelsJson" TEXT,
    "notionDatabaseId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "googleAccountId" TEXT,
    "notionAccountId" TEXT,

    CONSTRAINT "Mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Format" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Format_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT NOT NULL,
    "notionPageId" TEXT NOT NULL,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mappingId" TEXT,
    "googleAccountId" TEXT,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_provider_externalId_key" ON "Account"("userId", "provider", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_gmailMessageId_key" ON "Link"("gmailMessageId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapping" ADD CONSTRAINT "Mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapping" ADD CONSTRAINT "Mapping_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mapping" ADD CONSTRAINT "Mapping_notionAccountId_fkey" FOREIGN KEY ("notionAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Format" ADD CONSTRAINT "Format_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "Mapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_googleAccountId_fkey" FOREIGN KEY ("googleAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
