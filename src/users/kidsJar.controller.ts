import {
  Controller,
  Get,
  Query,
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
import {
  JarsSummaryOutputResponseDto,
  JarsTransactionsOutputResponseDto,
  JarTransactionsDto,
} from './dto/kidJar.dto';
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

  @Get('transactions')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Fetch transactions for each jar',
    description: 'Get all the transactions for each type of jar of a kid.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true,
  })
  @ApiOkResponse({
    type: JarsTransactionsOutputResponseDto,
  })
  async getJarTransactions(
    @Param('userId') userId: string,
    @Query() transactionsFilter: JarTransactionsDto,
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
      let result;
      for (let key in jars) {
        if (transactionsFilter.jar.toUpperCase() === key.toUpperCase()) {
          let transactions = await this.usersService.kidJarTransactions(
            paymentUserId,
            jars[key],
            transactionsFilter,
          );
          result = transactions;
        }
      }
      let { pageSize, pageId } = transactionsFilter;
      let startIndex = (pageId - 1) * pageSize;
      let endIndex = pageId * pageSize;
      let finalTransactions = result.slice(startIndex, endIndex);
      return res.success(finalTransactions);
    } else {
      return res.success(userDetail, 'No user found.');
    }
  }
}
