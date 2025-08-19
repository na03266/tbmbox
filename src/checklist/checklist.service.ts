import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Checklist } from './entities/checklist.entity';
import { Repository } from 'typeorm';
import { ChecklistChild } from './entities/checklistchildren.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ChecklistService {
	constructor(
		@InjectRepository(Checklist)
		private readonly checklistRepository: Repository<Checklist>,
		@InjectRepository(ChecklistChild)
		private readonly checkListChildRepository: Repository<ChecklistChild>,
	) {}

	async create(req: any, createChecklistDto: CreateChecklistDto) {
		const checklist = await this.checklistRepository.findOne({
			where: {
				taskId: createChecklistDto.taskId,
			},
		});

		if (checklist) {
			throw new BadRequestException('Checklist already exists for this task');
		}

		const newChecklist = this.checklistRepository.create({
			taskId: createChecklistDto.taskId,
			note: createChecklistDto.note,
			createdBy: req.user.sub,
			companyId: req.user.companyId,
		});

		await this.checklistRepository.save(newChecklist);

		const children = this.checkListChildRepository.create(
			createChecklistDto.children.map((item) => ({
				id: item.id,
				content: item.content,
				parentId: newChecklist.id,
			})),
		);

		await this.checkListChildRepository.save(children);

		return await this.checklistRepository.findOne({
			where: {
				id: newChecklist.id,
			},
			relations: ['children'],
		});
	}

	async findAll(req: any, searchKey?: string, searchValue?: string) {
		const qb = this.checklistRepository.createQueryBuilder('checklist');
		qb.leftJoinAndSelect('checklist.children', 'children');
		qb.leftJoinAndSelect('checklist.task', 'task');
		qb.where('checklist.deletedAt IS NULL');

		if (req.user.role <= UserRole.SUPERADMIN) {
			qb.andWhere('checklist.companyId = :companyId', {
				companyId: req.user.companyId,
			});
		}
		if (searchKey && searchValue) {
			qb.andWhere(`${searchKey} LIKE :value`, {
				value: `%${searchValue}%`,
			});
		}

		const items = await qb.getMany();
		return items.map((item) => {
			return {
				id: item.id,
				taskName: item.task.title,
				createdBy: item.createdBy,
				createdAt: item.createdAt,
			};
		});
	}

	async findOne(id: number) {
		const checklist = await this.checklistRepository.findOne({
			where: { id },
			relations: ['children'],
		});
		if (!checklist) {
			throw new BadRequestException('Checklist not found');
		}
		return checklist;
	}

	async update(id: number, updateChecklistDto: UpdateChecklistDto) {
		const checklist = await this.checklistRepository.findOne({
			where: { id },
		});
		if (!checklist) {
			throw new BadRequestException('Checklist not found');
		}

		if (updateChecklistDto.note) {
			checklist.note = updateChecklistDto.note;
			await this.checklistRepository.save(checklist);
		}

		// Upsert children and soft-delete removed ones
		if (Array.isArray(updateChecklistDto.children)) {
			const existingChildren = await this.checkListChildRepository.find({
				where: { parentId: checklist.id },
			});

			const existingIds = new Set(existingChildren.map((c) => c.id));
			const incomingIds = new Set(updateChecklistDto.children.map((c) => c.id));

			const toDeleteIds: number[] = Array.from(existingIds).filter(
				(id) => !incomingIds.has(id),
			);

			if (toDeleteIds.length > 0) {
				await this.checkListChildRepository.delete(toDeleteIds);
			}

			// Upsert provided children (update existing or create new)
			const upserts = this.checkListChildRepository.create(
				updateChecklistDto.children.map((item) => ({
					id: item.id,
					content: item.content,
					parentId: checklist.id,
				})),
			);
			if (upserts.length > 0) {
				await this.checkListChildRepository.save(upserts);
			}
		}

		// Return updated checklist with children
		return await this.checklistRepository.findOne({
			where: { id: checklist.id },
			relations: ['children'],
		});
	}

	remove(id: number) {
		return `This action removes a #${id} checklist`;
	}
}
