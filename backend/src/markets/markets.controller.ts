import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketsService } from './markets.service';

const ALLOWED_SOURCES = new Set(['twitter', 'farcaster']);

@ApiTags('markets')
@Controller('api/markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get('exists')
  @ApiOperation({ summary: 'Check if a prediction market exists for a post' })
  @ApiQuery({
    name: 'postId',
    required: true,
    description: 'The ID of the post to check',
    example: '1234567890',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    description: 'The source platform of the post',
    enum: ['twitter', 'farcaster'],
    example: 'twitter',
  })
  @ApiResponse({
    status: 200,
    description: 'Market existence check completed successfully',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing or invalid parameters',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'postId query parameter is required',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async getExists(
    @Query('postId') postId?: string,
    @Query('source') source = 'twitter',
  ) {
    const trimmedPostId = postId?.trim();
    if (!trimmedPostId) {
      throw new BadRequestException('postId query parameter is required');
    }

    const normalisedSource = source?.trim().toLowerCase() || 'twitter';
    if (!ALLOWED_SOURCES.has(normalisedSource)) {
      throw new BadRequestException(
        'source must be either "twitter" or "farcaster"',
      );
    }

    const exists = await this.marketsService.exists(
      normalisedSource,
      trimmedPostId,
    );

    return { exists };
  }
}
