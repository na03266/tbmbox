import { Injectable } from '@nestjs/common';
import { CreateTbmSnapshotDto } from './dto/create-tbm-snapshot.dto';
import { UpdateTbmSnapshotDto } from './dto/update-tbm-snapshot.dto';

@Injectable()
export class TbmSnapshotService {
  create(createTbmSnapshotDto: CreateTbmSnapshotDto) {
    return 'This action adds a new tbmSnapshot';
  }

  findAll() {
    return `This action returns all tbmSnapshot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tbmSnapshot`;
  }

  update(id: number, updateTbmSnapshotDto: UpdateTbmSnapshotDto) {
    return `This action updates a #${id} tbmSnapshot`;
  }

  remove(id: number) {
    return `This action removes a #${id} tbmSnapshot`;
  }
}
