"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Pop Prediction Markets API')
        .setDescription('API for managing prediction markets and posts')
        .setVersion('1.0')
        .addTag('health', 'Health check endpoints')
        .addTag('markets', 'Prediction market operations')
        .addTag('posts', 'Post management')
        .addTag('tweet-analyzer', 'AI-powered tweet analysis for market generation')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT ?? 3001);
    console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3001}`);
    console.log(`📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3001}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map