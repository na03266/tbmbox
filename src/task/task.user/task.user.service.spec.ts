import { Test, TestingModule } from '@nestjs/testing';
import { TaskUserService } from './task.user.service';

describe('TaskUserService', () => {
  let service: TaskUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskUserService],
    }).compile();

    service = module.get<TaskUserService>(TaskUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
