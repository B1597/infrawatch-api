-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_parentId_fkey";

-- DropForeignKey
ALTER TABLE "NodeConfig" DROP CONSTRAINT "NodeConfig_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "NodeMetrics" DROP CONSTRAINT "NodeMetrics_nodeId_fkey";

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeMetrics" ADD CONSTRAINT "NodeMetrics_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeConfig" ADD CONSTRAINT "NodeConfig_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
