-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nomeOriginal" VARCHAR(255) NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Arquivo_storageKey_key" ON "Arquivo"("storageKey");

-- CreateIndex
CREATE INDEX "Arquivo_userId_idx" ON "Arquivo"("userId");

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
