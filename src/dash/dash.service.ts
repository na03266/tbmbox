import { Injectable } from '@nestjs/common';
import { CreateDashDto } from './dto/create-dash.dto';
import { UpdateDashDto } from './dto/update-dash.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Between, In, Repository } from 'typeorm';
import { TbmLog } from '../tbm-log/entities/tbm-log.entity';
import { ChecklistLog } from '../checklist-log/entities/checklist-log.entity';
import { Workshop } from '../workshop/entities/workshop.entity';

@Injectable()
export class DashService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(TbmLog)
		private readonly tbmLogRepository: Repository<TbmLog>,
		@InjectRepository(ChecklistLog)
		private readonly checkLogRepository: Repository<ChecklistLog>,
		@InjectRepository(Workshop)
		private readonly workshopRepository: Repository<Workshop>,
	) {}
	create(createDashDto: CreateDashDto) {
		return 'This action adds a new dash';
	}

	async findAll(req: any) {
		// 금일 TBM 완료자 수
		const todayTbmCount = await this.tbmLogRepository.count({
			where: {
				companyId: req.user.companyId,
				createdAt: Between(
					new Date(new Date().setHours(0, 0, 0, 0)),
					new Date(new Date().setHours(23, 59, 59, 999)),
				),
			},
			relations: ['confirmUsers'],
			select: ['confirmUsers'],
		});

		// 금일 체크리스트 완료자 수
		const todayCheckCount = await this.checkLogRepository.count({
			where: {
				companyId: req.user.companyId,
				createdAt: Between(
					new Date(new Date().setHours(0, 0, 0, 0)),
					new Date(new Date().setHours(23, 59, 59, 999)),
				),
			},
		});

		// 회사 전체 인원 수
		const totalUsers = await this.userRepository.count({
			where: {
				companyId: req.user.companyId,
			},
		});

		// 현장별 인원 현황: 회사의 워크숍 목록을 기준으로 활성/비활성 인원 및 비율 산출 (빈 워크숍 포함)
		const rawWorkshopStats = await this.workshopRepository
			.createQueryBuilder('workshop')
			.select('workshop.id', 'workshopId')
			.addSelect('workshop.name', 'workshopName')
			.addSelect(
				'SUM(CASE WHEN user.isActivated = true THEN 1 ELSE 0 END)',
				'activeCount',
			)
			.addSelect(
				'SUM(CASE WHEN user.isActivated = false THEN 1 ELSE 0 END)',
				'inactiveCount',
			)
			.addSelect('COUNT(user.id)', 'totalCount')
			.leftJoin('workshop.users', 'user', 'user.companyId = :companyId', {
				companyId: req.user.companyId,
			})
			.where('workshop.companyId = :companyId', {
				companyId: req.user.companyId,
			})
			.groupBy('workshop.id')
			.addGroupBy('workshop.name')
			.getRawMany();

		const workshopStats = rawWorkshopStats.map((r: any) => {
			const total = Number(r.totalCount ?? 0);
			const active = Number(r.activeCount ?? 0);
			const inactive = Number(r.inactiveCount ?? 0);
			return {
				workshopId: r.workshopId !== null ? Number(r.workshopId) : null,
				workshopName: r.workshopName ?? null,
				activeCount: active,
				activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
				inactiveCount: inactive,
				inactivePercent: total > 0 ? Math.round((inactive / total) * 100) : 0,
			};
		});

		// 주간 미완료 현황 (요일별 TBM/체크리스트 미작성 인원 수)
		const startOfWeek = new Date();
		startOfWeek.setHours(0, 0, 0, 0);
		// getDay(): 0=Sun ... 6=Sat, startOfWeek -> this week's Sunday
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		const weeklyIncomplete: {
			date: string;
			noTbmCount: number;
			noCheckCount: number;
		}[] = [];

		for (let i = 0; i < 7; i++) {
			const dayStart = new Date(startOfWeek);
			dayStart.setDate(startOfWeek.getDate() + i);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(dayStart);
			dayEnd.setHours(23, 59, 59, 999);

			// 해당 요일 TBM 작성한 인원 수 (distinct userId)
			const tbmCompletedRow = await this.tbmLogRepository
				.createQueryBuilder('tbm')
				.select('COUNT(DISTINCT tbm.createdBy)', 'count')
				.where('tbm.companyId = :companyId', { companyId: req.user.companyId })
				.andWhere('tbm.createdAt BETWEEN :start AND :end', {
					start: dayStart,
					end: dayEnd,
				})
				.getRawOne<{ count: string }>();
			const tbmCompleted = Number(tbmCompletedRow?.count ?? 0);

			// 해당 요일 체크리스트 작성한 인원 수 (distinct userId)
			const checkCompletedRow = await this.checkLogRepository
				.createQueryBuilder('chk')
				.select('COUNT(DISTINCT chk.userId)', 'count')
				.where('chk.companyId = :companyId', { companyId: req.user.companyId })
				.andWhere('chk.createdAt BETWEEN :start AND :end', {
					start: dayStart,
					end: dayEnd,
				})
				.getRawOne<{ count: string }>();
			const checkCompleted = Number(checkCompletedRow?.count ?? 0);

			// 미작성 인원 수 = 회사 소속 전체 인원 - 해당 요일 작성한 인원 수
			const noTbmCount = Math.max(0, totalUsers - tbmCompleted);
			const noCheckCount = Math.max(0, totalUsers - checkCompleted);

			const dateKey = dayStart.toISOString().slice(0, 10); // YYYY-MM-DD
			weeklyIncomplete.push({ date: dateKey, noTbmCount, noCheckCount });
		}

		// 대기중인 회원
		const pendingUsers = await this.userRepository.find({
			where: {
				companyId: req.user.companyId,
				isActivated: false,
			},
			relations: ['workshop'],
		});

		// 활성/비활성 회원 수
		const [enabledCount, disabledCount] = await Promise.all([
			this.userRepository.count({
				where: {
					companyId: req.user.companyId,
					isActivated: true,
				},
			}),
			this.userRepository.count({
				where: {
					companyId: req.user.companyId,
					isActivated: false,
				},
			}),
		]);

		return {
			tbm: {
				count: todayTbmCount,
				total: totalUsers,
				percent:
					totalUsers > 0 ? Math.round((todayTbmCount / totalUsers) * 100) : 0,
			},
			check: {
				count: todayCheckCount,
				total: totalUsers,
				percent:
					totalUsers > 0 ? Math.round((todayCheckCount / totalUsers) * 100) : 0,
			},
			workshopStats,
			weeklyIncomplete,
			pendingUsers: pendingUsers.map((e) => {
				return {
					name: e.name,
					workshopName: e.workshop?.name ?? '미지정',
					isActivated: e.isActivated,
				};
			}),
			enabledUser: enabledCount,
			disabledUser: disabledCount,
		};
	}
	async findOne(id: number) {
		// 최근 활동
		// tbm log, checklist log
		// 최신순서로 타이틀, 시간 3개만
		// 여기서의 id는 회사 ID로 가정합니다.
		// 두 로그 테이블에서 각각 최신 항목을 가져온 뒤 병합/정렬하여 상위 3개만 반환합니다.
		const [tbmLogs, checkLogs] = await Promise.all([
			this.tbmLogRepository.find({
				where: { companyId: id },
				select: ['id', 'title', 'createdAt'],
				order: { createdAt: 'DESC' },
				take: 3,
			}),
			this.checkLogRepository.find({
				where: { companyId: id },
				select: ['id', 'title', 'createdAt'],
				order: { createdAt: 'DESC' },
				take: 3,
			}),
		]);

		const normalized = [
			...tbmLogs.map((l) => ({
				type: 'tbm',
				id: l.id,
				title: l.title,
				createdAt: l.createdAt,
			})),
			...checkLogs.map((l) => ({
				type: 'checklist',
				id: l.id,
				title: l.title,
				createdAt: l.createdAt,
			})),
		];

		normalized.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

		return normalized.slice(0, 3);
	}

	async findAllForUser(req: any) {
		// 요구사항에 따라 현재 로그인한 사용자의 작업(Task) 기준으로 남은 항목과 최근 진행 이력을 반환
		// - 남은 TBM/체크리스트: 오늘 기준, 사용자에게 연결된 Task에서 파생된 TBM/체크리스트 중 아직 본인이 작성하지 않은 개수
		// - 최근 진행: 사용자 본인이 작성한 TBM 로그, 체크리스트 로그를 합쳐 최신순 3개 반환
		const userId = req?.user?.sub;
		if (!userId) {
			return { remainTbm: 0, remainChecklist: 0, current: [] };
		}

		// 사용자 + 관계 로드 (tasks, tasks.tbms, tasks.checklist)
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['tasks', 'tasks.tbms', 'tasks.checklist'],
		});
		if (!user) {
			return { remainTbm: 0, remainChecklist: 0, current: [] };
		}

		// 오늘 범위
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		// 사용자에게 연결된 Task에서 파생된 TBM/Checklist ID 집합
		const tasks = user.tasks ?? [];
		const tbmIds = Array.from(
			new Set(
				tasks.flatMap((t: any) => (t.tbms ?? []).map((tbm: any) => tbm.id)),
			),
		);
		const checklistIdByTask: Record<number, number> = {};

		const taskTitleByChecklistId: Record<number, string> = {};

		for (const t of tasks) {
			if (t.checklist) {
				checklistIdByTask[t.id] = t.checklist.id;
				taskTitleByChecklistId[t.checklist.id] = t.title;
			}
		}
		const checklistIds = Object.values(checklistIdByTask);

		// 오늘 사용자 본인이 완료한 TBM 로그 / 체크리스트 로그 찾기
		let doneTbmIdsToday: number[] = [];
		let doneChecklistIdsToday: number[] = [];

		if (tbmIds.length > 0) {
			const tbmDone = await this.tbmLogRepository.find({
				where: {
					confirmUsers: { id: userId },
					tbmId: In(tbmIds),
					createdAt: Between(start, end),
				},
				select: ['tbmId'],
			});
			doneTbmIdsToday = Array.from(new Set(tbmDone.map((l) => l.tbmId)));
		}
		if (checklistIds.length > 0) {
			const chkDone = await this.checkLogRepository.find({
				where: {
					userId: userId,
					checklistId: In(checklistIds),
					createdAt: Between(start, end),
				},
				select: ['checklistId'],
			});
			doneChecklistIdsToday = Array.from(
				new Set(chkDone.map((l) => l.checklistId)),
			);
		}

		const remainTbm = Math.max(0, tbmIds.length - doneTbmIdsToday.length);
		const remainChecklist = Math.max(
			0,
			checklistIds.length - doneChecklistIdsToday.length,
		);

		// 최근 진행 이력: 사용자 본인이 작성한 로그 중, 사용자에게 연결된 Task에서 발생한 TBM/체크리스트만 고려
		const [recentTbmLogs, recentChecklistLogs] = await Promise.all([
			this.tbmLogRepository.find({
				where: { confirmUsers: userId },
				select: ['id', 'title', 'createdAt'],
				order: { createdAt: 'DESC' },
				take: 3,
			}),
			this.checkLogRepository.find({
				where: { userId: userId },
				relations: ['task'],
				select: ['id', 'checklistId', 'createdAt'],
				order: { createdAt: 'DESC' },
				take: 3,
			},),
		]);

		const normalized = [
			// TBM: type 0, title은 로그의 title 사용
			...recentTbmLogs.map((l: any) => ({
				type: 'tbm',
				title: l.title + ' TBM 교육',
				createdAt: l.createdAt,
			})),
			// Checklist: type 1, title은 작업(Task)의 제목 사용
			...recentChecklistLogs.map((l: any) => ({
				type: 'checklist',
				title: `${l.task.title} 체크리스트`,
				createdAt: l.createdAt,
			})),
		];

		normalized.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
		const current = normalized.slice(0, 2);

		return {
			remainTbm,
			remainChecklist,
			current:
				current.map((e) => ({
				...e,
				createdAt: e.createdAt.toLocaleString(),
			})),
		};
	}
	update(id: number, updateDashDto: UpdateDashDto) {
		return `This action updates a #${id} dash`;
	}

	remove(id: number) {
		return `This action removes a #${id} dash`;
	}
}
