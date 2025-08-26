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
	Query,
	Request,
	UseInterceptors,
} from '@nestjs/common';
import { TbmService } from './tbm.service';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { UpdateTbmDto } from './dto/update-tbm.dto';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { GenerateTbmDto } from './dto/generate-tbm.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('tbm')
export class TbmController {
	constructor(private readonly tbmService: TbmService) {}

	@Post()
	create(@Request() req: any, @Body() createTbmDto: CreateTbmDto) {
		console.log(req.user.sub);
		return this.tbmService.create(req, createTbmDto);
	}

	@Post('generate')
	generate(
		@Body() dto: GenerateTbmDto,
	) {
		return this.tbmService.generateTbmContent(dto);
	}

	@Get()
	findAll(@Request() req: any, @Query() dto: PagePaginationDto) {
		return this.tbmService.findAll(req, dto);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.tbmService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTbmDto: UpdateTbmDto) {
		return this.tbmService.update(+id, updateTbmDto);
	}

	@Delete('multiple')
	removeMultiple(
		@Body('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
		ids: number[],
	){
		return this.tbmService.removeMultiple(ids);

	}
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.tbmService.remove(+id);
	}

}
