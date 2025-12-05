import { HttpStatus } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { BookingStatus, RoomStatus } from 'generated/prisma/enums';

export type PaginationQueryType = {
  page: number;
  limit: number;
};
export type BookingQueryDTO = {
  status?: BookingStatus;
  roomId?: string;
  date?: Date; // ISO date
} & PaginationQueryType;

export type AvailableRoomsQueryDTO = {
  startDate?: Date; // ISO date
  endDate?: Date; // ISO date
  minPrice?: number;
  maxPrice?: number;

  minCapacity?: number;
  maxCapacity?: number;

  status?: RoomStatus;
} & PaginationQueryType;

export type PaginationResponseMeta = {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
export type PaginatedResult<T> = {
  data: T[];
} & PaginationResponseMeta;

export type TransactionClient = Prisma.TransactionClient;

type ApiSuccessResponse<T> = {
  success: true;
  data: T | T[];
} & Partial<PaginationResponseMeta>;

export type ApiErrorResponse = {
  success: false;
  message: string;
  timestamp: string;
  statusCode: HttpStatus;
  path: string;
  fields?: { field: string; message: string }[];
};
export type UnifiedApiResponse<T> = ApiSuccessResponse<T>;
