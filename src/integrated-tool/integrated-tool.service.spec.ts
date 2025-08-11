import { Test, TestingModule } from '@nestjs/testing';
import { IntegratedToolService } from './integrated-tool.service';

describe('IntegratedToolService', () => {
  let service: IntegratedToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegratedToolService],
    }).compile();

    service = module.get<IntegratedToolService>(IntegratedToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
