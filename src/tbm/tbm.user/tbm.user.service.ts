import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tbm } from '../entities/tbm.entity';
import { TbmLog } from '../../tbm-log/entities/tbm-log.entity';

@Injectable()
export class TbmUserService {
	constructor(
		@InjectRepository(Tbm)
		private readonly tbmRepository: Repository<Tbm>,
		@InjectRepository(TbmLog)
		private readonly tbmLogRepository: Repository<TbmLog>,
	) {}

	async findTbmForUser(req: any, taskIds: number[]) {
		const qb = this.tbmRepository.createQueryBuilder('tbm');

		qb.innerJoin('tbm.tasks', 'taskFilter', 'taskFilter.id IN (:...taskIds)', {
			taskIds,
		});
		qb.where('tbm.deletedAt IS NULL');

		qb.andWhere('tbm.workshopId = :workshopId', {
			workshopId: req.user.workshopId,
		});

		const tbms = await qb.getMany();

		if (tbms.length === 0) return [];

		// 오늘의 시작과 끝 시간 계산 (로컬 타임존 기준)
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		// 관련 TBM 로그를 한 번에 조회하여 N+1 방지
		const tbmIds = tbms.map((t) => t.id);
		const logsQb = this.tbmLogRepository
			.createQueryBuilder('log')
			.leftJoin('log.confirmUsers', 'confirmUser')
			.where('log.tbmId IN (:...tbmIds)', { tbmIds })
			.andWhere('log.createdAt BETWEEN :start AND :end', { start, end })
			.andWhere('confirmUser.id = :userId', { userId: req.user.sub });

		const logs = await logsQb.getMany();

		// 로그가 존재하는 TBM id 집합
		const activatedSet = new Set<number>(logs.map((l) => l.tbmId));

		// isActivated 필드 추가하여 반환
		return tbms.map((tbm) => ({
			id: tbm.id,
			title: tbm.title,
			isActivated: activatedSet.has(tbm.id),
		}));
	}

	async findOneTbmForUser(req: any, id: number) {
		const qb = this.tbmRepository.createQueryBuilder('tbm');

		qb.andWhere('tbm.id = :id', {
			id,
		});

		const tbm = await qb.getOne();

		// 오늘의 시작과 끝 시간 계산 (로컬 타임존 기준)
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		// 관련 TBM 로그를 한 번에 조회하여 N+1 방지
		const logsQb = this.tbmLogRepository
			.createQueryBuilder('log')
			.leftJoin('log.confirmUsers', 'confirmUser')
			.where('log.tbmId = :id', { id: tbm?.id })
			.andWhere('log.createdAt BETWEEN :start AND :end', { start, end })
			.andWhere('confirmUser.id = :userId', { userId: req.user.sub });

		const log = await logsQb.getOne();

		// 로그가 존재하는 TBM id 집합

		// isActivated 필드 추가하여 반환
		return {
			id: tbm?.id,
			title: tbm?.title,
			content: tbm?.content,
			isActivated: !!log,
		};
	}
}
