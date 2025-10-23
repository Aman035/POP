import { MarketsService } from './markets.service';
export declare class MarketsController {
    private readonly marketsService;
    constructor(marketsService: MarketsService);
    getExists(postId?: string, source?: string): Promise<{
        exists: boolean;
    }>;
}
