import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseArrayPipe,
	Patch,
	Post,
	Request,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { TbmService } from './tbm.service';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { UpdateTbmDto } from './dto/update-tbm.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('tbm')
export class TbmController {
	constructor(private readonly tbmService: TbmService) {}

	@Post()
	create(@Request() req: any, @Body() createTbmDto: CreateTbmDto) {
		return this.tbmService.create(req.user.sub, createTbmDto);
	}

	@Get()
	findAll(
		@Query(
			'taskIds',
			new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
		)
		taskIds?: number[],
	) {
		return this.tbmService.findAll(taskIds);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.tbmService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTbmDto: UpdateTbmDto) {
		return this.tbmService.update(+id, updateTbmDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.tbmService.remove(+id);
	}
}
