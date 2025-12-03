import { Injectable } from '@nestjs/common';
import type { CreateRoomDTO, UpdateRoomDTO } from './dto/room.dto';
import { DatabaseService } from '../database/database.service';
import { RoomStatus, UserRole } from 'generated/prisma/enums';
import {
  AvailableRoomsQueryDTO,
  PaginatedResult,
} from 'src/common/types/util.types';
import { Room } from 'generated/prisma/client';

@Injectable()
export class RoomService {
  constructor(private prismaService: DatabaseService) {}

  createRoom(createRoomDTO: CreateRoomDTO, ownerId: string) {
    return this.prismaService.room.create({
      data: {
        ...createRoomDTO,
        ownerId,
      },
    });
  }

  updateRoomDetails(id: string, updateRoomDTO: UpdateRoomDTO, ownerId: string) {
    return this.prismaService.room.update({
      where: {
        id,
        ownerId,
      },
      data: updateRoomDTO,
    });
  }

  updateRoomStatus(id: string, roomStatus: RoomStatus, ownerId: string) {
    return this.prismaService.room.update({
      where: {
        id,
        ownerId,
      },
      data: { status: roomStatus },
    });
  }

  findAllRooms(
    userId: string,
    role: UserRole,
    query: AvailableRoomsQueryDTO,
  ): Promise<PaginatedResult<Omit<Room, 'ownerId'>>> {
    return this.prismaService.$transaction(async (prisma) => {
      const { skip, take, page } =
        this.prismaService.handleQueryPagination(query);
      const where = this.prismaService.buildRoomWhereFilter(
        userId,
        role,
        query,
      );
      const rooms = await prisma.room.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const count = await prisma.room.count({ where });
      return {
        data: rooms,
        ...this.prismaService.formatPaginationResponse({
          page,
          count,
          limit: take,
        }),
      };
    });
  }

  findRoomWithBookings(id: string, ownerId: string) {
    return this.prismaService.room.findUnique({
      where: {
        id,
        ownerId,
        status: RoomStatus.ACTIVE,
      },
      include: {
        bookings: true,
      },
    });
  }
}
