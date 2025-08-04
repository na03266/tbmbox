import { Test, TestingModule } from '@nestjs/testing';
import { TbmSnapshotService } from './tbm-snapshot.service';

describe('TbmSnapshotService', () => {
  let service: TbmSnapshotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TbmSnapshotService],
    }).compile();

    service = module.get<TbmSnapshotService>(TbmSnapshotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
