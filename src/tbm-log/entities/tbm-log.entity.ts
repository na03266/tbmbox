import {
	Column,
	CreateDateColumn, DeleteDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tbm } from '../../tbm/entities/tbm.entity';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { Company } from '../../company/entities/company.entity';

@Unique(['tbmId', 'temVersion'])
@Entity()
export class TbmLog {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	tbmId: number;

	@ManyToOne(() => Tbm)
	@JoinColumn({ name: 'tbmId' })
	tbm: Tbm;

	@Column()
	temVersion: number;

	@Column()
	title: string;

	@Column({ type: 'text' })
	content: string;

	@Column()
	createdBy: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'createdBy' })
	createdByUser: User;

	@Column({ type: 'text', nullable: true })
	note: string;

	@Column()
	workShopId: number;

	@ManyToOne(() => Workshop, (workshop) => workshop.tbmLogs)
	@JoinColumn({ name: 'workshopId' })
	workshop: Workshop;

	@Column({ nullable: true })
	companyId: number;

	@ManyToOne(() => Company, (company) => company.tbmLogs)
	@JoinColumn({ name: 'companyId' })
	company: Company;

	@ManyToMany(() => User, (user) => user.tbmLogs)
	@JoinTable()
	confirmUsers: User[];

	@CreateDateColumn()
	createdAt: Date;

	@DeleteDateColumn()
	deletedAt: Date;
}
