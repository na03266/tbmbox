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
	Request,
	UseInterceptors,
} from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('checklist')
export class ChecklistController {
	constructor(private readonly checklistService: ChecklistService) {
	}

	@Post()
	create(@Request() req: any, @Body() createChecklistDto: CreateChecklistDto) {
		return this.checklistService.create(req, createChecklistDto);
	}

	@Get()
	findAll(@Request() req: any, @Query() dto: PagePaginationDto) {
		return this.checklistService.findAll(req, dto);
	}

	@Get('task')
	findForTask(@Request() req: any) {
		return this.checklistService.findForTask(req);
	}

	@Post('generate')
	generate(@Body() dto: CreateChecklistDto) {
		return this.checklistService.generateChecklistItems(dto);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.checklistService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateChecklistDto: UpdateChecklistDto,
	) {
		return this.checklistService.update(+id, updateChecklistDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.checklistService.remove(+id);
	}
}
