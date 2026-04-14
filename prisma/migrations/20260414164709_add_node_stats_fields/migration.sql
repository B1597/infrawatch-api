/*
  Warnings:

  - You are about to drop the `NodeMetrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NodeMetrics" DROP CONSTRAINT "NodeMetrics_nodeId_fkey";

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "cpuUsage" DOUBLE PRECISION,
ADD COLUMN     "memoryUsage" DOUBLE PRECISION,
ADD COLUMN     "networkIO" TEXT,
ADD COLUMN     "networkOut" TEXT,
ADD COLUMN     "uptimeDays" INTEGER;

-- DropTable
DROP TABLE "NodeMetrics";
