import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, IsUrl } from 'class-validator';
import { PostStatus } from '../posts.entity';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsDateString()
  @IsOptional()
  scheduledTime?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  promptId?: number;

  @IsNumber()
  @IsOptional()
  slotId?: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
}
