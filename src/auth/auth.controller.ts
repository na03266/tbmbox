import {Body, Controller, Get, Headers, Post, Request, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UserRole} from "../users/entities/user.entity";
import {JwtAuthGuard} from "./strategy/jwt.strategy";
import {LocalAuthGuard} from "./strategy/local.strategy";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('user/register')
    // authorization : Basic
    registerUser(
        @Headers('Authorization') token: string,
        @Body() body: CreateUserDto,
    ) {
        console.log(body);
        return this.authService.register(token, body);
    }

    @Post('admin/register')
    // authorization : Basic
    registerAdmin(
        @Headers('Authorization') token: string,
        @Body() body: CreateUserDto,
    ) {
        body.role = UserRole.ADMIN;
        console.log(body);
        return this.authService.register(token, body);
    }

    @Post('login')
    // authorization : Basic
    loginUser(@Headers('Authorization') token: string) {
        return this.authService.login(token);
    }

    @Post('token/access')
    rotateAccessToken(@Headers('Authorization') token: string) {
        const payload = this.authService.parseBearerToken(token, true);
        return {
            accessToken: this.authService.issueToken(payload, false)
        };
    }

    @UseGuards(LocalAuthGuard)
    @Post('login/passport')
    async loginUserPassport(@Request() req) {
        console.log(req.user);
        return {
            refreshToken: this.authService.issueToken(req.user, true),
            accessToken: this.authService.issueToken(req.user, false)
        }
    } 

    @UseGuards(JwtAuthGuard)
    @Get('private')
    async private(@Request() req) {
        return req.user;
    }
}
