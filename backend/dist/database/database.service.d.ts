import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export interface PostRecord {
    id?: number;
    source: string;
    post_id: string;
    created_at?: string;
}
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private db;
    onModuleInit(): void;
    onModuleDestroy(): void;
    getPost(source: string, postId: string): Promise<PostRecord | undefined>;
    insertPost(source: string, postId: string): Promise<PostRecord>;
    private resolveDatabasePath;
    private ensureDirectory;
}
