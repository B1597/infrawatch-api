import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsGateway } from './alerts.gateway';

const mockAlert = {
  id: 'abc-123',
  title: 'High CPU Usage',
  message: 'CPU exceeded 90%',
  severity: 'critical',
  status: 'active',
  source: 'SRV01',
  deviceType: 'Server',
  category: 'Performance',
  timestamp: new Date('2026-04-16T10:00:00Z'),
  acknowledgedBy: null,
};

const mockAlertsGateway = {
  emitNewAlert: jest.fn(),
  emitAlertUpdated: jest.fn(),
};

const mockPrismaService = {
  db: {
    alert: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
  },
};

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AlertsGateway, useValue: mockAlertsGateway },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAlerts', () => {
    it('should return all alerts ordered by timestamp', async () => {
      mockPrismaService.db.alert.findMany.mockResolvedValue([mockAlert]);

      const result = await service.getAlerts();

      expect(result).toEqual([mockAlert]);
      expect(mockPrismaService.db.alert.findMany).toHaveBeenCalledWith({
        orderBy: { timestamp: 'desc' },
      });
    });
  });

  describe('getAlertById', () => {
    it('should return the alert if found', async () => {
      mockPrismaService.db.alert.findUnique.mockResolvedValue(mockAlert);

      const result = await service.getAlertById('abc-123');

      expect(result).toEqual(mockAlert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      mockPrismaService.db.alert.findUnique.mockResolvedValue(null);

      await expect(service.getAlertById('not-real')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('acknowledgeAlert', () => {
    it('should update status to acknowledged', async () => {
      mockPrismaService.db.alert.findUnique.mockResolvedValue(mockAlert);
      mockPrismaService.db.alert.update.mockResolvedValue({
        ...mockAlert,
        status: 'acknowledged',
        acknowledgedBy: 'admin',
      });

      const result = await service.acknowledgeAlert('abc-123');

      expect(result.status).toBe('acknowledged');
      expect(result.acknowledgedBy).toBe('admin');
    });

    it('should throw NotFoundException if alert not found', async () => {
      mockPrismaService.db.alert.findUnique.mockResolvedValue(null);

      await expect(service.acknowledgeAlert('not-real')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resolveAlert', () => {
    it('should update status to resolved', async () => {
      mockPrismaService.db.alert.findUnique.mockResolvedValue(mockAlert);
      mockPrismaService.db.alert.update.mockResolvedValue({
        ...mockAlert,
        status: 'resolved',
      });

      const result = await service.resolveAlert('abc-123');

      expect(result.status).toBe('resolved');
    });

    it('should throw NotFoundException if alert not found', async () => {
      mockPrismaService.db.alert.findUnique.mockResolvedValue(null);

      await expect(service.resolveAlert('not-real')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
