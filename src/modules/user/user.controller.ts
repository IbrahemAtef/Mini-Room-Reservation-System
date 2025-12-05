import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { PaginationQueryType } from 'src/common/types/util.types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import type { UpdateUserDTO } from './dto/user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { paginationSchema } from 'src/common/utils/api.util';
import type { RegisterDTO } from '../auth/dto/auth.dto';
import { registerValidationSchema } from '../auth/util/auth-validation.schema';

@Controller('users')
@Roles([UserRole.ADMIN])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('owner/create')
  createOwner(
    @Body(new ZodValidationPipe(registerValidationSchema))
    registerDTO: RegisterDTO,
  ) {
    return this.userService.create(registerDTO, UserRole.OWNER);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQueryType,
  ) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(id, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  // return this.userService.remove(+id);
  // }
}
