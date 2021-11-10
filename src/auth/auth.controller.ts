import { isMobilePhone } from 'class-validator';
import {
  BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiHeader, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags
} from '@nestjs/swagger';
import { isEmail } from 'class-validator';
import jwt_decode from 'jwt-decode';
import { Request, Response } from 'src/core';
import { ErrorOutputResponseDto } from 'src/shared/dto/error.response.dto';
import { UserStatus } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ConfirmPasswordDto, ConfirmPasswordOutputResponseDto, CreateForgotPasswordDto, CreateForgotPasswordOutputResponseDto, CreateResetKidPasswordDto, SetPasswordForKidsWOEmailPhoneDto } from './dto/create-forgot-password.dto';
import { AutoVerifyRegisterRequestDto, ConfirmRegistrationDto, ConfirmRegistrationOutputResponseDto, KidsRegistrationOutputResponseDto, LoginOutputResponseDto, LoginRequestDto, LoginResponseDto, RefreshAccessTokenDto, RefreshAccessTokenOutputResponseDto, RegisterKidRequestDto, RegistrationOutputResponseDto, RegistrationRequestDto, RegistrationResponseDto, RequestRegistrationRequestDto, ResendConfirmRegistrationCodeDto } from './dto/index';

import moment = require('moment');
const config = require('@tsmx/secure-config');

