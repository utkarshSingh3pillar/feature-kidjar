import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from 'src/users/users.service';
import _ = require('lodash');
const config = require('@tsmx/secure-config');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${config.AWS.region}.amazonaws.com/${config.Cognito.userPoolId}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: config.Cognito.clientId,
      issuer: `https://cognito-idp.${config.AWS.region}.amazonaws.com/${config.Cognito.userPoolId}`,
      algorithms: ['RS256'],
    });
  }

  public async validate(payload: any) {
    //return !!payload.sub;

    let userId = payload.sub;
    let user = await this.userService.findOne(userId);

    if (user.parentId) {/// child account
      return {
        userId: user.userId,
        parentId: user.parentId,
        paymentDocumentId: user.paymentDocumentId,
        paymentUserId: user.paymentUserId,
        spendAccountId: user.spendAccountId,
        shareAccountId: user.shareAccountId,
        saveAccountId: user.saveAccountId
      }
    }
    else {// for parent account

      return {
        userId: user.userId,
        parentId: user.parentId,
        paymentDocumentId: user.paymentDocumentId,
        paymentUserId: user.paymentUserId,
        achAccountId: user.achAccountId,
        submembers: user.subMembers.map(user => _.pick(user, ['userId', 'parentId', 'paymentDocumentId', 'paymentUserId', 'spendAccountId', 'shareAccountId', 'saveAccountId']))
      }
    }

    return {
      userId: payload.sub,
    };
  }
}
