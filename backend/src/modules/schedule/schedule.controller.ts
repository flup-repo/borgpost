import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleSlotDto } from './dto/create-schedule-slot.dto';

@Controller('api/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleSlotDto: CreateScheduleSlotDto) {
    return this.scheduleService.create(createScheduleSlotDto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
