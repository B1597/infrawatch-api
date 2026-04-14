/*
  Warnings:

  - Added the required column `status` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "floor" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "NodeConfig" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "password" TEXT,
    "registrationId" TEXT,
    "macAddress" TEXT,

    CONSTRAINT "NodeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeMetrics" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "cpu" DOUBLE PRECISION,
    "memory" DOUBLE PRECISION,
    "network" DOUBLE PRECISION,
    "storage" DOUBLE PRECISION,
    "uptime" TEXT,

    CONSTRAINT "NodeMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NodeConfig_nodeId_key" ON "NodeConfig"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "NodeMetrics_nodeId_key" ON "NodeMetrics"("nodeId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeConfig" ADD CONSTRAINT "NodeConfig_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeMetrics" ADD CONSTRAINT "NodeMetrics_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
