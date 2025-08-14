import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TbmLogService } from './tbm-log.service';
import { CreateTbmLogDto } from './dto/create-tbm-log.dto';
import { UpdateTbmLogDto } from './dto/update-tbm-log.dto';

@Controller('tbm-log')
export class TbmLogController {
  constructor(private readonly tbmLogService: TbmLogService) {}

  @Post()
  create(@Body() createTbmLogDto: CreateTbmLogDto) {
    return this.tbmLogService.create(createTbmLogDto);
  }

  @Get()
  findAll() {
    return this.tbmLogService.findAll();
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
