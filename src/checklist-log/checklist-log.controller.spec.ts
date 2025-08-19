import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistLogController } from './checklist-log.controller';
import { ChecklistLogService } from './checklist-log.service';

describe('ChecklistLogController', () => {
  let controller: ChecklistLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecklistLogController],
      providers: [ChecklistLogService],
    }).compile();

    controller = module.get<ChecklistLogController>(ChecklistLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
