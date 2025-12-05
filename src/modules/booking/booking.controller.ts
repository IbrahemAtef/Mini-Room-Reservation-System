import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CreateBookingValidationSchema } from './util/booking.validation.schema';
import type { CreateBookingDTO } from './dto/booking.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { BookingQuerySchema } from 'src/common/utils/api.util';
import type { BookingQueryDTO } from 'src/common/types/util.types';

@Controller('booking')
@Roles([UserRole.GUEST, UserRole.OWNER, UserRole.ADMIN])
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @Roles([UserRole.GUEST])
  create(
    @Body(new ZodValidationPipe(CreateBookingValidationSchema))
    dto: CreateBookingDTO,
    @User('id') userId: string,
  ) {
    return this.bookingService.createBooking(userId, dto);
  }

  @Get('all')
  findAllBooking(
    @User('id') userId: string,
    @User('role') role: UserRole,
    @Query(new ZodValidationPipe(BookingQuerySchema))
    query: BookingQueryDTO,
  ) {
    return this.bookingService.findAllBooking(userId, role, query);
  }

  @Get(':id')
  findBookingDetails(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('role') role: UserRole,
  ) {
    return this.bookingService.findBookingDetails(id, userId, role);
  }

  @Patch(':id/cancel')
  @Roles([UserRole.GUEST])
  cancelBooking(@Param('id') id: string, @User('id') userId: string) {
    return this.bookingService.cancelBooking(id, userId);
  }

  @Patch(':id/confirm')
  @Roles([UserRole.OWNER])
  confirmBooking(@Param('id') id: string, @User('id') userId: string) {
    return this.bookingService.confirmBooking(id, userId);
  }
}
