import { Test, TestingModule } from '@nestjs/testing';
import { TbmService } from './tbm.service';

describe('TbmService', () => {
  let service: TbmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TbmService],
    }).compile();

    service = module.get<TbmService>(TbmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
