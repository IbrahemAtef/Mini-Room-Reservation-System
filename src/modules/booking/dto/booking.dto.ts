export type CreateBookingDTO = {
  roomId: string;
  checkIn: string;
  checkOut: string;
};

export type UpdateBookingDTO = Partial<CreateBookingDTO>;
