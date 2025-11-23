import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleSlot } from './schedule-slot.entity';
import { CreateScheduleSlotDto } from './dto/create-schedule-slot.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleSlot)
    private readonly scheduleRepository: Repository<ScheduleSlot>,
  ) {}

  async create(createScheduleSlotDto: CreateScheduleSlotDto): Promise<ScheduleSlot> {
    const slot = this.scheduleRepository.create(createScheduleSlotDto);
    return this.scheduleRepository.save(slot);
  }

  async findAll(): Promise<ScheduleSlot[]> {
    return this.scheduleRepository.find({
      relations: ['category'],
      order: {
        time: 'ASC',
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRepository.delete(id);
  }
}
