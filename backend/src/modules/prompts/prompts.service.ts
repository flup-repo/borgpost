import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './prompts.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
  ) {}

  async findAll(categoryId?: number): Promise<Prompt[]> {
    const where = categoryId ? { categoryId } : {};
    return this.promptRepository.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!prompt) {
      throw new NotFoundException(`Prompt with ID ${id} not found`);
    }
    return prompt;
  }

  async create(createPromptDto: CreatePromptDto): Promise<Prompt> {
    const prompt = this.promptRepository.create(createPromptDto);
    return this.promptRepository.save(prompt);
  }

  async update(id: number, updatePromptDto: UpdatePromptDto): Promise<Prompt> {
    const prompt = await this.findOne(id);
    Object.assign(prompt, updatePromptDto);
    return this.promptRepository.save(prompt);
  }

  async remove(id: number): Promise<void> {
    const prompt = await this.findOne(id);
    await this.promptRepository.remove(prompt);
  }
}
