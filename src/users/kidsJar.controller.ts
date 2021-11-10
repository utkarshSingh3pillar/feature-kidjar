import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'src/core';
import { JarsSummaryOutputResponseDto } from './dto/kidJar.dto';
import { UsersService } from './users.service';

@ApiTags('jar')
@Controller('v1/users/:userId/jars')
export class KidjarController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Fetch all jars balance',
    description: 'Get all the jar balance of a kid.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true,
  })
  @ApiOkResponse({
    type: JarsSummaryOutputResponseDto,
  })
  async getJars(
    @Param('userId') userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let userDetail = await this.usersService.findOne(req.user.userId);
    if (userDetail) {
      let {
        paymentUserId,
        spendAccountId,
        shareAccountId,
        saveAccountId,
      } = userDetail;
      let jars = {
        spend: spendAccountId,
        share: shareAccountId,
        save: saveAccountId,
      };
      for (let key in jars) {
        let account = await this.usersService.kidJarSummary(
          paymentUserId,
          jars[key],
        );
        jars[key] = account;
      }
      return res.success(jars);
    } else {
      return res.success(userDetail, 'No user found.');
    }
  }
}
