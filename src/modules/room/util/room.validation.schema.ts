import z, { ZodType } from 'zod';
import { CreateRoomDTO, RoomStatusDTO, UpdateRoomDTO } from '../dto/room.dto';
import { Decimal } from 'generated/prisma/internal/prismaNamespace';

// base schema
export const CreateRoomValidationSchema = z.object({
  name: z
    .string()
    .min(2, 'Room name is required')
    .max(255, 'Room name must be less than 255 characters'),

  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a decimal with up to 2 digits')
    .transform((val) => Decimal(val)),

  capacity: z
    .number()
    .int('Capacity must be an integer')
    .positive('Capacity must be greater than zero'),
}) satisfies ZodType<CreateRoomDTO>;

export const updateRoomValidationSchema =
  CreateRoomValidationSchema.partial() satisfies ZodType<UpdateRoomDTO>;

export const RoomStatusSchema = z.object({
  status: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['ACTIVE', 'INACTIVE']),
  ),
}) satisfies ZodType<RoomStatusDTO>;
