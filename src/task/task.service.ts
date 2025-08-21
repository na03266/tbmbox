import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../users/entities/user.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { Tool } from '../tool/entities/tool.entity';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { CommonService } from '../common/common.service';
import { GenerateTbmDto } from '../tbm/dto/generate-tbm.dto';

@Injectable()
export class TaskService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(Tool)
		private readonly toolRepository: Repository<Tool>,
		@InjectRepository(Workshop)
		private readonly workshopRepository: Repository<Workshop>,
		private readonly dataSource: DataSource,
		private readonly commonService: CommonService,
	) {}

	async create(createTaskDto: CreateTaskDto) {
		const qr = this.dataSource.createQueryRunner();
		await qr.connect();
		await qr.startTransaction();

		try {
			const task = await qr.manager
				.createQueryBuilder()
				.insert()
				.into(Task)
				.values({
					title: createTaskDto.title,
					description: createTaskDto.description,
					companyId: createTaskDto.companyId,
				})
				.execute();

			const taskId = task.identifiers[0].id;
			await qr.commitTransaction();

			return await this.taskRepository.findOne({
				where: { id: taskId },
			});
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	}

	/// pagination
	findAll(req: any, dto: PagePaginationDto) {
		const { searchKey, searchValue } = dto;
		const qb = this.taskRepository.createQueryBuilder('task');

		qb.where('task.deletedAt IS NULL');

		if (req?.user?.role !== UserRole.MASTER) {
			qb.andWhere('task.companyId = :id', { id: req.user.companyId });
		}

		if (req?.user?.role === UserRole.USER && req.user.workshopId) {
			qb.andWhere('task.workshopId = :workshopId', {
				workshopId: req.user.workshopId,
			});
		}

		if (searchKey && searchValue) {
			qb.andWhere(`task.${searchKey} LIKE :searchValue`, {
				searchValue: `%${searchValue}%`,
			});
		}

		this.commonService.applyPagePaginationParamToQb(qb, dto);

		return qb.getMany();
	}

	findOne(id: number) {
		const task = this.taskRepository.findOne({ where: { id } });

		if (!task) {
			throw new NotFoundException('Task not found');
		}

		return task;
	}

	async update(id: number, updateTaskDto: UpdateTaskDto) {
		const task = await this.taskRepository.findOne({ where: { id } });

		if (!task) {
			throw new NotFoundException('Task not found');
		}

		await this.taskRepository.update(id, updateTaskDto);

		return await this.taskRepository.findOne({ where: { id } });
	}

	async remove(id: number) {
		const task = await this.taskRepository.findOne({ where: { id } });

		if (!task) {
			throw new NotFoundException('Task not found');
		}

		await this.taskRepository.softRemove(task);

		return id;
	}

	async removeMultiple(ids: number[]) {
		const tasks = await this.taskRepository.find({
			where: { id: In(ids) },
		});

		if (tasks.length === 0) {
			throw new NotFoundException('삭제할 작업이 없습니다.');
		}

		if (tasks.length !== ids.length) {
			throw new NotFoundException('일부 작업을 찾을 수 없습니다.');
		}

		await this.taskRepository.softRemove(tasks);
		return tasks.map((task) => task.id); // 실제 삭제된 ID만 리턴
	}

	async findByWorkshop(workshopId: number, title?: string) {
		// 워크샵 정보와 연관된 작업들 조회
		const workshop = await this.workshopRepository.findOne({
			where: { id: workshopId },
			relations: ['tasks'],
		});

		if (!workshop) {
			throw new NotFoundException('Workshop not found');
		}

		const assignedTaskIds = new Set(workshop.tasks.map((task) => task.id));

		const qb = this.taskRepository.createQueryBuilder('task');

		qb.where('task.deletedAt IS NULL');

		qb.andWhere('task.companyId = :companyId', {
			companyId: workshop.companyId,
		});

		if (title) {
			qb.andWhere('task.title LIKE :title', { title: `%${title}%` });
		}
		const allTasks = await qb.getMany();


		return allTasks.map((task) => ({
			id: task.id,
			title: task.title,
			isActivated: assignedTaskIds.has(task.id),
		}));
	}

	async updateTools(taskId: number, toolIds: number[]) {
		const task = await this.taskRepository.findOne({
			where: { id: taskId },
			relations: ['tools'],
		});

		if (!task) {
			throw new NotFoundException('task not found');
		}

		const tools = await this.toolRepository.findBy({
			id: In(toolIds),
		});

		if (!tools.length) {
			throw new NotFoundException('tools not found');
		}

		task.tools = tools;

		return this.taskRepository.save(task);
	}

	async generateChecklistItems(dto: GenerateTbmDto) {
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
