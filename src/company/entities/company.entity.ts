import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Workshop} from "../../workshop/entities/workshop.entity";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    name: string

    @Column({unique: true})
    code: string

    @Column()
    address: string

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
