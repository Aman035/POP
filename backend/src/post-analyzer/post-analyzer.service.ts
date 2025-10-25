import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export interface MarketAnalysis {
  question: string;
  options: [string, string];
  category: string;
  confidence: number;
}

export interface PostAnalysisRequest {
  content: string;
  source: string;
  postId: string;
}

@Injectable()
export class PostAnalyzerService {
  private readonly logger = new Logger(PostAnalyzerService.name);
  private openai: OpenAI | null = null;
  private groqOpenai: OpenAI | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.logger.log('OpenAI provider initialized');
    }

    // Initialize Groq using OpenAI-compatible API if API key is provided
    if (process.env.GROQ_API_KEY) {
      this.groqOpenai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      this.logger.log('Groq provider initialized (via OpenAI SDK)');
    }

    if (!this.openai && !this.groqOpenai) {
      this.logger.warn(
        'No LLM providers configured. Set OPENAI_API_KEY or GROQ_API_KEY environment variables.',
      );
    }
  }

  async analyzePost(request: PostAnalysisRequest): Promise<MarketAnalysis> {
    const { content, source, postId } = request;

    this.logger.log(`Analyzing post ${postId} from ${source}`);

    try {
      // Try Groq first (faster and cheaper), fallback to OpenAI
      if (this.groqOpenai) {
        return await this.analyzeWithGroq(content);
      } else if (this.openai) {
        return await this.analyzeWithOpenAI(content);
      } else {
        throw new Error('No LLM providers available');
      }
    } catch (error) {
      this.logger.error(`Failed to analyze post ${postId}:`, error);
      throw error;
    }
  }

  private async analyzeWithGroq(content: string): Promise<MarketAnalysis> {
    if (!this.groqOpenai) {
      throw new Error('Groq provider not initialized');
    }

    const prompt = this.buildPrompt(content);

    const completion = await this.groqOpenai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing social media posts and creating prediction markets. Always respond with valid JSON.',
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

  private async analyzeWithOpenAI(content: string): Promise<MarketAnalysis> {
    if (!this.openai) {
      throw new Error('OpenAI provider not initialized');
    }

    const prompt = this.buildPrompt(content);

    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing social media posts and creating prediction markets. Always respond with valid JSON.',
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

  private buildPrompt(content: string): string {
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

  private parseResponse(response: string): MarketAnalysis {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (!parsed.question || !parsed.options || !parsed.category) {
        throw new Error('Invalid response structure');
      }

      if (!Array.isArray(parsed.options) || parsed.options.length !== 2) {
        throw new Error('Options must be an array with exactly 2 elements');
      }

      if (
        typeof parsed.confidence !== 'number' ||
        parsed.confidence < 0 ||
        parsed.confidence > 1
      ) {
        parsed.confidence = 0.5; // Default confidence
      }

      return {
        question: parsed.question.trim(),
        options: [parsed.options[0].trim(), parsed.options[1].trim()],
        category: parsed.category.trim(),
        confidence: parsed.confidence,
      };
    } catch (error) {
      this.logger.error('Failed to parse LLM response:', error);
      throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }
}
