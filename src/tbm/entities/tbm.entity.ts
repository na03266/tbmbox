import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	ManyToMany, JoinTable, // 추가
} from 'typeorm';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Task } from '../../task/entities/task.entity'; // 추가

@Entity()
export class Tbm extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  content: string;

  @Column()
  workshopId: number;

  @ManyToOne(() => Workshop, (workshop) => workshop.tbms)
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  // Task와의 다대다 관계 (역방향)
  @ManyToMany(() => Task, (task) => task.tbms)
	@JoinTable()
  tasks: Task[];
}