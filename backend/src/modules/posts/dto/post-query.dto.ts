import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { PostStatus } from '../posts.entity';
import { Transform } from 'class-transformer';

export class PostQueryDto {
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  offset?: number;
}
