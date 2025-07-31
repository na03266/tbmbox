import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Workshop} from "../../workshop/entities/workshop.entity";
import {User} from "../../users/entities/user.entity";
import {BaseTable} from "../../common/entity/base-table.entity";

@Entity()
export class Company extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    name: string

    @Column({unique: true})
    code: string

    @Column()
    address: string

    @Column({nullable: true})
    addressDetail: string

    @Column({default: false})
    isActivated: boolean

    @OneToMany(
        () => Workshop,
        (workshop) => workshop.company
    )
    workshops: Workshop[]

    @OneToMany(
        () => User,
        (user) => user.company
    )
    users: User[]
}
