import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTbmLogDto } from './dto/create-tbm-log.dto';
import { UpdateTbmLogDto } from './dto/update-tbm-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TbmLog } from './entities/tbm-log.entity';
import { Between, Repository } from 'typeorm';
import { Tbm } from '../tbm/entities/tbm.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TbmLogService {
	constructor(
		@InjectRepository(TbmLog)
		private readonly tbmLogRepository: Repository<TbmLog>,
		@InjectRepository(Tbm)
		private readonly tbmRepository: Repository<Tbm>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async create(createTbmLogDto: CreateTbmLogDto) {
		//1. tbm 정보 확인
		const tbm = await this.isTbm(createTbmLogDto.tbmId);

		// 3. 금일의 tbmLog 존재여부 확인
		const existingTbmLog = await this.isTbmLog(tbm);
		// 3. 사용자 정보 확인
		const user = await this.isUser(createTbmLogDto.userId);

		if (existingTbmLog) {
			const existingUser = existingTbmLog.confirmUsers.find(
				(u) => u.id === user.id,
			);
			if (!existingUser) {
				existingTbmLog.confirmUsers = [...existingTbmLog.confirmUsers, user];
			}

			return await this.tbmLogRepository.save(existingTbmLog);
		} else {
			// 4. tbmLog 생성
			const tbmLog = this.tbmLogRepository.create({
				tbmId: tbm.id,
				temVersion: tbm.version,
				title: tbm.title,
				content: tbm.content,
				createdBy: tbm.createdBy,
				companyId: tbm.companyId,
				workShopId: tbm.workshopId,
				confirmUsers: [user],
			});
			return await this.tbmLogRepository.save(tbmLog);
		}
	}
	async isUser(userId: number) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}
	async isTbm(tbmId: number) {
		const tbm = await this.tbmRepository.findOne({
			where: {
				id: tbmId,
			},
		});
		//2. tbm이 존재하지 않으면 예외 처리
		if (!tbm) {
			throw new NotFoundException('TBM not found');
		}
		return tbm;
	}

	async isTbmLog(tbm: Tbm) {
		const today = new Date();
		const startOfDay = new Date(today.setHours(0, 0, 0, 0));
		const endOfDay = new Date(today.setHours(23, 59, 59, 999));

		return await this.tbmLogRepository.findOne({
			where: {
				tbmId: tbm.id,
				createdAt: Between(startOfDay, endOfDay),
				temVersion: tbm.version,
			},
		});
	}

	async findAll(
		req: any,
		startDate?: string,
		endDate?: string,
		searchKey?: string,
		searchValue?: string,
	) {
		const qb = this.tbmLogRepository.createQueryBuilder('log');
		qb.leftJoinAndSelect('log.company', 'company');
		qb.leftJoinAndSelect('log.workshop', 'workshop');
		qb.leftJoinAndSelect('log.createdByUser', 'createdByUser');

		// 기본 검색 쿼리(기본정보, 확인 사용자 이름 목록)
		// 회사아이디 기준 (슈퍼어드민)
		if (req.user.role === UserRole.SUPERADMIN) {
			qb.andWhere('log.companyId = :companyId', {
				companyId: req.user.companyId,
			});
		}
		// 워크숍 기준 (어드민)
		if (req.user.role === UserRole.ADMIN) {
			qb.andWhere('log.workShopId = :workShopId', {
				workShopId: req.user.workshopId,
			});
		}
		/// 확인 유저에 포함된 사용자 (사용자)
		if (req.user.role === UserRole.USER) {
			qb.innerJoinAndSelect('log.confirmUsers', 'user').where(
				'user.id = :userId',
				{ userId: req.user.sub },
			);
		}
		// 조건(날짜) 시작/ 종료
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			qb.andWhere('log.createdAt BETWEEN :start AND :end', {
				start,
				end,
			});
		}
		// 조건(제목)
		if (searchKey && searchValue) {
			qb.andWhere(`${searchKey} LIKE :value`, {
				value: `%${searchValue}%`,
			});
		}

		const list = await qb.getMany();

		return list.map((item) => {
			return {
				id: item.id,
				title: item.title,
				workshop: item.workshop?.name ?? null,
				company: item.company.name,
				createdAt: item.createdAt,
				createdByUser: item.createdByUser.name,
			};
		});
	}

	async findOne(id: number) {
		return await this.tbmLogRepository.findOne({
			where: { id },
			relations: ['confirmUsers'],
			select: {
				confirmUsers: {
					id: true,
					name: true,
				},
			},
		});
	}

	async update(id: number, updateTbmLogDto: UpdateTbmLogDto) {
		const tbmLog = this.tbmLogRepository.createQueryBuilder('log');
		tbmLog.where('log.id = :id', { id });
		tbmLog.update(updateTbmLogDto);
		await tbmLog.execute();

		return await this.tbmLogRepository.findOne({
			where: { id },
			relations: ['confirmUsers'],
		});
	}

	remove(id: number) {
		const tbmLog = this.tbmLogRepository.createQueryBuilder('log');
		tbmLog.where('log.id = :id', { id });
		tbmLog.softDelete();

		return id;
	}
}
