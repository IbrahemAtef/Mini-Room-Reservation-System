import { Injectable } from '@nestjs/common';
import { UpdateUserDTO } from './dto/user.dto';
import { DatabaseService } from '../database/database.service';
import { RegisterDTO } from '../auth/dto/auth.dto';
// import {
//   PaginatedResult,
//   PaginationQueryType,
// } from 'src/common/types/util.types';

@Injectable()
export class UserService {
  constructor(private prismaService: DatabaseService) {}
  create(registerDTO: RegisterDTO) {
    return this.prismaService.user.create({
      data: registerDTO,
    });
  }

  // findAll(
  //   query: PaginationQueryType,
  // ): Promise<PaginatedResult<Omit<User, 'password'>>> {
  //   return this.prismaService.$transaction(async (prisma) => {
  //     const pagination = this.prismaService.handleQueryPagination(query);
  //     const users = await prisma.user.findMany({
  //       ...removeFields(pagination, ['page']),
  //       where: { isDeleted: false },
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //       omit: {
  //         password: true,
  //       },
  //     });
  //     const count = await prisma.user.count({ where: { isDeleted: false } });
  //     return {
  //       data: users,
  //       ...this.prismaService.formatPaginationResponse({
  //         page: pagination.page,
  //         count,
  //         limit: pagination.take,
  //       }),
  //     };
  //   });
  // }
  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  update(id: string, userUpdatePayload: UpdateUserDTO) {
    return this.prismaService.user.update({
      where: { id },
      data: userUpdatePayload,
      omit: { password: true },
    });
  }

  // remove(id: string) {
  //   return this.prismaService.user.update({
  //     where: { id },
  //     data: { isDeleted: true },
  //   });
  // }
}
