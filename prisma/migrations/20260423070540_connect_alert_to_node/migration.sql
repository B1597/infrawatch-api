-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "nodeId" TEXT;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
