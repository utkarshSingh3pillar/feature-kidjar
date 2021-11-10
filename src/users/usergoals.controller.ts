import { JwtStrategy } from './../core/jwt/jwt.strategy';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'src/core';
import { CreateGoalOutputResponseDto, CreateUserGoalDto } from './dto/create-user-goal.dto';
import {
  CategoriesOutputResponseDto,
  DeleteGoalOutputResponseDto,
  GoalOutputResponseDto,
  GoalsOutputResponseDto,
  UpdateGoalOutputResponseDto,
  UpdateUserGoalDto,
} from './dto/update-user-goal.dto';
import { UsersService } from './users.service';


@ApiTags('goals')
@Controller('v1/users/:userId/goals')
export class UserGoalsController {
  constructor(private readonly usersService: UsersService,
    private readonly jwtStrategy: JwtStrategy
    ) { }


  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Fetch all User Goals', description: 'Get all the goals of a user.' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOkResponse({
    type: GoalsOutputResponseDto
  })
  async getGoals(@Param('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    let goals = await this.usersService.findUserGoals(req.user.userId);
    if (goals.length > 0)
      return res.success(goals, "User goals fetched successfully.");
    else {
      return res.success(goals, "No user goals found.");
    }
  }



  @Get('categories')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Fetch all categories', description: 'Get all the categories.' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOkResponse({
    type: CategoriesOutputResponseDto
  })
  async getCategories(@Res() res: Response) {
    let categories = await this.usersService.getAllCategories();
    if (categories.length > 0)
      return res.success(categories, "Categories fetched successfully.");
    else {
      return res.success(categories, "No category found.");
    }
  }

  @Get(':goalId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Fetch Specific User Goal', description: 'Get the details of goal by ID' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOkResponse({
    type: GoalOutputResponseDto
  })
  async getGoalDetails(@Param('userId') userId: string, @Param('goalId') goalId: string, @Res() res: Response) {
    const result = await this.usersService.findOneGoal(goalId);
    if (result) {      
      res.success(result, "Goal fetched successfully", 200);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create User Goal', description: 'creates a user goal.' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiCreatedResponse({
    description: 'Goal created successfully.',
    type: CreateGoalOutputResponseDto
  })
  async create(@Param('userId') userId: string, @Body() createUserGoalDto: CreateUserGoalDto, @Req() req: Request,
  @Res() res: Response
  ) {
    createUserGoalDto.userId = req.user.userId;
    let isCatExist = await this.usersService.isCategoryExist(createUserGoalDto.categoryId);
    if(!isCatExist){
      throw new BadRequestException({"message": "Category for given id doesn't exist." })
    }
    this.usersService.validateModel(createUserGoalDto, false);
    const result = await this.usersService.createUserGoal(createUserGoalDto);
    if (result) {
      res.success(result, "Goal created successfully", 201);
    }
    else {
      return res.error("Goal not found.", 404);
    }
  }

  @Put(':goalId')
  @ApiOperation({ summary: 'Update User Goal', description: 'updates a user goal.' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiOkResponse({
    description: 'Goal updated successfully.',
    type: UpdateGoalOutputResponseDto
  })
  async update(@Param('userId') userId: string, @Param('goalId') goalId: string,
    @Body() updateUserGoalDto: UpdateUserGoalDto, @Res() res: Response
  ) {
    if(updateUserGoalDto.categoryId != undefined || updateUserGoalDto.categoryId != null){
    let isCatExist = await this.usersService.isCategoryExist(updateUserGoalDto.categoryId);
    if(!isCatExist){
      throw new BadRequestException({"message": "Category for given id doesn't exist." })
    }
  }
    this.usersService.validateModel(updateUserGoalDto, true);
    const result = await this.usersService.updateUserGoal(updateUserGoalDto, goalId);
    if (result) {
      return res.success(result, "Goal updated successfully.", 200);
    }
    else {
      return res.error("Goal not found.", 404);
    }
  }

  @Delete(":goalId")
  @ApiOperation({ summary: 'Delete User Goal', description: 'deletes a user goal.' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Bearer',
    description: 'the token we need for auth.',
    required: true
  })
  @ApiNoContentResponse({
    description: 'Goal deleted successfully.',
    type: DeleteGoalOutputResponseDto
  })
  async delete(@Param('userId') userId: string, @Param('goalId') goalId: string, @Res() res: Response
  ) {
    const result = await this.usersService.deleteUserGoal(goalId);
    if (result) {
      return res.success(result, "Goal deleted successfully.", 200);
    }
    else {
      return res.error("Goal not found.", 404);
    }
  }

}
