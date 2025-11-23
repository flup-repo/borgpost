import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Matches } from 'class-validator';

export class CreateScheduleSlotDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
  time: string;

  @IsString()
  @IsNotEmpty()
  daysOfWeek: string; // Comma-separated string "MONDAY,TUESDAY"

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
