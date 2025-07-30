import {BadRequestException, Injectable} from '@nestjs/common';
import {User} from "../users/entities/user.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import {ConfigService} from '@nestjs/config';
import {JwtService} from "@nestjs/jwt";
import {CreateUserDto} from "../users/dto/create-user.dto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {
    }

    parseBasicToken(rawToken: string) {
        const basicSplit = rawToken.split(' ');

        if (basicSplit.length !== 2) {
            throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
        }

        const [basic, token] = basicSplit;

        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        if (basic.toLowerCase() !== 'basic') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
        }

        const tokenSplit = decoded.split(':');

        if (tokenSplit.length !== 2) {
            throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
        }
        const [phone, password] = tokenSplit;

        return {
            phone,
            password
        };
    }

    async register(rawToken: string, createUserDto: CreateUserDto) {
        const {phone, password} = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({where: {phone}});

        if (user) {
            throw new BadRequestException('이미 가입한 사용자 입니다.');
        }

        const hash = await bcrypt.hash(password, this.configService.get<number>('HASH_ROUNDS') ?? 10);

        const newUser = this.userRepository.create({
            phone,
            password: hash,
            name: createUserDto.name,
            role: createUserDto.role,
            companyId: createUserDto.companyId,
            workshopId: createUserDto.workshopId,
            icCardNumber: createUserDto.icCardNumber,
            isActive: createUserDto.isActive,
        });

        await this.userRepository.save(newUser);

        return this.userRepository.findOne({where: {phone}});

    }

    async login(rawToken: string) {
        const {phone, password} = this.parseBasicToken(rawToken);

        const user = await this.userRepository.findOne({where: {phone}});

        if (!user) {
            throw new BadRequestException('잘못된 로그인 정보입니다.');
        }

        const passOk = await bcrypt.compare(password, user.password);

        if (!passOk) {
            throw new BadRequestException('잘못된 로그인 정보입니다.');
        }

        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');


        return {
            refreshToken: await this.jwtService.signAsync({
                sub: user.phone,
                role: user.role,
                type: 'refresh'
            }, {
                secret: refreshTokenSecret,
                expiresIn: '24h'
            }),
            accessToken: await this.jwtService.signAsync({
                sub: user.phone,
                role: user.role,
                type: 'access'
            }, {
                secret: accessTokenSecret,
                expiresIn: '1h'
            })
        };
    }
}
