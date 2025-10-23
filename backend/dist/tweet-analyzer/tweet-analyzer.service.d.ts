export interface MarketAnalysis {
    question: string;
    options: [string, string];
    category: string;
    confidence: number;
}
export interface TweetAnalysisRequest {
    content: string;
    source: string;
    postId: string;
}
export declare class TweetAnalyzerService {
    private readonly logger;
    private openai;
    private groqOpenai;
    constructor();
    private initializeProviders;
    analyzeTweet(request: TweetAnalysisRequest): Promise<MarketAnalysis>;
    private analyzeWithGroq;
    private analyzeWithOpenAI;
    private buildPrompt;
    private parseResponse;
}
