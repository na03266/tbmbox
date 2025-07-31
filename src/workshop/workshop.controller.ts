import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('workshop')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopService.create(createWorkshopDto);
  }

  @Get(':id')
  findByCompany(@Param('id') id: string) {
    return this.workshopService.findByCompany(+id);
  }

  @Get()
  findAll() {
    return this.workshopService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkshopDto: UpdateWorkshopDto) {
    return this.workshopService.update(+id, updateWorkshopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workshopService.remove(+id);
  }
}
