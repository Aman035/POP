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
exports.MarketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const markets_service_1 = require("./markets.service");
const ALLOWED_SOURCES = new Set(['twitter', 'farcaster']);
let MarketsController = class MarketsController {
    constructor(marketsService) {
        this.marketsService = marketsService;
    }
    async getExists(postId, source = 'twitter') {
        const trimmedPostId = postId?.trim();
        if (!trimmedPostId) {
            throw new common_1.BadRequestException('postId query parameter is required');
        }
        const normalisedSource = source?.trim().toLowerCase() || 'twitter';
        if (!ALLOWED_SOURCES.has(normalisedSource)) {
            throw new common_1.BadRequestException('source must be either "twitter" or "farcaster"');
        }
        const exists = await this.marketsService.exists(normalisedSource, trimmedPostId);
        return { exists };
    }
};
exports.MarketsController = MarketsController;
__decorate([
    (0, common_1.Get)('exists'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a prediction market exists for a post' }),
    (0, swagger_1.ApiQuery)({
        name: 'postId',
        required: true,
        description: 'The ID of the post to check',
        example: '1234567890',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'source',
        required: false,
        description: 'The source platform of the post',
        enum: ['twitter', 'farcaster'],
        example: 'twitter',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Market existence check completed successfully',
        schema: {
            type: 'object',
            properties: {
                exists: { type: 'boolean', example: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Query)('postId')),
    __param(1, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketsController.prototype, "getExists", null);
exports.MarketsController = MarketsController = __decorate([
    (0, swagger_1.ApiTags)('markets'),
    (0, common_1.Controller)('api/markets'),
    __metadata("design:paramtypes", [markets_service_1.MarketsService])
], MarketsController);
//# sourceMappingURL=markets.controller.js.map