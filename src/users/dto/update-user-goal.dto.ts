import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";
import { GoalStatus, UserGoal } from '../entities/usergoal.entity';
import { User } from '../entities/user.entity';
import { GoalsCategory } from '../entities/category.entity';

export class UpdateUserGoalDto {


  @ApiPropertyOptional({
    description: 'name of the goal',
    format: 'string'
  })
  @Transform((value) => value.value?.trim())
  @IsNotEmpty({ message: "Enter a valid goal name." })
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'id of the category',
    format: 'string'
  })
  @Transform((value) => value.value?.trim())
  @IsNotEmpty({ message: "Enter a valid category id." })
  @IsOptional()
  categoryId: string;


  @ApiPropertyOptional({
    description: 'type of the goal',
    format: 'string'
  })
  @Transform((value) => value.value?.trim())
  @IsNotEmpty({ message: "Enter a valid type." })
  @IsOptional()
  type: string;


  @ApiPropertyOptional({
    description: 'target date to achieve the goal',
    format: 'string'
  })
  @IsOptional()
  @IsNotEmpty({ message: "Enter a target date." })
  @Transform((value) => value.value?.trim())
  targetDate: string;

  @ApiPropertyOptional({
    description: 'amount for the goal',
    format: 'number'
  })
  @ValidateIf(c => c.amount != null && c.amount > 0)
  @IsNotEmpty({ message: 'Enter a valid amount.' })
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }, { message: "Enter a valid amount." })
  @IsOptional()
  amount: number;

  // @ApiPropertyOptional({
  //   description: 'completion date of the goal for the user',
  //   format: 'string'
  // })
  // @Transform((value) => value.value?.trim())
  // @IsNotEmpty({ message: "Enter a valid completion date." })
  // @IsOptional()
  // completionDate: string;

}



export class GoalOutputResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  targetDate: string;

  @ApiProperty()
  completionDate: string

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  lastUpdated: string;

  @ApiProperty()
  category: GoalsCategory
}


export class GoalsOutputResponseDto {
  @ApiProperty({
    isArray: true
  })
  public data: GoalOutputResponse;
  @ApiProperty()
  message: string;
}

export class GoalOutputResponseDto {
  @ApiProperty()
  public data: GoalOutputResponse;
  @ApiProperty()
  message: string;
}

export class UpdateGoalOutputResponseDto {

  @ApiProperty()
  data: UserGoal;

  @ApiProperty()
  message: string;

}

export class DeleteGoalResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  status: GoalStatus
}
export class DeleteGoalOutputResponseDto {
  @ApiProperty()
  message: string;
}

export class CategoriesOutputResponseDto {
  @ApiProperty({
    isArray: true
  })
  public data: GoalsCategory;
  @ApiProperty()
  message: string;
}

