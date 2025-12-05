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
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

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
  @Roles([UserRole.ADMIN, UserRole.GUEST, UserRole.GUEST])
  me(@User('id') userId: string) {
    return this.authService.me(userId);
  }

  @Get('validate')
  @Roles([UserRole.ADMIN, UserRole.GUEST, UserRole.GUEST])
  validate(@User() user: UserResponseDTO['user']): UserResponseDTO {
    return this.authService.validate(user);
  }
  // This method is for :
  // extending session time
  // refreshing tokens
  // checking validity
}
