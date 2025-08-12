import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { UpdateTbmDto } from './dto/update-tbm.dto';
import { Tbm } from './entities/tbm.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';

@Injectable()
export class TbmService {
  constructor(
    @InjectRepository(Tbm)
    private readonly tbmRepository: Repository<Tbm>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  async create(createTbmDto: CreateTbmDto) {
    const workshop = await this.workshopRepository.findOne({ where: { id: createTbmDto.workshopId } });
    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    const tbm = this.tbmRepository.create({
      name: createTbmDto.name,
      content: createTbmDto.content,
      workshopId: createTbmDto.workshopId,
    });

    if (createTbmDto.taskIds && createTbmDto.taskIds.length) {
      const tasks = await this.taskRepository.findBy({ id: In(createTbmDto.taskIds) });
      tbm.tasks = tasks;
    }

    return this.tbmRepository.save(tbm);
  }

  findAll() {
    return this.tbmRepository.find({ where: { }, relations: ['tasks'] });
  }

  async findOne(id: number) {
    const tbm = await this.tbmRepository.findOne({ where: { id }, relations: ['tasks'] });
    if (!tbm) {
      throw new NotFoundException('Tbm not found');
    }
    return tbm;
  }

  async update(id: number, updateTbmDto: UpdateTbmDto) {
    const tbm = await this.tbmRepository.findOne({ where: { id }, relations: ['tasks'] });
    if (!tbm) {
      throw new NotFoundException('Tbm not found');
    }

    if (updateTbmDto.taskIds) {
      const tasks = await this.taskRepository.findBy({ id: In(updateTbmDto.taskIds) });
      tbm.tasks = tasks;
    }

    // assign scalar fields
    if (typeof updateTbmDto.name !== 'undefined') tbm.name = updateTbmDto.name;
    if (typeof updateTbmDto.content !== 'undefined') tbm.content = updateTbmDto.content;
    if (typeof updateTbmDto.workshopId !== 'undefined') {
      const workshop = await this.workshopRepository.findOne({ where: { id: updateTbmDto.workshopId } });
      if (!workshop) {
        throw new NotFoundException('Workshop not found');
      }
      tbm.workshopId = updateTbmDto.workshopId;
    }

    return this.tbmRepository.save(tbm);
  }

  async remove(id: number) {
    const tbm = await this.tbmRepository.findOne({ where: { id } });
    if (!tbm) {
      throw new NotFoundException('Tbm not found');
    }
    await this.tbmRepository.softRemove(tbm);
    return id;
  }
}
