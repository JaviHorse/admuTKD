CREATE TABLE "DashboardPost" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DashboardPost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DashboardPost_createdAt_idx" ON "DashboardPost"("createdAt");
CREATE INDEX "DashboardPost_authorId_idx" ON "DashboardPost"("authorId");
ALTER TABLE "DashboardPost" ADD CONSTRAINT "DashboardPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
