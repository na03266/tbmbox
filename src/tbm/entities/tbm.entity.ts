import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Task } from '../../task/entities/task.entity'; // 추가

@Unique(['title', 'workshopId'])
@Entity()
export class Tbm extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text' })
	content: string;

	@Column()
	workshopId: number;

	@Column({
		nullable: true,
	})
	createBy: number;

	@ManyToOne(() => Workshop, (workshop) => workshop.tbms)
	@JoinColumn({ name: 'workshopId' })
	workshop: Workshop;

	// Task와의 다대다 관계 (역방향)
	@ManyToMany(() => Task, (task) => task.tbms)
	@JoinTable()
	tasks: Task[];
}
