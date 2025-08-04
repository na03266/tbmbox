import { ClassSerializerInterceptor, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { DataSource, In, Repository } from 'typeorm';
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
}
