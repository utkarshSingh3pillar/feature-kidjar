import { Body, Controller, Param, Post, Req, Res, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'src/core';
import { CreateUserReferralDto, SearchUserReferralDto, UserReferralDto, UserReferralResponseDto } from '../dto/referral/create-user-referral.dto';
import { UsersReferralService } from '../services/users.referral.service';


@ApiTags('referrals')
@Controller('v1/users/:userId/referrals')
export class UsersReferralsController {
    constructor(private readonly usersReferralService: UsersReferralService) { }

    @Post()
    @ApiOperation({ summary: 'Create User Referral', description: 'creates a user referral.' })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.',
        required: true
    })
    @ApiCreatedResponse({
        description: 'Referral created successfully.',
    })
    async create(@Param('userId') userId: string,
        @Body() createUserReferralDto: CreateUserReferralDto,
        @Res() res: Response,
        @Req() req: Request
    ) {
        createUserReferralDto.senderUserId = req.user.userId;
        res.success(await this.usersReferralService.createUserReferral(createUserReferralDto), "Referral created successfully");
    }


    @Post('/search')
    @ApiOperation({ summary: 'Search User Referral', description: 'search a user referral.' })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.',
        required: true
    })
    @ApiOkResponse({
        type: UserReferralResponseDto,
    })
    async search(@Param('userId') userId: string,
        @Body() searchUserReferralDto: SearchUserReferralDto,
        @Res() res: Response,
        @Req() req: Request
    ) {
        const result = await this.usersReferralService.searchPhoneReferrals(searchUserReferralDto);
        res.success(result, result.length > 0 ? "" : "No referrals found.");
    }

    @Get('/')
    @ApiOperation({ summary: 'Fetch User Referrals', description: 'Fetch user referrals.' })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiHeader({
        name: 'Bearer',
        description: 'the token we need for auth.',
        required: true
    })
    @ApiOkResponse({
        type: UserReferralResponseDto,
    })
    async getReferrals(@Param('userId') userId: string,
        @Res() res: Response,
        @Req() req: Request
    ) {
        const result = await this.usersReferralService.findUserReferrals(req.user.userId);
        res.success(result, result.length > 0 ? "" : "No referrals found.");
    }
}