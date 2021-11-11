import { SynapseUserAccountsService } from './../synapse/services/user.accounts';
import { SynapseUserService } from './../synapse/services/user';
import { AuthService } from './../auth/auth.service';
import { JwtStrategy } from './../core/jwt/jwt.strategy';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PassportModule } from '@nestjs/passport';
import { UserDbRepository } from 'src/shared/DB/users/UserDbRepository';
import { UserGoalsController } from './usergoals.controller';
import { UserGoalsDbRepository } from 'src/shared/DB/users/UserGoalsDbRepository';
import { UsersReferralsController } from './controllers/users.referrals.controller';
import { UsersReferralService } from './services/users.referral.service';
import { UserReferralDbRepository } from 'src/shared/DB/users/UserReferralDbRepository';
import { KidjarController } from './kidsJar.controller';
import {UserTranscations} from './../synapse/services/user.transcations'

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [UsersController, UserGoalsController, UsersReferralsController,KidjarController],
  providers: [AuthService, UsersService, JwtStrategy, UsersReferralService, UserDbRepository, UserReferralDbRepository,
    UserGoalsDbRepository, SynapseUserService, SynapseUserAccountsService,UserTranscations]
})
export class UsersModule { }
