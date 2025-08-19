import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChecklistLogDto } from './dto/create-checklist-log.dto';
import { UpdateChecklistLogDto } from './dto/update-checklist-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Checklist } from '../checklist/entities/checklist.entity';
import { Repository } from 'typeorm';
import { ChecklistLog } from './entities/checklist-log.entity';
import { ChecklistLogChild } from './entities/checklist-log-child.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ChecklistLogService {
	constructor(
		@InjectRepository(Checklist)
		private readonly checklistRepository: Repository<Checklist>,
		@InjectRepository(ChecklistLog)
		private readonly checklistLogRepository: Repository<ChecklistLog>,
		@InjectRepository(ChecklistLogChild)
		private readonly checklistLogChildRepository: Repository<ChecklistLogChild>,
	) {}
	async create(req: any, createChecklistLogDto: CreateChecklistLogDto) {
		const checklist = await this.checklistRepository.findOne({
			where: { id: createChecklistLogDto.checklistId },
			relations: ['children', 'task'],
		});

		if (!checklist) {
			throw new NotFoundException('Checklist not found');
		}

		const checklistLog = this.checklistLogRepository.create({
			checklistId: checklist.id,
			userId: req.user.sub,
			checklistVersion: checklist.version,
			title: checklist.task.title,
			companyId: req.user.companyId,
			workshopId: req.user.workshopId,
		});
		await this.checklistLogRepository.save(checklistLog);

		const children = this.checklistLogChildRepository.create(
			checklist.children.map((item) => ({
				parentId: checklistLog.id,
				content: item.content,
			})),
		);
		await this.checklistLogChildRepository.save(children);

		return await this.checklistLogRepository.findOne({
			where: { id: checklistLog.id },
			relations: ['children'],
		});
	}

	async findAll(req: any, searchKey?: string, searchValue?: string) {
		const qb = this.checklistLogRepository.createQueryBuilder('log');

		qb.leftJoin('log.user', 'user');
		qb.where('log.deletedAt IS NULL');

		if (req.user.role == UserRole.SUPERADMIN) {
			qb.andWhere('log.companyId = :companyId', {
				companyId: req.user.companyId,
			});
		} else if (req.user.role == UserRole.ADMIN) {
			qb.andWhere('log.workshopId = :workshopId', {
				workshopId: req.user.workshopId,
			});
		} else if (req.user.role == UserRole.USER) {
			qb.andWhere('log.userId = :userId', {
				userId: req.user.sub,
			});
		}
		if (searchKey && searchValue) {
			qb.andWhere(`${searchKey} LIKE :value`, { value: `%${searchValue}%` });
		}

		qb.orderBy('log.createdAt', 'DESC');

		const logList = await qb.getMany();
		return logList.map((log) => ({
			id: log.id,
			title: log.title,
			user: log.user,
			createdAt: log.createdAt,
		}));
	}

	async findOne(id: number) {
		const checklistLog = await this.checklistLogRepository.findOne({
			where: { id },
			relations: ['children'],
		});
		if (!checklistLog) {
			throw new NotFoundException(`ChecklistLog with ID ${id} not found`);
		}

		return checklistLog;
	}

	async remove(id: number) {
		const checklistLog = this.checklistLogRepository.findOne({ where: { id } });

		if (!checklistLog) {
			throw new NotFoundException(`ChecklistLog with ID ${id} not found`);
		}

		await this.checklistLogRepository.softDelete(id);
		return id;
	}
}
