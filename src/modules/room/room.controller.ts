import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { Roles } from '../../common/decorators/roles.decorator';
import type {
  CreateRoomDTO,
  RoomStatusDTO,
  UpdateRoomDTO,
} from './dto/room.dto';
import { User } from 'src/common/decorators/user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateRoomValidationSchema,
  RoomStatusSchema,
  updateRoomValidationSchema,
} from './util/room.validation.schema';
import { UserRole } from 'generated/prisma/enums';
import { AvailableRoomsQuerySchema } from 'src/common/utils/api.util';
import type { AvailableRoomsQueryDTO } from 'src/common/types/util.types';

@Controller('room')
@Roles([UserRole.OWNER])
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  createRoom(
    @Body(new ZodValidationPipe(CreateRoomValidationSchema))
    createRoomDTO: CreateRoomDTO,
    @User('id') userId: string,
  ) {
    return this.roomService.createRoom(createRoomDTO, userId);
  }

  @Patch(':id/details')
  updateRoomDetails(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoomValidationSchema))
    updateRoomDTO: UpdateRoomDTO,
    @User('id') ownerId: string,
  ) {
    return this.roomService.updateRoomDetails(id, updateRoomDTO, ownerId);
  }

  @Patch(':id/status')
  updateRoomStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RoomStatusSchema)) roomStatus: RoomStatusDTO,
    @User('id') ownerId: string,
  ) {
    return this.roomService.updateRoomStatus(id, roomStatus, ownerId);
  }

  @Get('all')
  @Roles([UserRole.OWNER, UserRole.ADMIN])
  findAllRooms(
    @User('id') userId: string,
    @User('role') role: UserRole,
    @Query(new ZodValidationPipe(AvailableRoomsQuerySchema))
    query: AvailableRoomsQueryDTO,
  ) {
    return this.roomService.findAllRooms(userId, role, query);
  }

  @Get('available')
  @Roles([UserRole.GUEST])
  findAvailableRooms(
    @User('id') userId: string,
    @User('role') role: UserRole,
    @Query(new ZodValidationPipe(AvailableRoomsQuerySchema))
    query: AvailableRoomsQueryDTO,
  ) {
    return this.roomService.findAllRooms(userId, role, query);
  }

  @Get(':id')
  findRoomWithBookings(@Param('id') id: string, @User('id') ownerId: string) {
    return this.roomService.findRoomWithBookings(id, ownerId);
  }
}
