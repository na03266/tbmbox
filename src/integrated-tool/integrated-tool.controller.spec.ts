import { Test, TestingModule } from '@nestjs/testing';
import { IntegratedToolController } from './integrated-tool.controller';
import { IntegratedToolService } from './integrated-tool.service';

describe('IntegratedToolController', () => {
  let controller: IntegratedToolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegratedToolController],
      providers: [IntegratedToolService],
    }).compile();

    controller = module.get<IntegratedToolController>(IntegratedToolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
