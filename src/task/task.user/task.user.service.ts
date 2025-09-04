import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TaskUserService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}
	async findAll(req: any) {
		const qb = this.taskRepository.createQueryBuilder('task');
		qb.leftJoinAndSelect('task.users', 'users');
		qb.leftJoinAndSelect('task.workshops', 'workshop');
		qb.where('task.deletedAt IS NULL');

		qb.andWhere('workshop.id = :workshopId', {
			workshopId: req.user.workshopId,
		});

		const data = await qb.getMany();
		const total = await qb.getCount();

		return {
			data: data.map((task) => ({
				id: task.id,
				title: task.title,
				isActivated: task.users.some((user) => user.id === req.user.sub),
			})),
			total,
		};
	}

	async updateTasks(req	: any, taskIds: number[]) {
		const user = await this.userRepository.findOne({
			where: { id: req.user.sub },
			relations: ['tasks'],
		});

		if (!user) {
			throw new NotFoundException('user not found');
		}

		if(taskIds.length === 0) {
			user.tasks = [];
			return this.userRepository.save(user);
		}

		const tasks = await this.taskRepository.findBy({
			id: In(taskIds),
		});

		if (!tasks.length) {
			throw new NotFoundException('tools not found');
		}

		user.tasks = tasks;

		return this.userRepository.save(user);
	}

}
