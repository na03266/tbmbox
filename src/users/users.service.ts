import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/company/entities/company.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import * as bcrypt from 'bcrypt';
import { envVariables } from '../common/const/env.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Company)
		private readonly companyRepository: Repository<Company>,
		@InjectRepository(Workshop)
		private readonly workshopRepository: Repository<Workshop>,
		private readonly configService: ConfigService,
		private readonly dataSource: DataSource,
	) {}

	async create(createUserByAdminDto: CreateUserByAdminDto) {
		const qr = this.dataSource.createQueryRunner();
		await qr.connect();
		await qr.startTransaction();

		try {
			const company = await qr.manager.findOne(Company, {
				where: { id: createUserByAdminDto.companyId },
			});
			if (!company) {
				throw new NotFoundException('Company not found');
			}

			const workshop = await qr.manager.findOne(Workshop, {
				where: {
					id: createUserByAdminDto.workshopId,
				},
			});
			if (!workshop) {
				throw new NotFoundException('Workshop not found');
			}
			const hash = await bcrypt.hash(
				createUserByAdminDto.password,
				this.configService.getOrThrow<number>(envVariables.hashRounds),
			);

			const user = await qr.manager
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					phone: createUserByAdminDto.phone,
					password: hash,
					name: createUserByAdminDto.name,
					role: createUserByAdminDto.role,
					company,
					workshop,
				})
				.execute();

			const userPhone = user.identifiers[0].phone;

			await qr.commitTransaction();

			return await qr.manager.findOne(User, {
				where: {
					phone: userPhone,
				},
				relations: ['company', 'workshop'],
			});
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	}

	async resetPassword(id: number) {
		const user = await this.userRepository.findOne({
			where: { id },
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const password = 'a12345678';
		const hash = await bcrypt.hash(
			password,
			this.configService.getOrThrow<number>(envVariables.hashRounds),
		);

		await this.userRepository.update(id, { password: hash });

		return {
			password,
		};
	}

	async findForAdmin(userId: number, name?: string) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const users = await this.userRepository
			.createQueryBuilder('users')
			.where('users.companyId = :id', { id: user.companyId })
			.andWhere('users.deletedAt IS NULL')
			.getMany();

		if (!users.length) {
			throw new NotFoundException('No users found for the company');
		}

		return users;
	}

	async findAll(userId: number, searchKey?: string, searchValue?: string) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const qb = this.userRepository.createQueryBuilder('users');

		qb.leftJoinAndSelect('users.company', 'company')
			.leftJoinAndSelect('users.workshop', 'workshop')
			.where('users.deletedAt IS NULL');

		if (searchKey && searchValue) {
			const whiteList = [
				'users.name',
				'users.phone',
				'company.name',
				'workshop.name',
			];

			if (whiteList.includes(searchKey)) {
				qb.andWhere(`${searchKey} LIKE :value`, {
					value: `%${searchValue}%`,
				});
			} else {
				throw new BadRequestException('잘못된 검색 키입니다.');
			}
		}

		if (user.role !== UserRole.MASTER) {
			qb.andWhere('users.companyId = :id', { id: user.companyId });
		}
		const users = await qb.getMany();

		if (!users.length) {
			throw new NotFoundException('일치하는 정보가 없습니다.');
		}

		return users;
	}

	async findOne(id: number) {
		const user = await this.workshopRepository
			.createQueryBuilder('user')
			.leftJoin('user.workshop', 'workshop')
			.leftJoin('user.company', 'company')
			.where('user.id = :id', { id })
			.getOne();

		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		const qr = this.dataSource.createQueryRunner();
		await qr.connect();
		await qr.startTransaction();

		try {
			const user = await qr.manager.findOne(User, {
				where: { id },
				relations: ['company', 'workshop'],
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			if (updateUserDto.companyId) {
				const company = await qr.manager.findOne(Company, {
					where: { id: updateUserDto.companyId },
				});
				if (!company) {
					throw new NotFoundException('Company not found');
				}
			}

			if (updateUserDto.workshopId) {
				const workshop = await qr.manager.findOne(Workshop, {
					where: { id: updateUserDto.workshopId },
				});
				if (!workshop) {
					throw new NotFoundException('Workshop not found');
				}
			}

			const userUpdateFields = {
				...updateUserDto,
			};

			await qr.manager
				.createQueryBuilder()
				.update(User)
				.set(userUpdateFields)
				.where('id = :id', { id })
				.execute();

			await qr.commitTransaction();
			return await qr.manager.findOne(User, {
				where: { id },
				relations: ['company', 'workshop'],
			});
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	}

	async remove(id: number) {
		const user = this.workshopRepository
			.createQueryBuilder('user')
			.where('user.id = :id', { id })
			.getOne();

		if (!user) {
			throw new NotFoundException('User not found');
		}

		await this.userRepository
			.createQueryBuilder()
			.softDelete()
			.from(User)
			.where('id = :id', { id })
			.execute();

		return id;
	}
}
