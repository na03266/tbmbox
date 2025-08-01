import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
	Request
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { UserRole } from '../users/entities/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('workshop')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopService.create(createWorkshopDto);
  }


  @Get()
  findAll(@Request() req) {
		if(req.user.role == UserRole.SUPERADMIN){
			return this.workshopService.findAll();
		}else{
			return this.workshopService.findByCompany(req.user.companyId);
		}
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
