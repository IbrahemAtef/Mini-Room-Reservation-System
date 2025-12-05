import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateRoomDTO,
  RoomStatusDTO,
  UpdateRoomDTO,
} from './dto/room.dto';
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
    // TODO: if room price is the one to update do i need to update the booking ?
    return this.prismaService.room.update({
      where: {
        id,
        ownerId,
      },
      data: updateRoomDTO,
    });
  }

  updateRoomStatus(id: string, roomStatus: RoomStatusDTO, ownerId: string) {
    return this.prismaService.room.update({
      where: {
        id,
        ownerId,
      },
      data: { status: roomStatus.status },
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

  async findRoomWithBookings(id: string, ownerId: string) {
    const room = await this.prismaService.room.findFirst({
      where: {
        id,
        ownerId,
        status: RoomStatus.ACTIVE,
      },
      include: {
        bookings: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }
}
