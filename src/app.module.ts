import { ContentModule } from './contentful/content.module';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ContentModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
