import { Injectable } from '@nestjs/common';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { UpdateTbmDto } from './dto/update-tbm.dto';

@Injectable()
export class TbmService {
  create(createTbmDto: CreateTbmDto) {
    return 'This action adds a new tbm';
  }

  findAll() {
    return `This action returns all tbm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tbm`;
  }

  update(id: number, updateTbmDto: UpdateTbmDto) {
    return `This action updates a #${id} tbm`;
  }

  remove(id: number) {
    return `This action removes a #${id} tbm`;
  }
}
