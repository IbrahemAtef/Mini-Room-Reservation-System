import z, { ZodType } from 'zod';
import { CreateBookingDTO, UpdateBookingDTO } from '../dto/booking.dto';

// base schema
export const CreateBookingValidationSchema = z
  .object({
    roomId: z.string().min(1, 'roomId is required'),

    checkIn: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid checkIn date'),

    checkOut: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid checkOut date'),
  })
  .refine((data) => new Date(data.checkIn) < new Date(data.checkOut), {
    message: 'checkIn must be before checkOut',
    path: ['checkIn'],
  }) satisfies ZodType<CreateBookingDTO>;

export const updateBookingValidationSchema =
  CreateBookingValidationSchema.partial() satisfies ZodType<UpdateBookingDTO>;
