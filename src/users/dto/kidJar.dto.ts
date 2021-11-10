
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";
import { GoalStatus, UserGoal } from '../entities/usergoal.entity';
import { User } from '../entities/user.entity';
import { GoalsCategory } from '../entities/category.entity';


export class JarSummaryOutputResponse {
  
    @ApiProperty()
    name: string;
  
    @ApiProperty()
    amount: number;
  }
  
  
  export class JarsSummaryOutputResponseDto {
    @ApiProperty()
    public data: JarSummaryOutputResponse;
    @ApiProperty()
    message: string;
  }