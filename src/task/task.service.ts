import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		private readonly dataSource: DataSource,
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
	findAll(name?: string) {
		const qb = this.taskRepository.createQueryBuilder('task');

		if (name) {
			qb.where('task.title LIKE :title', { title: `%${name}%` });
		}

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
		const updatedTask = {
			...task,
			...updateTaskDto,
		};
		await this.taskRepository.update(id, updatedTask);

		return task;
	}

	async remove(id: number) {
		const task = await this.taskRepository.findOne({ where: { id } });

		if (!task) {
			throw new NotFoundException('Task not found');
		}

		await this.taskRepository.softRemove(task);

		return id;
	}
}
