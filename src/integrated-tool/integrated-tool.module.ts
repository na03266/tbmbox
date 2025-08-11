import { Module } from '@nestjs/common';
import { IntegratedToolService } from './integrated-tool.service';
import { IntegratedToolController } from './integrated-tool.controller';
import { IntegratedTool } from './entities/integrated-tool.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([IntegratedTool])],
	controllers: [IntegratedToolController],
	providers: [IntegratedToolService],
})
export class IntegratedToolModule {}
