import { SynapseUserAccountsService } from './../synapse/services/user.accounts';
import { SynapseUserService } from './../synapse/services/user';
import { ContentService } from './../contentful/services/content.services';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../core/jwt/jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { UserDbRepository } from 'src/shared/DB/users/UserDbRepository';
import { UserGoalsDbRepository } from 'src/shared/DB/users/UserGoalsDbRepository';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, JwtStrategy, UsersService, UserDbRepository, UserGoalsDbRepository, ContentService, SynapseUserService, SynapseUserAccountsService],
  controllers: [AuthController],
})
export class AuthModule { }
