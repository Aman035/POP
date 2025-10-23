"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetAnalyzerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tweet_analyzer_service_1 = require("./tweet-analyzer.service");
let TweetAnalyzerController = class TweetAnalyzerController {
    constructor(tweetAnalyzerService) {
        this.tweetAnalyzerService = tweetAnalyzerService;
    }
    async analyzeTweet(request) {
        const { content, source, postId } = request;
        if (!content || content.trim().length === 0) {
            throw new common_1.BadRequestException('Content is required');
        }
        if (!source || !['twitter', 'farcaster'].includes(source)) {
            throw new common_1.BadRequestException('Source must be either "twitter" or "farcaster"');
        }
        if (!postId || postId.trim().length === 0) {
            throw new common_1.BadRequestException('Post ID is required');
        }
        if (content.length > 1000) {
            throw new common_1.BadRequestException('Content is too long (max 1000 characters)');
        }
        try {
            return await this.tweetAnalyzerService.analyzeTweet(request);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to analyze tweet: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TweetAnalyzerController = TweetAnalyzerController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({
        summary: 'Analyze a tweet/post and generate a prediction market',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Tweet analysis request',
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'The content of the tweet/post to analyze',
                    example: 'Tesla stock is going to hit $300 by end of year!',
                },
                source: {
                    type: 'string',
                    description: 'The source platform',
                    enum: ['twitter', 'farcaster'],
                    example: 'twitter',
                },
                postId: {
                    type: 'string',
                    description: 'Unique identifier for the post',
                    example: '1234567890',
                },
            },
            required: ['content', 'source', 'postId'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tweet analysis completed successfully',
        schema: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    example: 'Will Tesla stock reach $300 by the end of 2024?',
                },
                options: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Yes', 'No'],
                },
                category: {
                    type: 'string',
                    example: 'Business',
                },
                confidence: {
                    type: 'number',
                    example: 0.85,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - invalid input parameters',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'Content is required' },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error - LLM analysis failed',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: 'Failed to analyze tweet' },
                error: { type: 'string', example: 'Internal Server Error' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TweetAnalyzerController.prototype, "analyzeTweet", null);
exports.TweetAnalyzerController = TweetAnalyzerController = __decorate([
    (0, swagger_1.ApiTags)('tweet-analyzer'),
    (0, common_1.Controller)('api/tweet-analyzer'),
    __metadata("design:paramtypes", [tweet_analyzer_service_1.TweetAnalyzerService])
], TweetAnalyzerController);
//# sourceMappingURL=tweet-analyzer.controller.js.map