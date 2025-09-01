import { Test, TestingModule } from '@nestjs/testing';
import { TbmUserService } from './tbm.user.service';

describe('TbmUserService', () => {
  let service: TbmUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TbmUserService],
    }).compile();

    service = module.get<TbmUserService>(TbmUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
