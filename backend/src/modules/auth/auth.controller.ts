import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import type { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
