import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  db: {
    node: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return correct stats from db', async () => {
      mockPrismaService.db.node.count
        .mockResolvedValueOnce(100) // totalNodes
        .mockResolvedValueOnce(60)  // online
        .mockResolvedValueOnce(10)  // warnings
        .mockResolvedValueOnce(20)  // offline
        .mockResolvedValueOnce(5)   // datacenters
        .mockResolvedValueOnce(15)  // racks
        .mockResolvedValueOnce(30)  // servers
        .mockResolvedValueOnce(0)   // vms
        .mockResolvedValueOnce(0);  // services

      const result = await service.getStats();

      expect(result.totalNodes).toBe(100);
      expect(result.online).toBe(60);
      expect(result.warnings).toBe(10);
      expect(result.offline).toBe(20);
      expect(result.datacenters).toBe(5);
      expect(result.racks).toBe(15);
      expect(result.servers).toBe(30);
      expect(result.vms).toBe(0);
      expect(result.services).toBe(0);
    });

  });

  describe('getHealth', () => {
    it('should return rounded averages from db', async () => {
      mockPrismaService.db.node.aggregate.mockResolvedValue({
        _avg: {
          cpuUsage: 45.6789,
          memoryUsage: 72.1234,
          networkUsage: 60.9,
          storageUsage: 88.4,
        },
      });

      const result = await service.getHealth();

      expect(result.cpu).toBe(46);
      expect(result.memory).toBe(72);
      expect(result.network).toBe(61);
      expect(result.storage).toBe(88);
    });

    it('should return 0 when values are null', async () => {
      mockPrismaService.db.node.aggregate.mockResolvedValue({
        _avg: {
          cpuUsage: null,
          memoryUsage: null,
          networkUsage: null,
          storageUsage: null,
        },
      });

      const result = await service.getHealth();

      expect(result.cpu).toBe(0);
      expect(result.memory).toBe(0);
      expect(result.network).toBe(0);
      expect(result.storage).toBe(0);
    });
  });
});
