import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
// import { HttpExceptionFilter } from './error/error.filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("SmallinURL")
    .setDescription("Shorten Your Long URL")
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
      const openApiSpec = fs.readFileSync(path.join("/home/detarune/project/url-shortener/", 'openapi-spec.json'), 'utf8');
  
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup("api", app, document)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(JSON.parse(openApiSpec)));
  app.use(cookieParser());

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials:true
  });

  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true, 
        forbidNonWhitelisted: true, 
        transform: true, 
    })
);
// app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();