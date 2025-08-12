import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { Company } from '../../company/entities/company.entity';
import { Tool } from '../../tool/entities/tool.entity';
import { Tbm } from '../../tbm/entities/tbm.entity'; // 추가
import { Exclude } from 'class-transformer';

@Entity()
export class Task extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description: string;

  @ManyToMany(() => Workshop, (workshop) => workshop.tasks)
  workshops: Workshop[];

  @Column()
  @Exclude()
  companyId: number;

  @ManyToOne(() => Company, (company) => company.tasks)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToMany(() => Tool, (tool) => tool.tasks)
  @JoinTable()
  tools: Tool[];

  // Tbm과의 다대다 관계 (조인 테이블 소유측)
  @ManyToMany(() => Tbm, (tbm) => tbm.tasks)
  tbms: Tbm[];
}