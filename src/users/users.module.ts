import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Workshop} from "../workshop/entities/workshop.entity";
import {Company} from "../company/entities/company.entity";
import {User} from "./entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Workshop,
            Company,
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {
}
