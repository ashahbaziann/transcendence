-- CreateTable
CREATE TABLE "LocalAccount" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorSecret" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "secret" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwoFactorSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorTicket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expireTime" TIMESTAMP(3) NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalAccount_userId_key" ON "LocalAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LocalAccount_email_key" ON "LocalAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "oAuthAccount_provider_providerId_key" ON "oAuthAccount"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorSecret_userId_key" ON "TwoFactorSecret"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorSecret_secret_key" ON "TwoFactorSecret"("secret");

