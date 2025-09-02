import { Injectable } from '@nestjs/common';
import { Checklist } from '../entities/checklist.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChecklistLog } from '../../checklist-log/entities/checklist-log.entity';

@Injectable()
export class ChecklistUserService {
	constructor(
		@InjectRepository(Checklist)
		private readonly checklistRepository: Repository<Checklist>,
		@InjectRepository(ChecklistLog)
		private readonly checklistLogRepository: Repository<ChecklistLog>,
	) {}

	async findAllForUser(req: any, taskIds: number[]) {
		const qb = this.checklistRepository.createQueryBuilder('checklist');
		qb.leftJoinAndSelect('checklist.children', 'children');
		qb.leftJoinAndSelect('checklist.task', 'task');
		qb.where('checklist.deletedAt IS NULL');
		qb.andWhere('checklist.companyId = :companyId', {
			companyId: req.user.companyId,
		});

		if (taskIds.length > 0) {
			qb.andWhere('checklist.taskId IN (:...taskIds)', {
				taskIds,
			});
		}

		const items = await qb.getMany();
		if (items.length === 0) return [];

		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		// 관련 TBM 로그를 한 번에 조회하여 N+1 방지
		const checklistIds = items.map((t) => t.id);
		const logsQb = this.checklistLogRepository
			.createQueryBuilder('log')
			.leftJoin('log.user', 'user')
			.where('log.checklistId IN (:...checklistIds)', { checklistIds })
			.andWhere('log.createdAt BETWEEN :start AND :end', { start, end })
			.andWhere('user.id = :userId', { userId: req.user.sub });

		const logs = await logsQb.getMany();
		const activatedSet = new Set<number>(logs.map((l) => l.checklistId));

		return items.map((item) => ({
			id: item.id,
			title: item.task.title,
			items: item.children.length,
			isActivated: activatedSet.has(item.id),
		}));
	}

	async findOneForUser(req: any, id: number) {
		const qb = this.checklistRepository.createQueryBuilder('checklist');
		qb.leftJoinAndSelect('checklist.children', 'children');
		qb.leftJoinAndSelect('checklist.task', 'task');
		qb.where('checklist.id = :id', { id });

		const item = await qb.getOne();


		if (!item) {
			throw new Error('Checklist not found');
		}

		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		// 관련 TBM 로그를 한 번에 조회하여 N+1 방지
		const logsQb = this.checklistLogRepository
			.createQueryBuilder('log')
			.leftJoin('log.user', 'user')
			.where('log.checklistId = :id', { id: item.id })
			.andWhere('log.createdAt BETWEEN :start AND :end', { start, end })
			.andWhere('user.id = :userId', { userId: req.user.sub });

		const log = await logsQb.getOne();

		return {
			id: item.id,
			title: item.task.title,
			isActivated: !!log,
			items: item.children.length,
			note: item.note,
			children: item.children.map((child) => ({
				id: child.id,
				content: child.content,
				isActivated: !!log,
			})),
		};
	}
}
