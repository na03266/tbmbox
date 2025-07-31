import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {DataSource, Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Company} from 'src/company/entities/company.entity';
import {Workshop} from "../workshop/entities/workshop.entity";
import {CreateUserByAdminDto} from "./dto/create-user-by-admin.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(Workshop)
        private readonly workshopRepository: Repository<Workshop>,
        private readonly dataSource: DataSource,
    ) {
    }

    async create(createUserByAdminDto: CreateUserByAdminDto) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const company = await qr.manager.findOne(Company, {where: {id: createUserByAdminDto.companyId}});
            if (!company) {
                throw new NotFoundException('Company not found');
            }

            const workshop = await qr.manager.findOne(Workshop, {where: {id: createUserByAdminDto.workshopId}});
            if (!workshop) {
                throw new NotFoundException('Workshop not found');
            }

            const user = await qr.manager.createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    phone: createUserByAdminDto.phone,
                    password: createUserByAdminDto.password,
                    name: createUserByAdminDto.name,
                    role: createUserByAdminDto.role,
                    company,
                    workshop,
                })
                .execute();

            const userPhone = user.identifiers[0].phone;

            await qr.commitTransaction();

            return await qr.manager.findOne(User,
                {
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

    async findByCompany(companyId: number) {

        const workshops = await this.workshopRepository
            .createQueryBuilder('workshops')
            .where('workshops.companyId = :id', {id: companyId})
            .andWhere('workshops.deletedAt IS NULL')
            .getMany();

        if (!workshops.length) {
            throw new NotFoundException('No users found for the company');
        }

        return workshops;
    }

    async findOne(phone: string) {
        const user = await this.workshopRepository
            .createQueryBuilder('user')
            .leftJoin('user.workshop', 'workshop')
            .leftJoin('user.company', 'company')
            .where('user.phone = :phone', {phone: phone})
            .getOne();

        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(phone: string, updateUserDto: UpdateUserDto) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const user = await qr.manager.findOne(User, {where: {phone}, relations: ['company', 'workshop']});
            if (!user) {
                throw new NotFoundException('User not found');
            }

            let newWorkshop;
            let newCompany;

            if (updateUserDto.companyId) {
                const company = await qr.manager.findOne(Company, {where: {id: updateUserDto.companyId}});
                if (!company) {
                    throw new NotFoundException('Company not found');
                }
                newCompany = company;
            }

            if (updateUserDto.workshopId) {
                const workshop = await qr.manager.findOne(Workshop, {where: {id: updateUserDto.workshopId}});
                if (!workshop) {
                    throw new NotFoundException('Workshop not found');
                }
                newWorkshop = workshop;
            }

            const userUpdateFields = {
                ...updateUserDto,
                ...(newCompany && {company: newCompany}),
                ...(newWorkshop && {company: newWorkshop}),
            };
            await qr.manager.createQueryBuilder()
                .update(User)
                .set(userUpdateFields)
                .where('phone = :phone', {phone})
                .execute();
            await qr.commitTransaction();

        } catch (e) {
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }

    async remove(phone: string) {
        const user = this.workshopRepository
            .createQueryBuilder('user')
            .leftJoin('user.workshop', 'workshop')
            .where('user.phone = :phone', {phone: phone})
            .getOne();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepository.createQueryBuilder()
            .softDelete()
            .from(User)
            .where('phone = :phone', {phone: phone})
            .execute();

        return phone;
    }
}
