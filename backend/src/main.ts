import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

type Server = ((request: unknown, response: unknown) => unknown) & {
  listen: (port: string | number, callback: () => void) => void;
};

let server: Server | undefined;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL ?? true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return app.getHttpAdapter().getInstance() as Server;
}

export default async function handler(request: unknown, response: unknown) {
  server ??= await bootstrap();
  return server(request, response);
}

module.exports = handler;
module.exports.default = handler;

if (!process.env.VERCEL) {
  void bootstrap().then((localServer) => {
    server = localServer;
    return new Promise<void>((resolve) => {
      localServer.listen(process.env.PORT ?? 3000, resolve);
    });
  });
}
