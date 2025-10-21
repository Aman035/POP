import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import {
  TweetAnalyzerService,
  TweetAnalysisRequest,
  MarketAnalysis,
} from './tweet-analyzer.service';

@ApiTags('tweet-analyzer')
@Controller('api/tweet-analyzer')
export class TweetAnalyzerController {
  constructor(private readonly tweetAnalyzerService: TweetAnalyzerService) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze a tweet/post and generate a prediction market',
  })
  @ApiBody({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  async analyzeTweet(
    @Body() request: TweetAnalysisRequest,
  ): Promise<MarketAnalysis> {
    const { content, source, postId } = request;

    // Validate input
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Content is required');
    }

    if (!source || !['twitter', 'farcaster'].includes(source)) {
      throw new BadRequestException(
        'Source must be either "twitter" or "farcaster"',
      );
    }

    if (!postId || postId.trim().length === 0) {
      throw new BadRequestException('Post ID is required');
    }

    if (content.length > 1000) {
      throw new BadRequestException(
        'Content is too long (max 1000 characters)',
      );
    }

    try {
      return await this.tweetAnalyzerService.analyzeTweet(request);
    } catch (error) {
      throw new HttpException(
        `Failed to analyze tweet: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
