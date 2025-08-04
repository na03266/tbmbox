import { Test, TestingModule } from '@nestjs/testing';
import { TbmSnapshotController } from './tbm-snapshot.controller';
import { TbmSnapshotService } from './tbm-snapshot.service';

describe('TbmSnapshotController', () => {
  let controller: TbmSnapshotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TbmSnapshotController],
      providers: [TbmSnapshotService],
    }).compile();

    controller = module.get<TbmSnapshotController>(TbmSnapshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
