import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import topologyRaw from '../src/topology/data/topology.json';
import nodeConfigRaw from '../src/topology/data/node-config.json';
import nodeDetailsRaw from '../src/topology/data/node-details.json';
import nodeMetricsRaw from '../src/topology/data/node-metrics.json';
import alertsRaw from '../src/alerts/data/alerts.json';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // old string IDs (e.g. "dc-west") → new UUIDs, needed to link parents and configs
  const idMap = new Map<string, string>();

  // first pass — insert all nodes without parents and merge additional details
  for (const item of topologyRaw) {
    const details = (nodeDetailsRaw as any[]).find((d) => d.id === item.id);

    const node = await prisma.node.create({
      data: {
        name: item.label,
        type: item.type,
        status: (item as any).state ?? item.status ?? 'unknown', // json uses both "state" and "status"
        location: (item as any).location ?? null,
        ipAddress: (item as any).ip ?? null,
        floor: (item as any).meta?.floor ?? null, // was nested in meta.floor in the json
        vendor: details?.vendor ?? null,
        serialNumber: details?.serialNumber ?? null,
        cpuCores: details?.hardware?.cpuCores ?? null,
        memoryCapacity: details?.hardware?.memory ?? null,
        storageCapacity: details?.hardware?.storage ?? null,
        firmware: details?.hardware?.firmware ?? null,
        cpuUsage: details?.stats?.cpuUsage ?? null,
        memoryUsage: details?.stats?.memoryUsage ?? null,
        networkUsage: details?.stats?.networkUsage ?? null,
        storageUsage: details?.stats?.storageUsage ?? null,
        networkIO: details?.stats?.networkIO ?? null,
        networkOut: details?.stats?.networkOut ?? null,
        uptimeDays: details?.stats?.uptimeDays ?? null,
        availability: details?.stats?.availability ?? null,
      },
    });
    idMap.set(item.id, node.id);
  }

  // second pass — wire up parent relationships now that all nodes exist
  for (const item of topologyRaw) {
    if (item.parent) {
      const nodeId = idMap.get(item.id);
      const parentId = idMap.get(item.parent);
      if (nodeId && parentId) {
        await prisma.node.update({
          where: { id: nodeId },
          data: { parentId },
        });
      }
    }
  }

  // insert config — not every node has all fields
  for (const config of nodeConfigRaw) {
    const nodeId = idMap.get(config.id);
    if (nodeId) {
      await prisma.nodeConfig.create({
        data: {
          nodeId,
          password: (config as any).password ?? null,
          registrationId: (config as any).registrationId ?? null,
          macAddress: (config as any).macAddress ?? null,
        },
      });
    }
  }

  // insert metrics — store the whole object as JSON, no mapping needed
  for (const metrics of nodeMetricsRaw as any[]) {
    const nodeId = idMap.get(metrics.id);
    if (nodeId) {
      await prisma.nodeMetrics.create({
        data: {
          nodeId,
          data: metrics,
        },
      });
    }
  }

  for (const alert of alertsRaw) {
    await prisma.alert.create({
      data: {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        status: alert.status,
        source: alert.source,
        deviceType: alert.deviceType,
        category: alert.category,
        timestamp: new Date(alert.timestamp),
        acknowledgedBy: alert.acknowledgedBy ?? null,
      },
    });
  }

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
