import { Test, TestingModule } from '@nestjs/testing';
import { TbmLogController } from './tbm-log.controller';
import { TbmLogService } from './tbm-log.service';

describe('TbmLogController', () => {
  let controller: TbmLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TbmLogController],
      providers: [TbmLogService],
    }).compile();

    controller = module.get<TbmLogController>(TbmLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
