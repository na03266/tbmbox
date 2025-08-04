import { Module } from '@nestjs/common';
import { TbmService } from './tbm.service';
import { TbmController } from './tbm.controller';

@Module({
  controllers: [TbmController],
  providers: [TbmService],
})
export class TbmModule {}
