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
}
