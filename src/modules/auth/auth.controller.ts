// import type { LoginDto, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RegisterDTO, UserResponseDTO } from './dto/auth.dto';
import { IsPublic } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  register(@Body() registerDTO: RegisterDTO): Promise<UserResponseDTO> {
    return this.authService.register(registerDTO);
  }
  @Post('login')
  @IsPublic()
  login(@Body() loginDto: LoginDto): Promise<UserResponseDTO> {
    return this.authService.login(loginDto);
  }

  //TODO: @User as body
  // @Get('validate')
  // validate() {
  //   return this.authService.validate();
  // }
}
