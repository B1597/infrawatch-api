import { Test, TestingModule } from '@nestjs/testing';
import { TopologyService } from './topology.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  db: {
    node: {
      findMany: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
