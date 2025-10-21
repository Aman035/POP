import { Injectable } from '@nestjs/common';
import { DatabaseService, PostRecord } from '../database/database.service';

@Injectable()
export class MarketsService {
  constructor(private readonly database: DatabaseService) {}

  async findBySourceAndPost(
    source: string,
    postId: string,
  ): Promise<PostRecord | undefined> {
    return this.database.getPost(source, postId);
  }

  async exists(source: string, postId: string): Promise<boolean> {
    const post = await this.findBySourceAndPost(source, postId);
    return Boolean(post);
  }

  async register(source: string, postId: string): Promise<PostRecord> {
    return this.database.insertPost(source, postId);
  }
}
