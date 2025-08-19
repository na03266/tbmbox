import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistLogService } from './checklist-log.service';

describe('ChecklistLogService', () => {
  let service: ChecklistLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChecklistLogService],
    }).compile();

    service = module.get<ChecklistLogService>(ChecklistLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
