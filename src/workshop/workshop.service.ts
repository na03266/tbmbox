import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateWorkshopDto} from './dto/create-workshop.dto';
import {UpdateWorkshopDto} from './dto/update-workshop.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Workshop} from "./entities/workshop.entity";
import {DataSource, Repository} from "typeorm";
import {Company} from "../company/entities/company.entity";

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {
  }

  async create(createWorkshopDto: CreateWorkshopDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();

    await qr.startTransaction();

    try {
      const company = await qr.manager.findOne(
        Company, {
          where: {
            id: createWorkshopDto.companyId,
          },
        });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const workshop = await qr.manager.createQueryBuilder()
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

      return await qr.manager.findOne(Workshop,
        {
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
  async findByCompany(companyId: number) {
    const workshops = await this.workshopRepository
      .createQueryBuilder('workshop')
      .where('workshop.companyId = :id', {id: companyId})
      .getMany();

    if (!workshops.length) {
      throw new NotFoundException('No workshops found for the company');
    }

    return workshops;
  }

  async findAll() {
    const workshop = await this.workshopRepository
      .createQueryBuilder('workshop')
      .getMany();

    if (!workshop) {
      throw new NotFoundException('workshop not found');
    }

    return workshop;
  }

  async update(
    id: number,
    updateWorkshopDto: UpdateWorkshopDto,
  ) {
    const workshop = await this.workshopRepository.findOne({
      where: {id},
    });

    if (!workshop) {
      throw new NotFoundException('workshop not found');
    }

    const updatedWorkshop = this.workshopRepository.merge(workshop, updateWorkshopDto);
    return this.workshopRepository.save(updatedWorkshop);
  }

  async remove(id: number) {
    const workshop = await this.workshopRepository.findOne({
      where: {id},
    });

    if (!workshop) {
      throw new NotFoundException('workshop not found');
    }

    await this.workshopRepository.softRemove(workshop);

    return id;
  }


}