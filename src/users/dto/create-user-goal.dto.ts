import { GoalStatus, UserGoal } from './../entities/usergoal.entity';
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateIf } from "class-validator";
import { type } from 'os';

export class CreateUserGoalDto {

    @ApiProperty({
        description: 'name of the goal',
        format: 'string'
    })
    @IsNotEmpty({ message: "Enter a valid Goal Name." })
    @Transform((value) => value.value?.trim())
    name: string;


    @ApiProperty({
        description: 'id of the category',
        format: 'string'
    })
    @IsNotEmpty({ message: "Enter a valid category id." })
    @Transform((value) => value.value?.trim())
    categoryId: string;

    @ApiProperty({
        description: 'type of the goal',
        format: 'string'
    })
    @IsNotEmpty({ message: "Enter a valid type." })
    @Transform((value) => value.value?.trim())
    type: string;

    description: string;

    @ApiProperty({
        description: 'target date to achieve the goal',
        format: 'string'
    })
    @IsNotEmpty({ message: "Enter a valid Target Date." })
    @Transform((value) => value.value?.trim())
    targetDate: string;

    @ApiProperty({
        description: 'amount for the goal',
        format: 'number'
    })
    @IsNotEmpty({ message: 'Enter a valid amount.' })
    @ValidateIf(c => c.amount != null && c.amount > 0)
    @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }, { message: "Enter a valid amount." })
    amount: number;

    userId: string;

}

// export class CreateGoalResponseDto {
//     @ApiProperty()
//     id: string;
//     @ApiProperty()
//     status: GoalStatus
// }
export class CreateGoalOutputResponseDto {
    @ApiProperty()
    data: UserGoal;
    @ApiProperty()
    message: string;
}