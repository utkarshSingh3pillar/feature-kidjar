

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import conf = require('@tsmx/secure-config');
import { AppModule } from './app.module';
import { DocSetupUtility } from './shared/utils/apidocsetup'
import * as helmet from 'helmet';
import * as csurf from 'csurf';
import { ValidationPipe } from '@nestjs/common';
import { ExceptionFilter, RequestGuard } from './core';
import { TrimPipe } from './core/http/trimpipe';
// import 'dotenv/config';

global['fetch'] = require('node-fetch');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true, bodyParser: true });

  await DocSetupUtility.apidocsetup(app);

  // Constants
  const PORT = conf.env.PORT;
  const HOST = conf.env.HOST;

  app.use(helmet());
  //app.use(csurf());
  app.useGlobalPipes(new ValidationPipe({ transform: true, validateCustomDecorators: true }));

  // guards
  app.useGlobalGuards(new RequestGuard());

  app.useGlobalPipes(new TrimPipe());

  // filters
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionFilter(httpAdapter));

  app.listen(PORT, HOST);

}

bootstrap();

