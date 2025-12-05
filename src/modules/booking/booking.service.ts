import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBookingDTO } from './dto/booking.dto';
import { Decimal } from 'generated/prisma/internal/prismaNamespace';
import { BookingQueryDTO, PaginatedResult } from 'src/common/types/util.types';
import { BookingStatus, UserRole } from 'generated/prisma/enums';
import { Booking } from 'generated/prisma/client';

@Injectable()
export class BookingService {
  constructor(private prismaService: DatabaseService) {}

  async createBooking(userId: string, createBookingDTO: CreateBookingDTO) {
    const { roomId, checkIn, checkOut } = createBookingDTO;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // 1. Ensure room exists and get price
    const room = await this.prismaService.room.findFirst({
      where: { id: roomId, status: 'ACTIVE' },
    });

    if (!room) throw new NotFoundException('Room not found');

    // 2. Check for overlap bookings
    const conflict = await this.prismaService.booking.findFirst({
      where: {
        roomId,
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException(
        'This room is not available for these dates',
      );
    }

    // 3. Calculate total price
    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);

    // ? ASK: no need handled in zod
    // if (nights <= 0) throw new BadRequestException('Invalid date range');

    const totalPrice = Decimal(room.price).mul(nights);

    // 4. Create booking
    return await this.prismaService.booking.create({
      data: {
        roomId,
        guestId: userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
      },
    });
  }

  findAllBooking(
    userId: string,
    userRole: UserRole, // 'GUEST' | 'OWNER' | 'ADMIN'
    query: BookingQueryDTO,
  ): Promise<PaginatedResult<Booking>> {
    return this.prismaService.$transaction(async (prisma) => {
      const { skip, take, page } =
        this.prismaService.handleQueryPagination(query);
      const where = this.prismaService.buildBookingWhereFilter(
        userId,
        userRole,
        query,
      );

      const bookings = await prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const count = await prisma.booking.count({ where });
      return {
        data: bookings,
        ...this.prismaService.formatPaginationResponse({
          page,
          count,
          limit: take,
        }),
      };
    });
  }

  async findBookingDetails(id: string, userId: string, role: UserRole) {
    const bookingInclude =
      role === UserRole.GUEST
        ? {
            room: {
              include: { owner: true },
            },
          }
        : role === UserRole.OWNER
          ? {
              guest: true,
              room: true,
            }
          : {
              room: {
                include: { owner: true },
              },
              guest: true,
            };

    // 1. Load booking with relations
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // 2. Role-based access control
    if (role === UserRole.GUEST && booking.guestId !== userId) {
      throw new ForbiddenException('You cannot view this booking');
    }

    //TODO: check if it works
    if (role === UserRole.OWNER && booking.room.ownerId !== userId) {
      throw new ForbiddenException('You cannot view this booking');
    }

    // ADMIN → no restrictions

    return booking;
  }

  async cancelBooking(id: string, userId: string) {
    // 1. Fetch booking first
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException('Only pending bookings can be cancelled');
    }

    // 2. Update status
    return this.prismaService.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  async confirmBooking(id: string, userId: string) {
    // 1. Fetch booking first
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
      include: { room: { include: { owner: true } } },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.room.ownerId !== userId) {
      throw new ForbiddenException('You cannot confirm this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException('Only pending bookings can be confirmed');
    }

    // 2. Update status
    return this.prismaService.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
    });
  }
}
