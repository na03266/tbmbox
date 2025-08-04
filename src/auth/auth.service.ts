import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { envVariables } from '../common/const/env.const';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	parseBasicToken(rawToken: string) {
		const basicSplit = rawToken.split(' ');

		if (basicSplit.length !== 2) {
			throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
		}

		const [basic, token] = basicSplit;

		if (basic.toLowerCase() !== 'basic') {
			throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}

		const decoded = Buffer.from(token, 'base64').toString('utf-8');
		const tokenSplit = decoded.split(':');

		if (tokenSplit.length !== 2) {
			throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
		}
		const [phone, password] = tokenSplit;

		return {
			phone,
			password,
		};
	}

	parseBearerToken(rawToken: string, isRefreshToken: boolean) {
		const bearerSplit = rawToken.split(' ');

		if (bearerSplit.length !== 2) {
			throw new BadRequestException('토큰 포멧이 잘못되었습니다.');
		}

		const [bearer, token] = bearerSplit;

		if (bearer.toLowerCase() !== 'bearer') {
			throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}

		try {
			const payload = this.jwtService.verify(token, {
				secret: this.configService.get<string>(
					isRefreshToken
						? envVariables.refreshTokenSecret
						: envVariables.accessTokenSecret,
				),
			});
			if (isRefreshToken) {
				if (payload.type !== 'refresh') {
					throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
				}
			} else {
				if (payload.type !== 'access') {
					throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
				}
			}
			return payload;
		} catch (e) {
			throw new UnauthorizedException('토큰 만료 되었습니다.');
		}
	}

	async register(rawToken: string, createUserDto: CreateUserDto) {
		const { phone, password } = this.parseBasicToken(rawToken);

		const user = await this.userRepository.findOne({ where: { phone } });

		if (user) {
			throw new BadRequestException('이미 가입한 사용자 입니다.');
		}

		const hash = await bcrypt.hash(
			password,
			this.configService.getOrThrow<number>(envVariables.hashRounds),
		);

		const newUser = this.userRepository.create({
			phone,
			password: hash,
			name: createUserDto.name,
			role: createUserDto.role,
			companyId: createUserDto.companyId,
			workshopId: createUserDto.workshopId,
			icCardNumber: createUserDto.icCardNumber,
			isActivated: createUserDto.isActivated,
		});

		await this.userRepository.save(newUser);

		return this.userRepository.findOne({ where: { id: newUser.id } });
	}

	async authenticate(phone: string, password: string) {
		const user = await this.userRepository.findOne({ where: { phone } });

		if (!user) {
			throw new BadRequestException('잘못된 로그인 정보입니다.');
		}
		const passOk = await bcrypt.compare(password, user.password);

		if (!passOk) {
			throw new BadRequestException('잘못된 로그인 정보입니다.');
		}
		return user;
	}

	issueToken(user: { id: number; role: UserRole }, isRefreshToken: boolean) {
		const refreshTokenSecret = this.configService.get<string>(
			envVariables.refreshTokenSecret,
		);
		const accessTokenSecret = this.configService.get<string>(
			envVariables.accessTokenSecret,
		);

		return this.jwtService.sign(
			{
				sub: user.id,
				role: user.role,
				type: isRefreshToken ? 'refresh' : 'access',
			},
			{
				secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
				expiresIn: isRefreshToken ? '7d' : '24h',
			},
		);
	}

	async login(rawToken: string) {
		const { phone, password } = this.parseBasicToken(rawToken);

		const user = await this.authenticate(phone, password);

		return {
			refreshToken: this.issueToken(user, true),
			accessToken: this.issueToken(user, false),
		};
	}
}
