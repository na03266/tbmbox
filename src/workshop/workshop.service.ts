import {BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import {CreateWorkshopDto} from './dto/create-workshop.dto';
import {UpdateWorkshopDto} from './dto/update-workshop.dto';
import {InjectRepository} from '@nestjs/typeorm';
import {Workshop} from './entities/workshop.entity';
import {DataSource, In, Repository} from 'typeorm';
import {Company} from '../company/entities/company.entity';
import {User, UserRole} from '../users/entities/user.entity';
import {whiteList} from '../common/const/whitelist.const';
import {Task} from '../task/entities/task.entity';
import {PagePaginationDto} from '../common/dto/page-pagination.dto';
import {CommonService} from '../common/common.service';

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
    private readonly commonService: CommonService,
  ) {
  }

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
          addressDetail: createWorkshopDto.addressDetail,
          isCabinet: createWorkshopDto.isCabinet,
          companyId: company.id,
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
  async findAll(req: any, dto: PagePaginationDto) {
    const {searchKey, searchValue} = dto;

    const qb = this.workshopRepository.createQueryBuilder('workshop');

    qb.leftJoinAndSelect('workshop.company', 'company');
    qb.where('workshop.deletedAt IS NULL');

		if(req.user){
			if (req.user.role !== UserRole.MASTER) {
				qb.andWhere('workshop.companyId = :id', {id: req.user.companyId});
			}
		}


    if (searchKey && searchValue) {
      const tempWhiteList = [
        whiteList.workshopName,
        whiteList.workshopAddress,
        whiteList.companyName,
        whiteList.companyId,
      ];

      if (tempWhiteList.includes(searchKey)) {
        // Handle numeric vs text fields appropriately to avoid using LIKE on integers
        if (searchKey === whiteList.companyId) {
          const num = Number(searchValue);
          if (!Number.isFinite(num)) {
            throw new BadRequestException('companyId 검색 값은 숫자여야 합니다.');
          }
          qb.andWhere('company.id = :value', {value: num});
        } else {
          qb.andWhere(`${searchKey} LIKE :value`, {
            value: `%${searchValue}%`,
          });
        }
      } else {
        throw new BadRequestException('잘못된 검색 키입니다.');
      }
    }

    this.commonService.applyPagePaginationParamToQb(qb, dto);

    const workshops = await qb.getMany();
    const total = await qb.getCount();

    if (!workshops.length) {
      throw new NotFoundException('일치하는 정보가 없습니다.');
    }

    return {
      data: workshops.map((e) => {
        return {
          id: e.id,
          name: e.name,
          address: e.address,
          addressDetail: e.addressDetail,
          isCabinet: e.isCabinet,
        };
      }),
      total: total,
    };
  }

  findOne(id: number) {
    const workshop = this.workshopRepository.findOne({
      where: {id},
      relations: ['company', 'tasks', 'tbms'],
    });
    if (!workshop) {
      throw new NotFoundException('workshop not found');
    }
    return workshop;
  }

  async update(id: number, updateWorkshopDto: UpdateWorkshopDto) {
    const workshop = await this.workshopRepository.findOne({
      where: {id},
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
      where: {id},
    });

    if (!workshop) {
      throw new NotFoundException('workshop not found');
    }

    await this.workshopRepository.softRemove(workshop);

    return id;
  }

  async updateTasks(workshopId: number, taskIds: number[]) {
    const workshop = await this.workshopRepository.findOne({
      where: {id: workshopId},
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

  async removeMultiple(ids: number[]) {
    const workshops = await this.workshopRepository.find({
      where: {id: In(ids)},
    });
    if (workshops.length === 0) {
      throw new NotFoundException('삭제할 작업장이 없습니다.');
    }
    if (workshops.length !== ids.length) {
      throw new NotFoundException('일부 작업장을 찾을 수 없습니다.');
    }
    return this.workshopRepository.softRemove(workshops);
  }
}
