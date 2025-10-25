import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Pop Post Analyzer API')
    .setDescription('AI-powered post analysis for market generation')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('post-analyzer', 'AI-powered post analysis for market generation')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3001}`,
  );
  console.log(
    `📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3001}/api`,
  );
}
bootstrap();
