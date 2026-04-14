import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import topologyRaw from '../src/topology/data/topology.json';
import nodeConfigRaw from '../src/topology/data/node-config.json';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // old string IDs (e.g. "dc-west") → new UUIDs, needed to link parents and configs
  const idMap = new Map<string, string>();

  // first pass — insert all nodes without parents
  for (const item of topologyRaw) {
    const node = await prisma.node.create({
      data: {
        name: item.label,
        type: item.type,
        status: (item as any).state ?? item.status ?? 'unknown', // json uses both "state" and "status"
        location: (item as any).location ?? null,
        ipAddress: (item as any).ip ?? null,
        floor: (item as any).meta?.floor ?? null, // was nested in meta.floor in the json
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
