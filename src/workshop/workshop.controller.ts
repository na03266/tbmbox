import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseArrayPipe,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Request,
	UseInterceptors,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { Public } from "src/auth/decorator/public.decorator";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('workshop')
export class WorkshopController {
	constructor(private readonly workshopService: WorkshopService) {}

	@Post()
	create(@Body() createWorkshopDto: CreateWorkshopDto) {
		return this.workshopService.create(createWorkshopDto);
	}

	@Get()
	findAll(
		@Request() req:any,
		@Query() dto: PagePaginationDto,
	) {
		console.log();
		return this.workshopService.findAll(req, dto);
	}
  @Public()
	@Get('/user')
	forUser	(
		@Request() req:any,
		@Query() dto: PagePaginationDto,
	) {
		return this.workshopService.findAll(req, dto);
	}


  @Public()
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.workshopService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateWorkshopDto: UpdateWorkshopDto,
	) {
		return this.workshopService.update(+id, updateWorkshopDto);
	}

	@Patch(':id/tasks')
	updateTasks(
		@Param('id', ParseIntPipe) id: number,
		@Body('taskIds', new ParseArrayPipe({ items: Number, separator: ',' }))
		taskIds: number[],
	) {
		return this.workshopService.updateTasks(id, taskIds);
	}

	@Delete('multiple')
	removeMultiple(
		@Body('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
		ids: number[],
	) {
		return this.workshopService.removeMultiple(ids);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.workshopService.remove(+id);
	}
}
