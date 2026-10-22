import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./presentation/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // web/（別ポート、別オリジン）から呼べるようにする
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`pickup-planner api: http://localhost:${port}`);
}

bootstrap();
