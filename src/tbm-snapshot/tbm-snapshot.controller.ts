import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TbmSnapshotService } from './tbm-snapshot.service';
import { CreateTbmSnapshotDto } from './dto/create-tbm-snapshot.dto';
import { UpdateTbmSnapshotDto } from './dto/update-tbm-snapshot.dto';

@Controller('tbm-snapshot')
export class TbmSnapshotController {
  constructor(private readonly tbmSnapshotService: TbmSnapshotService) {}

  @Post()
  create(@Body() createTbmSnapshotDto: CreateTbmSnapshotDto) {
    return this.tbmSnapshotService.create(createTbmSnapshotDto);
  }

  @Get()
  findAll() {
    return this.tbmSnapshotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tbmSnapshotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTbmSnapshotDto: UpdateTbmSnapshotDto) {
    return this.tbmSnapshotService.update(+id, updateTbmSnapshotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tbmSnapshotService.remove(+id);
  }
}
