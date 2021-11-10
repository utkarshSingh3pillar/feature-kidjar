import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiPayloadTooLargeResponse, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { JwtAuthGuard } from 'src/core/jwt/jwt-auth.guard';
import { Request, Response } from 'src/core';
import { imageFileFilter, maxFileSize } from 'src/shared/utils/file-upload.utils';
import { FileUploadDto, FileUploadOutputResponseDto } from './dto/file-upload.dto';
import { GetUserPreferencesOutputResponseDto, JarSettingsDto, UpdateJarSettingsOutputResponseDto } from './dto/jar-value.dto';
import { UserOutputResponseDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get User', description: 'Fetch user by User Id.' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token we need for auth.',
  })
  @ApiOkResponse({
    type: UserOutputResponseDto
  })

  async getUser(@Param('userId') userId: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    return res.success(await this.usersService.findOne(req.user.userId));
  }

  @Post(':userId/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload Avatar', description: 'Upload user avatar.' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiBody({
    description: 'image',
    type: FileUploadDto,
  })
  @ApiPayloadTooLargeResponse({
    description: 'File too large'
  })
  @ApiBadRequestResponse({
    description: 'File format not supported. You can only upload .jpeg or .png files.'
  })
  @ApiCreatedResponse({
    description: 'Your photo is uploaded successfully.',
    type: FileUploadOutputResponseDto
  })
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter, limits: { fileSize: maxFileSize } }))
  async uploadAvatar(@Param('userId') userId: string, @UploadedFile() image: Express.Multer.File,
    @Res() res: Response,
    @Req() req: Request
  ) {
    if (image == undefined) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'File not found.',
        description: 'Bad Request'
      });
    }
    var path = require('path');
    var extName = path.extname(image.originalname);
    const result = await this.usersService.addAvatar(req.user.userId, image.buffer, `profile${extName}`);
    if (result) {
      return res.success(null, "Your photo is uploaded successfully.");
    }
  }

  @Get(':userId/preferences')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get User Preferences', description: '' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOkResponse({ type: GetUserPreferencesOutputResponseDto })
  async getUserPreferences(@Param('userId') userId: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    return res.success(await this.usersService.getPreferences(req.user.userId));
  }

  @Post(':userId/jarSettings')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update Jar Settings', description: '' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiCreatedResponse({
    type: UpdateJarSettingsOutputResponseDto
  })
  async updateJarSettings(@Param('userId') userId: string,
    @Body() jarBucketSettings: JarSettingsDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const isValidatedJarSettings = this.validateJarSettings(jarBucketSettings);
    if (!isValidatedJarSettings) {
      throw new BadRequestException({
        statusCode: 400,
        message: "The total of jars percentage should be 100%",
        description: "Bad Request"
      })
    }
    const result = await this.usersService.updateJarValues(req.user.userId, jarBucketSettings);
    if (result) {
      return res.success(null, "Jar settings saved successfully.");
    };

  }

  validateJarSettings(jarBucketSettings: JarSettingsDto) {
    if ((jarBucketSettings.save) + (jarBucketSettings.share) + (jarBucketSettings.spend) != 100) {
      return false;
    }
    if ((jarBucketSettings.save) < 5 || (jarBucketSettings.spend) < 5) {
      return false;
    }
    else {
      return true;
    }
  }

}
