import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockLimit = jest.fn();
  const mockReturning = jest.fn();
  const mockValues = jest.fn(() => ({ returning: mockReturning }));
  let mockWhereResult: any[] = [];

  const mockWhere = jest.fn().mockImplementation(() => {
    const arr: any = [...mockWhereResult];
    arr.limit = mockLimit;
    return arr;
  });

  const mockFrom = jest.fn(() => ({ where: mockWhere, limit: mockLimit }));

  const mockDb: any = {
    select: jest.fn(() => ({ from: mockFrom })),
    insert: jest.fn(() => ({ values: mockValues })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn().mockResolvedValue(undefined),
      })),
    })),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-access-token'),
  };

  beforeEach(async () => {
    mockWhereResult = [];
    mockLimit.mockReset();
    mockReturning.mockReset();
    mockReturning.mockResolvedValue([{ id: 1 }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'DRIZZLE', useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if username exists', async () => {
      mockWhereResult = [{ id: 1 }];
      await expect(service.register('existing', 'test@test.com', 'pass')).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens for new username', async () => {
      mockLimit.mockResolvedValue([{ id: 1 }]);
      const result = await service.register('newuser', 'new@test.com', 'pass123');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should create UserType if none exists', async () => {
      mockLimit.mockResolvedValue([]);
      mockReturning.mockResolvedValue([{ id: 2 }]);
      const result = await service.register('another', 'a@test.com', 'pass123');
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      await expect(service.validateUser('nobody', 'pass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if refresh token invalid', async () => {
      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
