import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { IntegratedToolService } from './integrated-tool.service';
import { CreateIntegratedToolDto } from './dto/create-integrated-tool.dto';
import { UpdateIntegratedToolDto } from './dto/update-integrated-tool.dto';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('integrated-tool')
export class IntegratedToolController {
	constructor(private readonly integratedToolService: IntegratedToolService) {}

	@Post()
	create(@Body() createIntegratedToolDto: CreateIntegratedToolDto) {
		return this.integratedToolService.create(createIntegratedToolDto);
	}

	@Get()
	findAll(@Query() dto: PagePaginationDto) {
		return this.integratedToolService.findAll(dto);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.integratedToolService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateIntegratedToolDto: UpdateIntegratedToolDto,
	) {
		return this.integratedToolService.update(+id, updateIntegratedToolDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.integratedToolService.remove(+id);
	}
}
