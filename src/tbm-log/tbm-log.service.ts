import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTbmLogDto } from './dto/create-tbm-log.dto';
import { UpdateTbmLogDto } from './dto/update-tbm-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TbmLog } from './entities/tbm-log.entity';
import { Between, Repository } from 'typeorm';
import { Tbm } from '../tbm/entities/tbm.entity';
import { User } from '../users/entities/user.entity';

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
			console.log('tlqkf');
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

	findAll() {
		return `This action returns all tbmLog`;
	}

	findOne(id: number) {
		return `This action returns a #${id} tbmLog`;
	}

	update(id: number, updateTbmLogDto: UpdateTbmLogDto) {
		return `This action updates a #${id} tbmLog`;
	}

	remove(id: number) {
		return `This action removes a #${id} tbmLog`;
	}
}
