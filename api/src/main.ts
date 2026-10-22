import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./presentation/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // FRONTEND_URL があればそこだけ許可する。無ければ全許可（開発・まだURLが無い段階）。
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({ origin: frontendUrl ?? true });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`pickup-planner api: http://localhost:${port}`);
}

bootstrap();
