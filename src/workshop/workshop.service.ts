import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { whiteList } from '../common/const/whitelist.const';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class WorkshopService {
	constructor(
		@InjectRepository(Workshop)
		private readonly workshopRepository: Repository<Workshop>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
		private readonly dataSource: DataSource,
	) {}

	async create(createWorkshopDto: CreateWorkshopDto) {
		const qr = this.dataSource.createQueryRunner();
		await qr.connect();

		await qr.startTransaction();

		try {
			const company = await qr.manager.findOne(Company, {
				where: {
					id: createWorkshopDto.companyId,
				},
			});

			if (!company) {
				throw new NotFoundException('Company not found');
			}

			const workshop = await qr.manager
				.createQueryBuilder()
				.insert()
				.into(Workshop)
				.values({
					name: createWorkshopDto.name,
					address: createWorkshopDto.address,
					isCabinet: createWorkshopDto.isCabinet,
					company,
				})
				.execute();

			const workshopId = workshop.identifiers[0].id;

			await qr.commitTransaction();

			return await qr.manager.findOne(Workshop, {
				where: {
					id: workshopId,
				},
				relations: ['company'],
			});
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	}

	// 회사 하위 조건 목록만.
	async findAll(userId: number, searchKey?: string, searchValue?: string) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['company'],
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const qb = this.workshopRepository.createQueryBuilder('workshop');

		qb.where('workshop.deletedAt IS NULL');

		if (searchKey && searchValue) {
			const tempWhiteList = [
				whiteList.workshopName,
				whiteList.workshopAddress,
				whiteList.workshopAddressDetail,
				whiteList.companyName,
			];

			if (tempWhiteList.includes(searchKey)) {
				qb.andWhere(`${searchKey} LIKE :value`, {
					value: `%${searchValue}%`,
				});
			} else {
				throw new BadRequestException('잘못된 검색 키입니다.');
			}
		}
		if (user.role !== UserRole.MASTER) {
			qb.andWhere('workshop.companyId = :id', { id: user.companyId });
		}

		const workshops = await qb.getMany();
		if (!workshops.length) {
			throw new NotFoundException('일치하는 정보가 없습니다.');
		}

		return workshops;
	}

	async update(id: number, updateWorkshopDto: UpdateWorkshopDto) {
		const workshop = await this.workshopRepository.findOne({
			where: { id },
		});

		if (!workshop) {
			throw new NotFoundException('workshop not found');
		}

		const updatedWorkshop = this.workshopRepository.merge(
			workshop,
			updateWorkshopDto,
		);
		return this.workshopRepository.save(updatedWorkshop);
	}

	async remove(id: number) {
		const workshop = await this.workshopRepository.findOne({
			where: { id },
		});

		if (!workshop) {
			throw new NotFoundException('workshop not found');
		}

		await this.workshopRepository.softRemove(workshop);

		return id;
	}

	async updateTasks(workshopId: number, taskIds: number[]) {
		const workshop = await this.workshopRepository.findOne({
			where: { id: workshopId },
			relations: ['tasks'],
		});
		if (!workshop) {
			throw new NotFoundException('workshop not found');
		}

		const tasks = await this.taskRepository.findBy({
			id: In(taskIds),
		});

		if (!tasks.length) {
			throw new NotFoundException('tasks not found');
		}

		workshop.tasks = tasks;

		return this.workshopRepository.save(workshop);
	}
}
