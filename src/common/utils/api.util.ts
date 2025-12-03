import {
  AvailableRoomsQueryDTO,
  PaginationQueryType,
} from '../types/util.types';
import z, { ZodType } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
}) satisfies ZodType<PaginationQueryType>;

export const AvailableRoomsQuerySchema = paginationSchema
  .extend({
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minCapacity: z.coerce.number().optional(),
    maxCapacity: z.coerce.number().optional(),

    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),

    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid startDate format')
      .optional(),

    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid endDate format')
      .optional(),
  })
  .refine(
    (data) =>
      (data.startDate && data.endDate) || (!data.startDate && !data.endDate),
    {
      message: 'startDate and endDate must both be provided or both omitted',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    },
  ) satisfies ZodType<AvailableRoomsQueryDTO>;
