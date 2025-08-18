import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	Request,
	UseInterceptors,
	ClassSerializerInterceptor,
} from '@nestjs/common';
import { TbmLogService } from './tbm-log.service';
import { CreateTbmLogDto } from './dto/create-tbm-log.dto';
import { UpdateTbmLogDto } from './dto/update-tbm-log.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('tbm-log')
export class TbmLogController {
  constructor(private readonly tbmLogService: TbmLogService) {}

  @Post()
  create(@Body() createTbmLogDto: CreateTbmLogDto) {
    return this.tbmLogService.create(createTbmLogDto);
  }

  @Get()
  findAll(
		@Request() req: any,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string,
		@Query('searchKey') searchKey?: string,
		@Query('searchValue') searchValue?: string,
	) {
    return this.tbmLogService.findAll(req, startDate, endDate, searchKey, searchValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tbmLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTbmLogDto: UpdateTbmLogDto) {
    return this.tbmLogService.update(+id, updateTbmLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tbmLogService.remove(+id);
  }
}
