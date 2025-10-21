import { DatabaseService, PostRecord } from '../database/database.service';
export declare class MarketsService {
    private readonly database;
    constructor(database: DatabaseService);
    findBySourceAndPost(source: string, postId: string): Promise<PostRecord | undefined>;
    exists(source: string, postId: string): Promise<boolean>;
    register(source: string, postId: string): Promise<PostRecord>;
}
