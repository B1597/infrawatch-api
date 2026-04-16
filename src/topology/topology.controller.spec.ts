import { Test, TestingModule } from '@nestjs/testing';
import { TopologyController } from './topology.controller';
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

describe('TopologyController', () => {
  let controller: TopologyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopologyController],
      providers: [
        TopologyService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<TopologyController>(TopologyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
