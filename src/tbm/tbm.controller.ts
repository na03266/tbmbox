import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TbmService } from './tbm.service';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { UpdateTbmDto } from './dto/update-tbm.dto';

@Controller('tbm')
export class TbmController {
  constructor(private readonly tbmService: TbmService) {}

  @Post()
  create(@Body() createTbmDto: CreateTbmDto) {
    return this.tbmService.create(createTbmDto);
  }

  @Get()
  findAll() {
    return this.tbmService.findAll();
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
