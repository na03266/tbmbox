import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class CompanyService {
	constructor(
		@InjectRepository(Company)
		private readonly companyRepository: Repository<Company>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly dataSource: DataSource,
	) {}

	async create(createCompanyDto: CreateCompanyDto) {
		const qr = this.dataSource.createQueryRunner();
		await qr.connect();
		await qr.startTransaction();

		try {
			const company = await qr.manager
				.createQueryBuilder()
				.insert()
				.into(Company)
				.values({
					name: createCompanyDto.name,
					code: createCompanyDto.code,
					address: createCompanyDto.address,
					addressDetail: createCompanyDto.addressDetail,
				})
				.execute();

			const companyId = company.identifiers[0].id;

			await qr.commitTransaction();

			return await this.companyRepository.findOne({
				where: { id: companyId },
			});
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	}

	async findAll(userId: number, searchKey?: string, searchValue?: string) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const qb = this.companyRepository.createQueryBuilder('company');

		if (searchKey && searchValue) {
			const whiteList = [
				'company.name',
				'company.code',
				'company.address',
				'company.addressDetail',
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

		const company = await qb.getMany();

		if (!company) {
			throw new NotFoundException('Company not found');
		}

		return company;
	}

	async findOne(id: number) {
		const company = await this.companyRepository
			.createQueryBuilder('company')
			.where('company.id = :id', { id })
			.andWhere('company.deletedAt IS NULL')
			.getOne();

		if (!company) {
			throw new NotFoundException('Company not found');
		}
		return company;
	}

	async update(id: number, updateCompanyDto: UpdateCompanyDto) {
		const qr = this.dataSource.createQueryRunner();
		await qr.connect();
		await qr.startTransaction();

		try {
			const company = await qr.manager.findOne(Company, { where: { id } });
			if (!company) {
				throw new NotFoundException('Company not found');
			}

			// 이름 중복 검사
			if (updateCompanyDto.name) {
				const existingByName = await qr.manager.findOne(Company, {
					where: { name: updateCompanyDto.name },
				});

				if (existingByName && existingByName.id !== id) {
					throw new ConflictException('Company name already exists');
				}
			}

			// 코드 중복 검사
			if (updateCompanyDto.code) {
				const existingByCode = await qr.manager.findOne(Company, {
					where: { code: updateCompanyDto.code },
				});

				if (existingByCode && existingByCode.id !== id) {
					throw new ConflictException('Company code already exists');
				}
			}

			await qr.manager.update(Company, id, updateCompanyDto);
			await qr.commitTransaction();

			// 업데이트 후 엔티티 반환
			return await qr.manager.findOneBy(Company, { id });
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	}

	async remove(id: number) {
		const company = this.companyRepository.findOne({
			where: {
				id,
			},
		});
		if (!company) {
			throw new NotFoundException('Company not found');
		}

		await this.companyRepository
			.createQueryBuilder()
			.softDelete()
			.where('id = :id', { id })
			.execute();

		return id;
	}
}
