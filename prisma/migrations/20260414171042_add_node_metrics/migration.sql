-- CreateTable
CREATE TABLE "NodeMetrics" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "NodeMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NodeMetrics_nodeId_key" ON "NodeMetrics"("nodeId");

-- AddForeignKey
ALTER TABLE "NodeMetrics" ADD CONSTRAINT "NodeMetrics_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
