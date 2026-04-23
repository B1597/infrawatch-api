import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TopologyService } from './topology.service';
import { PrismaService } from '../prisma/prisma.service';

const mockNode = {
  id: 'node-1',
  name: 'Test Server',
  type: 'server',
  status: 'online',
  parentId: 'rack-1',
  location: 'Frankfurt',
  ipAddress: '192.168.1.1',
  floor: null,
  vendor: 'Dell',
  serialNumber: 'SN123',
  cpuCores: 8,
  memoryCapacity: '32 GB',
  storageCapacity: '512 GB',
  firmware: '1.0.0',
  cpuUsage: 45.0,
  memoryUsage: 72.0,
  networkIO: '100 MB/s',
  networkOut: '50 MB/s',
  uptimeDays: 30,
  availability: '99.9%',
  networkUsage: 60.0,
  storageUsage: 85.0,
  createdAt: new Date(),
  config: null,
};

const mockPrismaService = {
  db: {
    node: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    nodeMetrics: {
      findUnique: jest.fn(),
    },
  },
};

describe('TopologyService', () => {
  let service: TopologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopologyService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TopologyService>(TopologyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRacks', () => {
    it('should throw NotFoundException if datacenter not found', async () => {
      mockPrismaService.db.node.findFirst.mockResolvedValue(null);

      await expect(service.getRacks('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return racks for a valid datacenter', async () => {
      mockPrismaService.db.node.findFirst.mockResolvedValue({
        ...mockNode,
        type: 'datacenter',
      });
      mockPrismaService.db.node.findMany.mockResolvedValue([
        { ...mockNode, type: 'rack', floor: '1st Floor' },
      ]);

      const result = await service.getRacks('node-1');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('rack');
    });
  });

  describe('getDevices', () => {
    it('should throw NotFoundException if rack not found', async () => {
      mockPrismaService.db.node.findFirst.mockResolvedValue(null);

      await expect(service.getDevices('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return devices for a valid rack', async () => {
      mockPrismaService.db.node.findFirst.mockResolvedValue({
        ...mockNode,
        type: 'rack',
      });
      mockPrismaService.db.node.findMany.mockResolvedValue([mockNode]);

      const result = await service.getDevices('rack-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('node-1');
    });
  });

  describe('getNodeDetails', () => {
    it('should throw NotFoundException if node not found', async () => {
      mockPrismaService.db.node.findUnique.mockResolvedValue(null);

      await expect(service.getNodeDetails('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return node details with correct data transformation', async () => {
      mockPrismaService.db.node.findUnique.mockResolvedValue(mockNode);

      const result = await service.getNodeDetails('node-1');

      expect(result.id).toBe('node-1');
      expect(result.hardware.cpuCores).toBe(8);
      expect(result.stats.cpuUsage).toBe(45.0);
    });

    it('should handle null fields with fallback values', async () => {
      mockPrismaService.db.node.findUnique.mockResolvedValue({
        ...mockNode,
        vendor: null,
        serialNumber: null,
        cpuCores: null,
        cpuUsage: null,
        memoryUsage: null,
      });

      const result = await service.getNodeDetails('node-1');

      expect(result.vendor).toBe('');
      expect(result.serialNumber).toBe('');
      expect(result.hardware.cpuCores).toBe(0);
      expect(result.stats.cpuUsage).toBe(0);
      expect(result.stats.memoryUsage).toBe(0);
    });
  });

  describe('checkNameExists', () => {
    it('should return exists: true if node with name found', async () => {
      mockPrismaService.db.node.findFirst.mockResolvedValue(mockNode);

      const result = await service.checkNameExists('Test Server');

      expect(result.exists).toBe(true);
    });

    it('should return exists: false if no node found', async () => {
      mockPrismaService.db.node.findFirst.mockResolvedValue(null);

      const result = await service.checkNameExists('Nonexistent');

      expect(result.exists).toBe(false);
    });
  });
});
