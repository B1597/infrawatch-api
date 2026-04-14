/*
  Warnings:

  - You are about to drop the column `cpu` on the `NodeMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `NodeMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `network` on the `NodeMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `storage` on the `NodeMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `uptime` on the `NodeMetrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "cpuCores" INTEGER,
ADD COLUMN     "firmware" TEXT,
ADD COLUMN     "memoryCapacity" TEXT,
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "storageCapacity" TEXT,
ADD COLUMN     "vendor" TEXT;

-- AlterTable
ALTER TABLE "NodeMetrics" DROP COLUMN "cpu",
DROP COLUMN "memory",
DROP COLUMN "network",
DROP COLUMN "storage",
DROP COLUMN "uptime",
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "cpuUsage" DOUBLE PRECISION,
ADD COLUMN     "memoryUsage" DOUBLE PRECISION,
ADD COLUMN     "networkIO" TEXT,
ADD COLUMN     "networkOut" TEXT,
ADD COLUMN     "uptimeDays" INTEGER;
