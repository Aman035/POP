import { TweetAnalyzerService, TweetAnalysisRequest, MarketAnalysis } from './tweet-analyzer.service';
export declare class TweetAnalyzerController {
    private readonly tweetAnalyzerService;
    constructor(tweetAnalyzerService: TweetAnalyzerService);
    analyzeTweet(request: TweetAnalysisRequest): Promise<MarketAnalysis>;
}
