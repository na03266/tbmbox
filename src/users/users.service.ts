import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, In, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/company/entities/company.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import * as bcrypt from 'bcrypt';
import { envVariables } from '../common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { whiteList } from '../common/const/whitelist.const';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { CommonService } from '../common/common.service';
import { Task } from '../task/entities/task.entity';

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
		private readonly commonService: CommonService,
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,
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
					companyId: createUserByAdminDto.companyId,
					workshopId: createUserByAdminDto.workshopId,
					icCardNumber: createUserByAdminDto.icCardNumber,
					isActivated: createUserByAdminDto.isActivated,
				})
				.execute();

			const userPhone = user.identifiers[0].phone;

			await qr.commitTransaction();

			return await qr.manager.findOne(User, {
				where: {
					phone: createUserByAdminDto.phone,
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

		const password = Math.random().toString(36).slice(2, 10);
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

	async findAll(req: any, dto: PagePaginationDto) {
		const { searchKey, searchValue } = dto;

		const qb = this.userRepository.createQueryBuilder('users');

		qb.leftJoinAndSelect('users.company', 'company')
			.leftJoinAndSelect('users.workshop', 'workshop')
			.where('users.deletedAt IS NULL');

		qb.andWhere('users.role >= :userRole', {
			userRole: req.user.role,
		});

		if (req.user.role === UserRole.SUPERADMIN) {
			qb.andWhere('users.companyId = :companyId', {
				companyId: req.user.companyId,
			});
		} else if (req.user.role === UserRole.ADMIN) {
			qb.andWhere('users.workshopId = :workshopId', {
				workshopId: req.user.workshopId,
			});
		} else if (req.user.role === UserRole.USER) {
			qb.andWhere('users.id = :id', { id: req.user.id });
		}

		if (searchKey && searchValue) {
			const tempWhiteList = [
				whiteList.userName,
				whiteList.userPhone,
				whiteList.companyName,
				whiteList.workshopName,
			];

			if (tempWhiteList.includes(searchKey)) {
				qb.andWhere(`${searchKey} LIKE :value`, {
					value: `%${searchValue}%`,
				});
			} else {
				throw new BadRequestException('잘못된 검색 키입니다.');
			}
		}

		this.commonService.applyPagePaginationParamToQb(qb, dto);

		qb.orderBy('users.role', 'ASC')
			.addOrderBy('users.name', 'ASC')
			.addOrderBy('users.id', 'DESC');

		const users = await qb.getMany();
		const total = await qb.getCount();

		if (!users.length) {
			throw new NotFoundException('일치하는 정보가 없습니다.');
		}

		return { data: users, total: total };
	}

	async findOne(id: number) {
		const user = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.workshop', 'workshop')
			.leftJoinAndSelect('user.company', 'company')
			.where('user.id = :id', { id })
			.getOne();

		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		console.log(updateUserDto);
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

			if (
				updateUserDto.password !== undefined &&
				updateUserDto.password !== null &&
				updateUserDto.password !== ''
			) {
				updateUserDto.password = await bcrypt.hash(
					updateUserDto.password,
					this.configService.getOrThrow<number>(envVariables.hashRounds),
				);
			} else {
				delete updateUserDto.password;
			}
			// Normalize incoming relation IDs: treat 0 as null (unassign)
			const normalizedDto: any = { ...updateUserDto };
			if (normalizedDto.companyId === 0) normalizedDto.companyId = null;
			if (normalizedDto.workshopId === 0) normalizedDto.workshopId = null;

			// Validate only when a non-null value is provided
			if (
				user.companyId !==normalizedDto.companyId &&
				normalizedDto.companyId !== undefined &&
				normalizedDto.companyId !== null
			) {
				const company = await qr.manager.findOne(Company, {
					where: { id: normalizedDto.companyId },
				});
				if (!company) {
					throw new NotFoundException('Company not found');
				}
				normalizedDto.isActivated = false;
			}

			if (
				user.workshopId !== normalizedDto.workshopId &&
				normalizedDto.workshopId !== undefined &&
				normalizedDto.workshopId !== null
			) {
				const workshop = await qr.manager.findOne(Workshop, {
					where: { id: normalizedDto.workshopId },
				});
				if (!workshop) {
					throw new NotFoundException('Workshop not found');
				}
				normalizedDto.isActivated = false;
			}

			const userUpdateFields: any = {
				...normalizedDto,
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
		const user = await this.userRepository
			.createQueryBuilder('user')
			.where('user.id = :id', { id })
			.getOne();

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if(user.phone === '01012301230') {
			throw new BadRequestException('삭제할 수 없는 사용자입니다.');
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
