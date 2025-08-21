import { Test, TestingModule } from '@nestjs/testing';
import { DashController } from './dash.controller';
import { DashService } from './dash.service';

describe('DashController', () => {
  let controller: DashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashController],
      providers: [DashService],
    }).compile();

    controller = module.get<DashController>(DashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
