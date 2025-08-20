import {Module} from '@nestjs/common';
import {CompanyService} from './company.service';
import {CompanyController} from './company.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Company} from "./entities/company.entity";
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Company,User
        ]),
			CommonModule,
    ],
    controllers: [CompanyController],
    providers: [CompanyService],
})
export class CompanyModule {
}
