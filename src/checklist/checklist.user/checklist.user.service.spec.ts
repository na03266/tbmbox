import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistUserService } from './checklist.user.service';

describe('ChecklistUserService', () => {
  let service: ChecklistUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChecklistUserService],
    }).compile();

    service = module.get<ChecklistUserService>(ChecklistUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
