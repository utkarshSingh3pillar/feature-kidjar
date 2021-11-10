import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export enum ReferralStatus {
    Invited = "Invited",
    Accept_Invite = "Accept Invite",
    Pending = "Pending",
    Joined = "Joined"
}

export class UserReferralDto {
    @ApiProperty()
    phoneNumber: string;
    @ApiProperty()
    status: ReferralStatus;
}

export class UserReferralResponseDto {
    @ApiProperty({ type: UserReferralDto, isArray: true })
    data: UserReferralDto[];
}

export class CreateUserReferralDto {
    senderUserId: string;
    @ApiProperty()
    @IsPhoneNumber(null, { each: true, message: 'Select a valid phone numbers.', always: true })
    phoneNumbers: string[];
}

export class SearchUserReferralDto {
    @ApiProperty()
    @IsPhoneNumber(null, { each: true, message: 'Select a valid phone numbers.', always: true })
    phoneNumbers: string[];
}



//     @ApiProperty({
//         description: 'name of the goal',
//         format: 'string'
//     })
//     @IsNotEmpty({ message: "Enter a valid Goal Name." })
//     @Transform((value) => value.value?.trim())
//     goalName: string;

//     description: string;

//     @ApiProperty({
//         description: 'target date to achieve the goal',
//         format: 'string'
//     })
//     @IsNotEmpty({ message: "Enter a valid Target Date." })
//     @Transform((value) => value.value?.trim())
//     targetDate: string;

//     @ApiProperty({
//         description: 'amount for the goal',
//         format: 'number'
//     })
//     @ValidateIf(c => c.amount != null)
//     @IsNotEmpty({ message: 'Enter a valid amount.' })
//     @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 }, { message: "Enter a valid amount." })
//     amount: number;

//     userId: string;
// }

// export class CreateGoalResponseDto {
//     @ApiProperty()
//     userGoalId: string;
//     @ApiProperty()
//     status: GoalStatus
// }
// export class CreateGoalOutputResponseDto {
//     @ApiProperty()
//     data: CreateGoalResponseDto;
//     @ApiProperty()
//     message: string;
// }