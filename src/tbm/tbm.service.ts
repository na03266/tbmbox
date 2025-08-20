import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTbmDto } from './dto/create-tbm.dto';
import { UpdateTbmDto } from './dto/update-tbm.dto';
import { Tbm } from './entities/tbm.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { CommonService } from '../common/common.service';
import { GenerateTbmDto } from './dto/generate-tbm.dto';

@Injectable()
export class TbmService {
	constructor(
		@InjectRepository(Tbm)
		private readonly tbmRepository: Repository<Tbm>,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(Workshop)
		private readonly workshopRepository: Repository<Workshop>,
		private readonly commonService: CommonService,
	) {}

	async create(userId: number, createTbmDto: CreateTbmDto) {
		const workshop = await this.workshopRepository.findOne({
			where: { id: createTbmDto.workshopId },
		});
		if (!workshop) {
			throw new NotFoundException('Workshop not found');
		}

		const tbm = this.tbmRepository.create({
			title: createTbmDto.title,
			content: createTbmDto.content,
			workshopId: createTbmDto.workshopId,
			companyId: workshop.companyId,
			createdBy: createTbmDto.createdBy ?? userId,
		});

		if (createTbmDto.taskIds && createTbmDto.taskIds.length) {
			const tasks = await this.taskRepository.findBy({
				id: In(createTbmDto.taskIds),
			});

			if (tasks.length !== createTbmDto.taskIds.length) {
				throw new NotFoundException('Some tasks were not found');
			}

			tbm.tasks = tasks;
		}

		return this.tbmRepository.save(tbm);
	}

	async findAll(req: any, dto: PagePaginationDto) {
		const { searchKey, searchValue } = dto;
		const qb = this.tbmRepository.createQueryBuilder('tbm');

		qb.leftJoinAndSelect('tbm.tasks', 'task');
		qb.where('tbm.deletedAt IS NULL');
		//
		// if (taskIds?.length) {
		// 	qb.innerJoin('tbm.tasks', 'filterTask') // ← 필터 전용 alias
		// 		.andWhere('filterTask.id IN (:...taskIds)', { taskIds });
		// }
		qb.distinct(true); // 중복 TBM 제거

		const tbms = await qb.getMany();
		return tbms.map((tbm) => ({
			id: tbm.id,
			title: tbm.title,
		}));
	}

	async findOne(id: number) {
		const tbm = await this.tbmRepository.findOne({
			where: { id },
			relations: ['tasks'],
		});
		if (!tbm) {
			throw new NotFoundException('Tbm not found');
		}
		return tbm;
	}

	async update(id: number, updateTbmDto: UpdateTbmDto) {
		const tbm = await this.tbmRepository.findOne({
			where: { id },
			relations: ['tasks'],
		});

		if (!tbm) {
			throw new NotFoundException('Tbm not found');
		}

		if (updateTbmDto.taskIds) {
			tbm.tasks = await this.taskRepository.findBy({
				id: In(updateTbmDto.taskIds),
			});
		}

		// assign scalar fields
		if (typeof updateTbmDto.title !== 'undefined')
			tbm.title = updateTbmDto.title;
		if (typeof updateTbmDto.content !== 'undefined')
			tbm.content = updateTbmDto.content;
		if (typeof updateTbmDto.workshopId !== 'undefined') {
			const workshop = await this.workshopRepository.findOne({
				where: { id: updateTbmDto.workshopId },
			});
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

	async generateTbmContent(generateTbmDto: GenerateTbmDto) {
		// let tbmPrompts = [];
		// if (generateTbmDto.title) {
		// 	tbmPrompts.push(`title: ${generateTbmDto.title}`);
		// }
		// if (generateTbmDto.content) {
		// 	tbmPrompts.push(`content: ${generateTbmDto.content}`);
		// }
		//
		// if (generateTbmDto.taskIds && generateTbmDto.taskIds.length) {
		// 	const tasks = await this.taskRepository.findBy({
		// 		id: In(generateTbmDto.taskIds),
		// 	});
		// }

		// return await this.commonService.generateWithOllama(Parse.json(generateTbmDto) );
	}
}
