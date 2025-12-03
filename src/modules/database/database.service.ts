import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from 'generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import {
  AvailableRoomsQueryDTO,
  PaginationQueryType,
  PaginationResponseMeta,
} from 'src/common/types/util.types';
import { RoomStatus, UserRole } from 'generated/prisma/enums';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  handleQueryPagination(query: PaginationQueryType) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return { skip: (page - 1) * limit, take: limit, page };
  }

  formatPaginationResponse(args: {
    page: number;
    count: number;
    limit: number;
  }): PaginationResponseMeta {
    return {
      meta: {
        total: args.count,
        page: args.page,
        limit: args.limit,
        totalPages: Math.ceil(args.count / args.limit),
      },
    };
  }

  buildRoomWhereFilter = (
    userId: string,
    role: UserRole,
    query: AvailableRoomsQueryDTO,
  ): Prisma.RoomWhereInput => {
    const where: Prisma.RoomWhereInput =
      role === UserRole.OWNER ? { ownerId: userId } : {}; // either admin or owner

    // Price filtering
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};

      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }

      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    // Capacity filtering
    if (query.minCapacity !== undefined || query.maxCapacity !== undefined) {
      where.capacity = {};

      if (query.minCapacity !== undefined) {
        where.capacity.gte = query.minCapacity;
      }

      if (query.maxCapacity !== undefined) {
        where.capacity.lte = query.maxCapacity;
      }
    }
    // Status filtering
    if (query.status) {
      where.status = query.status;
    }

    // Guest Available rooms filtering
    if (role === UserRole.GUEST && query.endDate && query.startDate) {
      where.status = RoomStatus.ACTIVE;
      where.bookings = {
        none: {
          AND: [
            { checkIn: { lt: query.endDate } },
            { checkOut: { gt: query.startDate } },
          ],
        },
      };
    }
    return where;
  };
}
