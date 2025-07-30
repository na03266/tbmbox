import {Controller, Post, Headers, Body} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UserRole} from "../users/entities/user.entity";

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
}
