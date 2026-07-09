import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';

describe('FilmsService', () => {
  let service: FilmsService;

  let mockFrom: jest.Mock;
  let mockWhere: jest.Mock;
  let mockLimit: jest.Mock;
  let mockReturning: jest.Mock;

  let mockDb: any;

  const createMock = () => {
    mockLimit = jest.fn();
    mockWhere = jest.fn(() => ({ limit: mockLimit }));
    mockFrom = jest.fn(() => ({ where: mockWhere, limit: mockLimit }));
    mockReturning = jest.fn();

    mockDb = {
      select: jest.fn(() => ({ from: mockFrom })),
      insert: jest.fn(() => ({
        values: jest.fn(() => ({
          returning: mockReturning,
        })),
      })),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn(() => ({
            returning: mockReturning,
          })),
        })),
      })),
      delete: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: mockReturning,
        })),
      })),
    };
  };

  beforeEach(async () => {
    createMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: 'DRIZZLE', useValue: mockDb },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all films', async () => {
      mockFrom.mockReturnValue(Promise.resolve([{ id: 1, slug: 'test' }]));
      const result = await service.findAll();
      expect(result).toEqual([{ id: 1, slug: 'test' }]);
    });
  });

  describe('findById', () => {
    it('should return film by id', async () => {
      mockLimit.mockResolvedValue([{ id: 1, slug: 'test' }]);
      const result = await service.findById(1);
      expect(result).toEqual([{ id: 1, slug: 'test' }]);
    });
  });

  describe('create', () => {
    it('should return created film', async () => {
      const data = { slug: 'new-film', tvSeries: false };
      mockReturning.mockResolvedValue([{ id: 1, ...data }]);
      const result = await service.create(data);
      expect(result).toEqual([{ id: 1, ...data }]);
    });
  });

  describe('delete', () => {
    it('should call delete with id', async () => {
      mockReturning.mockResolvedValue([{ id: 1 }]);
      const result = await service.delete(1);
      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
