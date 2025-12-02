import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { PaginationQueryType } from 'src/common/types/util.types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import type { UpdateUserDTO } from './dto/user.dto';

@Controller('users')
@Roles([UserRole.ADMIN])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: PaginationQueryType['page'],
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: PaginationQueryType['limit'],
  ) {
    return this.userService.findAll({
      page,
      limit,
    });
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
