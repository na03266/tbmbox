import { Test, TestingModule } from '@nestjs/testing';
import { TbmLogService } from './tbm-log.service';

describe('TbmLogService', () => {
  let service: TbmLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TbmLogService],
    }).compile();

    service = module.get<TbmLogService>(TbmLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
