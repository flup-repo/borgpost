import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(query: PostQueryDto): Promise<[Post[], number]> {
    const { status, categoryId, limit = 50, offset = 0 } = query;
    const qb = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.prompt', 'prompt')
      .leftJoinAndSelect('post.metrics', 'metrics')
      .orderBy('post.scheduledTime', 'ASC')
      .skip(offset)
      .take(limit);

    if (status) {
      qb.andWhere('post.status = :status', { status });
    }
    if (categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    return qb.getManyAndCount();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['category', 'prompt', 'metrics', 'childPosts', 'parentPost'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      status: PostStatus.DRAFT, // Default status, might be overridden if scheduling logic exists
    });
    return this.postRepository.save(post);
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }
}
