import { Room } from 'generated/prisma/client';

export type CreateRoomDTO = Pick<Room, 'name' | 'price' | 'capacity'>;

export type UpdateRoomDTO = Partial<CreateRoomDTO>;