//  localhost:3000/auth/register
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UsersService) {
  }

  @Get('78af75fa-283b-4008-845a-b67e423f4714/api/config')
  @ApiExcludeEndpoint()
  getConfig(@Req() req: Request, @Res() res: Response) {
    return res.json(config);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user', description: 'Register a new user to Gravy Stacks' })
  @ApiCreatedResponse({
    description: 'User is registered in Pending state.',
    type: RegistrationOutputResponseDto,
  })
  async register(
    @Body() registerRequestDto: RegistrationRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    ValidateRegister(registerRequestDto);
    const response: any = await this.authService.registerUser(registerRequestDto);
    const resigrationRes: RegistrationResponseDto = {
      username: registerRequestDto.username,
      codeDeliveryDetails: {
        deliveryMedium: response.codeDeliveryDetails.DeliveryMedium,
        destination: response.codeDeliveryDetails.Destination
      },
      userId: response.userSub,
      userStatus: UserStatus.PENDING
    };
    return res.success(resigrationRes, "Your account is successfully registered.");
  }

  @Post('resend-verify-code')
  @ApiOperation({ summary: 'Resend Verify Code', description: 'Resend verification Code' })
  @ApiOkResponse({
    type: ConfirmRegistrationOutputResponseDto
  })
  async resendVerifyCode(
    @Body() resendConfirmRegisterCodeRequest: ResendConfirmRegistrationCodeDto,
    @Req() req: Request, @Res() res: Response
  ) {
    const result = await this.authService.resendVerifyCode(resendConfirmRegisterCodeRequest);
    return res.success(result, "Confirmation code sent successfully.");
  }

  @Post('confirm-register')
  @ApiOperation({ summary: 'Confirm Register User', description: 'Confirm Register User via verification Code' })
  @ApiCreatedResponse({
    type: ConfirmRegistrationOutputResponseDto
  })
  async confirmRegister(
    @Body() confirmRegisterRequest: ConfirmRegistrationDto,
    @Req() req: Request, @Res() res: Response
  ) {
    confirmRegisterRequest.ipAddress = req.ip;
    const result = await this.authService.confirmRegistration(confirmRegisterRequest);
    return res.success(null, "Your account is successfully registered.");
  }

  @Post('login')
  @ApiOperation({ summary: 'Login User', })
  @ApiOkResponse({
    description: 'Logged in User Info',
    type: LoginOutputResponseDto,
  })
  //@UsePipes(new CustomValidationPipe())
  async login(@Body() authenticateRequest: LoginRequestDto,
    @Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      let result = await this.authService.authenticateUser(authenticateRequest);
      return res.success(result);
    } catch (error) {
      if (error?.response?.code == 'UserNotConfirmedException') {
        let finalResult = {
          code: '1000',
          message: error?.response?.description,
          errors: [error?.response?.message],
        };
        return res.status(400).send(finalResult);
      }
      throw error;
    }
  }

  @Post('refresh-access-token')
  @ApiOperation({ summary: 'Refresh Access Token', })
  @ApiOkResponse({
    type: RefreshAccessTokenOutputResponseDto
  })
  @ApiInternalServerErrorResponse({
    description: "Error Response",
    type: ErrorOutputResponseDto
  })
  async refreshAccessToken(@Body() refreshAccessTokenDto: RefreshAccessTokenDto,
    @Req() req: Request, @Res() res: Response
  ) {
    return res.success(await this.authService.refreshAccessToken(refreshAccessTokenDto));
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password', })
  @ApiOkResponse({
    type: CreateForgotPasswordOutputResponseDto
  })
  async forgotPassword(@Body() createForgotPasswordDto: CreateForgotPasswordDto,
    @Req() req: Request, @Res() res: Response
  ) {
    return res.success(await this.authService.forgotPassword(createForgotPasswordDto));
  }


  @Post('reset-kid-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset Kid password', })
  @ApiOkResponse({
    type: CreateForgotPasswordOutputResponseDto
  })
  async resetKidPassword(@Body() setForgotPasswordDto: SetPasswordForKidsWOEmailPhoneDto,
    @Res() res: Response
  ) {
    let result = await this.authService.setPasswordForKidsWOEmailPhone(setForgotPasswordDto);
    if (result)
      return res.success(null, "Good to go. Let your kid know their new password.");
  }

  @Post('confirm-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password', })
  @ApiOkResponse({
    type: ConfirmPasswordOutputResponseDto
  })
  async confirmPassword(@Body() confirmPasswordDto: ConfirmPasswordDto,
    @Req() req: Request, @Res() res: Response
  ) {
    await this.authService.confirmPassword(confirmPasswordDto)
    return res.success(null, "Password change successfully.");
  }

  @Post('register-childaccount')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOperation({ summary: 'Register Kids Account', description: 'Register a new kids user to Gravy Stacks' })
  @ApiCreatedResponse({
    description: 'Kids user is registered in Pending state.',
    type: KidsRegistrationOutputResponseDto,
  })
  async registerKidsAccount(
    @Body() registerChildRequest: RegisterKidRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    if (!moment(registerChildRequest.birthDate).isValid()) {
      throw new BadRequestException({
        message: 'Enter the valid Birth Date.',
        description: 'Bad Request'
      });
    }
    if (isEmail(registerChildRequest.username)) {
      throw new BadRequestException({
        message: 'Username cannot be of email format.',
        description: 'Bad Request'
      });
    }
    if (isMobilePhone(registerChildRequest.username)) {
      throw new BadRequestException({
        message: 'Username cannot be of phone number format.',
        description: 'Bad Request'
      });
    }

    if (moment().diff(registerChildRequest.birthDate, 'years', true) > 18 ||
      moment().diff(registerChildRequest.birthDate, 'years', true) < 0) {
      throw new BadRequestException({
        message: 'Age should be less than 18 years.',
        description: 'Bad Request'
      });
    }
    return res.success(await this.registerForChild(registerChildRequest, req, res), "Account created successfully.");
  }

  async registerForChild(@Body() registerChildRequest: RegisterKidRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    const jwt = req.headers['authorization'].replace('Bearer ', '');
    const user: any = jwt_decode(jwt);
    registerChildRequest.parentId = user.sub;
    registerChildRequest.ipAddress = req.ip;
    return await this.authService.registerKidsAccount(registerChildRequest, req.user.paymentUserId);
  }

  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOperation({ summary: 'User Sign out', description: 'User Sign out' })
  @ApiOkResponse()
  @ApiExcludeEndpoint()
  async logOut(@Req() req: Request, @Res() res: Response) {
    const jwt = req.headers['authorization'].replace('Bearer ', '');
    const user: any = jwt_decode(jwt);
    return res.success(await this.authService.logOut({ username: user['cognito:username'] }), "Logout successfully.");
  }

  @Post('kid-signup-request')
  @ApiOperation({ summary: 'Request from kid to signup', description: 'request from kid to signup' })
  @ApiCreatedResponse({
    description: 'Request is forwarded to the parent.',
    type: RegistrationOutputResponseDto,
  })
  async kidSignUpRequest(
    @Body() requestRegisterRequestDto: RequestRegistrationRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    await this.userService.forwardSignUpRequest(requestRegisterRequestDto).then(response => {
      return res.success(null, "Your request has been sent to your parent!");
    });
  }

  @Post('link-bankAccount')
  async linkBankAccount(@Body() linkBankAccInfoRequest: any,
    @Req() req: Request, @Res() res: Response) {
    await this.authService.linkBankAccount("94f7d2f6-e744-4560-aed5-fbe787aa633b", "618902c1bcaadc33b680ea6d").then(response => {
      return res.success(null, "Your bank account is linked successfully.");
    });
  }

  //====================== Admin ============================================================
  @Post('autoverify-user')
  @ApiExcludeEndpoint()
  async autoVerifyUser(@Body() autoverifyUserRequest: AutoVerifyRegisterRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    return res.success(await this.authService.autoVerifyUser(autoverifyUserRequest));
  }

  @Post('autoverify-phone')
  @ApiExcludeEndpoint()
  async autoVerifyUserPhone(@Body() autoverifyUserRequest: AutoVerifyRegisterRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    var body = req.all();
    return res.success(await this.authService.autoverifiedPhoneNumber({ username: autoverifyUserRequest.username }));
  }

  @Post('autoverify-email')
  @ApiExcludeEndpoint()
  async autoVerifyUserEmail(@Body() autoverifyUserRequest: AutoVerifyRegisterRequestDto,
    @Req() req: Request, @Res() res: Response
  ) {
    var body = req.all();
    return res.success(await this.authService.autoverifiedEmailAttribute({ username: autoverifyUserRequest.username }));
  }

}
function ValidateRegister(registerRequestDto: RegistrationRequestDto) {
  if (!moment(registerRequestDto.birthDate).isValid()) {
    throw new BadRequestException({
      message: 'Enter the valid Birth Date.',
      description: 'Bad Request'
    });
  }
  if (isEmail(registerRequestDto.username)) {
    throw new BadRequestException({
      message: 'Username cannot be of email format.',
      description: 'Bad Request'
    });
  }
  if (isMobilePhone(registerRequestDto.username)) {
    throw new BadRequestException({
      message: 'Username cannot be of phone number format.',
      description: 'Bad Request'
    });
  }

  if (moment().diff(registerRequestDto.birthDate, 'years', true) <= 18 ||
    moment().diff(registerRequestDto.birthDate, 'years', true) >= 100 ||
    moment().diff(registerRequestDto.birthDate, 'years', true) < 0) {
    throw new BadRequestException({
      message: 'Age should be between 18 to 100 Years.',
      description: 'Bad Request'
    });
  }
}

