import { Injectable } from '@nestjs/common';
import { UpdateUserDTO } from './dto/user.dto';
import { DatabaseService } from '../database/database.service';
import { RegisterDTO, UserResponseDTO } from '../auth/dto/auth.dto';
import {
  PaginatedResult,
  PaginationQueryType,
} from '../../common/types/util.types';
import { UserRole } from 'generated/prisma/client';
import { removeFields } from 'src/common/utils/object.util';
import { createArgonHash } from 'src/common/utils/argon.file';

@Injectable()
export class UserService {
  constructor(private prismaService: DatabaseService) {}

  async create(registerDTO: RegisterDTO, role: UserRole) {
    if (role === UserRole.GUEST) {
      return await this.prismaService.user.create({
        data: registerDTO,
        omit: { password: true },
      });
    } else {
      // hash password
      const hashedPassword = await createArgonHash(registerDTO.password);

      return await this.prismaService.user.create({
        data: {
          role,
          password: hashedPassword,
          email: registerDTO.email,
          name: registerDTO.name,
        },
        omit: { password: true },
      });
    }
  }

  findAll(
    query: PaginationQueryType,
  ): Promise<PaginatedResult<UserResponseDTO['user']>> {
    return this.prismaService.$transaction(async (prisma) => {
      const { skip, take, page } =
        this.prismaService.handleQueryPagination(query);
      const users = await prisma.user.findMany({
        where: {
          role: { not: UserRole.ADMIN }, // Filter for non-admin users
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        omit: {
          password: true,
        },
      });
      const count = await prisma.user.count({
        where: { role: { not: UserRole.ADMIN } }, // Count only non-admin users
      });
      return {
        data: users,
        ...this.prismaService.formatPaginationResponse({
          page,
          count,
          limit: take,
        }),
      };
    });
  }

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

  async update(id: string, userUpdatePayload: UpdateUserDTO) {
    if (userUpdatePayload.password) {
      const hashedValue = await createArgonHash(userUpdatePayload.password);
      userUpdatePayload.password = hashedValue;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: userUpdatePayload,
    });

    return removeFields(updatedUser, ['password']);
  }

  // remove(id: string) {
  //   return this.prismaService.user.update({
  //     where: { id },
  //     data: { isDeleted: true },
  //   });
  // }
}
