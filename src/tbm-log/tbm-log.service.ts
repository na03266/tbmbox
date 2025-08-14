import { Injectable } from '@nestjs/common';
import { CreateTbmLogDto } from './dto/create-tbm-log.dto';
import { UpdateTbmLogDto } from './dto/update-tbm-log.dto';

@Injectable()
export class TbmLogService {
  create(createTbmLogDto: CreateTbmLogDto) {
    return 'This action adds a new tbmLog';
  }

	addConfirmUser(){
	}

  findAll() {
    return `This action returns all tbmLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tbmLog`;
  }

  update(id: number, updateTbmLogDto: UpdateTbmLogDto) {
    return `This action updates a #${id} tbmLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} tbmLog`;
  }
}
