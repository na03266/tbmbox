import { Test, TestingModule } from '@nestjs/testing';
import { TbmController } from './tbm.controller';
import { TbmService } from './tbm.service';

describe('TbmController', () => {
  let controller: TbmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TbmController],
      providers: [TbmService],
    }).compile();

    controller = module.get<TbmController>(TbmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
