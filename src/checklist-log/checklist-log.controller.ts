import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Request,
} from '@nestjs/common';
import { ChecklistLogService } from './checklist-log.service';
import { CreateChecklistLogDto } from './dto/create-checklist-log.dto';
import { UpdateChecklistLogDto } from './dto/update-checklist-log.dto';

@Controller('checklist-log')
export class ChecklistLogController {
	constructor(private readonly checklistLogService: ChecklistLogService) {}

	@Post()
	create(
		@Request() req: any,
		@Body() createChecklistLogDto: CreateChecklistLogDto,
	) {
		return this.checklistLogService.create(req, createChecklistLogDto);
	}

	@Get()
	findAll(
		@Request() req: any,
		@Query('searchKey') searchKey?: string,
		@Query('searchValue') searchValue?: string,
	) {
		return this.checklistLogService.findAll(req, searchKey, searchValue);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.checklistLogService.findOne(+id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.checklistLogService.remove(+id);
	}
}
