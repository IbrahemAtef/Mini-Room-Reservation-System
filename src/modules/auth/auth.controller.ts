// import type { LoginDto, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { IsPublic } from 'src/common/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  loginValidationSchema,
  registerValidationSchema,
} from './util/auth-validation.schema';

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
    @Body(new ZodValidationPipe(loginValidationSchema)) loginDto: LoginDto,
  ): Promise<UserResponseDTO> {
    return this.authService.login(loginDto);
  }

  //TODO: @User as body
  // @Get('validate')
  // validate() {
  //   return this.authService.validate();
  // }
}
