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
var TweetAnalyzerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
let TweetAnalyzerService = TweetAnalyzerService_1 = class TweetAnalyzerService {
    constructor() {
        this.logger = new common_1.Logger(TweetAnalyzerService_1.name);
        this.openai = null;
        this.groqOpenai = null;
        this.initializeProviders();
    }
    initializeProviders() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
            this.logger.log('OpenAI provider initialized');
        }
        if (process.env.GROQ_API_KEY) {
            this.groqOpenai = new openai_1.default({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: 'https://api.groq.com/openai/v1',
            });
            this.logger.log('Groq provider initialized (via OpenAI SDK)');
        }
        if (!this.openai && !this.groqOpenai) {
            this.logger.warn('No LLM providers configured. Set OPENAI_API_KEY or GROQ_API_KEY environment variables.');
        }
    }
    async analyzeTweet(request) {
        const { content, source, postId } = request;
        this.logger.log(`Analyzing tweet ${postId} from ${source}`);
        try {
            if (this.groqOpenai) {
                return await this.analyzeWithGroq(content);
            }
            else if (this.openai) {
                return await this.analyzeWithOpenAI(content);
            }
            else {
                throw new Error('No LLM providers available');
            }
        }
        catch (error) {
            this.logger.error(`Failed to analyze tweet ${postId}:`, error);
            throw error;
        }
    }
    async analyzeWithGroq(content) {
        if (!this.groqOpenai) {
            throw new Error('Groq provider not initialized');
        }
        const prompt = this.buildPrompt(content);
        const completion = await this.groqOpenai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at analyzing social media posts and creating prediction markets. Always respond with valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 500,
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from Groq');
        }
        return this.parseResponse(response);
    }
    async analyzeWithOpenAI(content) {
        if (!this.openai) {
            throw new Error('OpenAI provider not initialized');
        }
        const prompt = this.buildPrompt(content);
        const completion = await this.openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at analyzing social media posts and creating prediction markets. Always respond with valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'gpt-4o-mini',
            temperature: 0.7,
            max_tokens: 500,
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from OpenAI');
        }
        return this.parseResponse(response);
    }
    buildPrompt(content) {
        return `
Analyze this social media post and create a prediction market for it.

Post content: "${content}"

Create a prediction market with:
1. A clear, specific question that can be answered with Yes/No or two clear options
2. Two mutually exclusive options (Yes/No or two specific outcomes)
3. A relevant category (e.g., "Technology", "Politics", "Sports", "Entertainment", "Business", "Science", "Social", "Other")

Guidelines:
- The question should be specific and measurable
- Options should be mutually exclusive and exhaustive
- Focus on verifiable outcomes
- Avoid subjective or opinion-based questions
- Make it interesting and engaging for prediction

Respond with ONLY valid JSON in this exact format:
{
  "question": "Will [specific outcome] happen?",
  "options": ["Yes", "No"],
  "category": "Technology",
  "confidence": 0.85
}

The confidence should be between 0 and 1, representing how suitable this post is for a prediction market.
`;
    }
    parseResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            if (!parsed.question || !parsed.options || !parsed.category) {
                throw new Error('Invalid response structure');
            }
            if (!Array.isArray(parsed.options) || parsed.options.length !== 2) {
                throw new Error('Options must be an array with exactly 2 elements');
            }
            if (typeof parsed.confidence !== 'number' ||
                parsed.confidence < 0 ||
                parsed.confidence > 1) {
                parsed.confidence = 0.5;
            }
            return {
                question: parsed.question.trim(),
                options: [parsed.options[0].trim(), parsed.options[1].trim()],
                category: parsed.category.trim(),
                confidence: parsed.confidence,
            };
        }
        catch (error) {
            this.logger.error('Failed to parse LLM response:', error);
            throw new Error(`Failed to parse LLM response: ${error.message}`);
        }
    }
};
exports.TweetAnalyzerService = TweetAnalyzerService;
exports.TweetAnalyzerService = TweetAnalyzerService = TweetAnalyzerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TweetAnalyzerService);
//# sourceMappingURL=tweet-analyzer.service.js.map