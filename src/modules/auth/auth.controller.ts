// import type { LoginDTO, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDTO, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { IsPublic } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  loginValidationSchema,
  registerValidationSchema,
} from './util/auth-validation.schema';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  register(
    @Body(new ZodValidationPipe(registerValidationSchema))
    registerDTO: RegisterDTO,
  ): Promise<UserResponseDTO> {
    return this.authService.register(registerDTO);
  }

  @Post('login')
  @IsPublic()
  login(
    @Body(new ZodValidationPipe(loginValidationSchema)) loginDTO: LoginDTO,
  ): Promise<UserResponseDTO> {
    return this.authService.login(loginDTO);
  }

  @Get('me')
  me(@User('id') userId: string) {
    return this.authService.me(userId);
  }

  @Get('validate')
  validate(@User() user: UserResponseDTO['user']): UserResponseDTO {
    return this.authService.validate(user);
  }
}
