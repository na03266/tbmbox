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

	async create(req: any, createTbmDto: CreateTbmDto) {
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
			createdBy: req.user.sub,
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
		qb.leftJoinAndSelect('tbm.workshop', 'workshop');
		qb.leftJoinAndSelect('tbm.creator', 'creator');
		qb.where('tbm.deletedAt IS NULL');
		//
		// if (taskIds?.length) {
		// 	qb.innerJoin('tbm.tasks', 'filterTask') // ← 필터 전용 alias
		// 		.andWhere('filterTask.id IN (:...taskIds)', { taskIds });
		// }
		qb.distinct(true); // 중복 TBM 제거
		if (searchKey && searchValue) {
			qb.andWhere(`${searchKey} LIKE :searchValue`, {
				searchValue: `%${searchValue}%`,
			});
		}

		const data = await qb.getMany();
		const total = await qb.getCount();

		return {
			data: data.map((tbm) => ({
				id: tbm.id,
				title: tbm.title,
				createdBy: tbm.creator?.name,
				createdAt: tbm.createdAt.toLocaleString(),
				workshop: tbm.workshop,
			})),
			total: total,
		};
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

	async generateTbmContent(dto: GenerateTbmDto) {
		const workshop = await this.workshopRepository.findOne({
			where: { id: dto.workshopId },
		});

		const tasks = await this.taskRepository.find({
			where: {
				id: In(dto.taskIds ?? []),
			},
		});
		const prompt = `
		아래 정보를 참고하여 TBM 교육 내용을 작성하라.
		제목(참고 목적): ${dto.title}
		본문(참고 목적): """${dto.content ?? ''}"""
		진행되는 작업: ${tasks.map((task) => `(${task.title}, ${task.description})`).join(', ')}
		작업 현장 정보: ${workshop?.name} ${workshop?.address}
		`;
		const system = [
			'너는 산업안전 TBM 교안을 작성하는 편집자다.',
			'반드시 유효한 HTML fragment만 출력한다.',
			'설명문, 코드블록, 마크다운, JSON은 금지한다.',
			'한국어로 간결하게 작성한다.',
			'본문의 내용은 가능한 길게 작성한다.',
			'본문의 내용은 TBM교육을 대체할 수 있어야 한다.',
			'에디터의 꾸밈효과가 적용 가능하다.',
			'에디터에 삽입할 수있는 형식이어야 한다.',
			'본문만 반환한다.',
			'HTML 외 텍스트는 금지한다.',
		].join('\n');

		return await this.commonService.generateWithOllama(prompt, system);
	}
}
