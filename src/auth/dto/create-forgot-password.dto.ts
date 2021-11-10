import { IsNotEmpty, MinLength, MaxLength, IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CodeDeliveryDetails } from './registration.dto';
import { Transform } from 'class-transformer';

export class CreateForgotPasswordDto {
    @ApiProperty({
        example: 'sumit1khandelwal',
        description: 'The username of the User',
        uniqueItems: true,
        maxLength: 255,
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })
    readonly username: string;
}


export class CreateResetKidPasswordDto {
    @ApiProperty({
        example: 'sumit1khandelwal',
        description: 'The username of the User',
        uniqueItems: true,
        maxLength: 255,
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })
    readonly username: string;

    @ApiProperty({
        description: 'Password Requirements: Minimum 8 characters, Include at least one number, Include at least one upper-case letter, Include at least one special character.',
        format: 'string'
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/,
        { message: "Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character." })
    @Transform((value) => value.value?.trim())
    readonly password: string
}

// export class CreateForgotPasswordResponseDto {
//     @ApiProperty()
//     readonly codeDeliveryDetails: CodeDeliveryDetails
// }

export class CreateForgotPasswordOutputResponseDto {
    @ApiProperty()
    public data: CodeDeliveryDetails;
}

// export class CreateKidForgotPasswordOutputResponseDto {
//     @ApiProperty()
//     public data: KidForgotPasswordDetails;
// }

export class ConfirmPasswordDto extends CreateForgotPasswordDto {
    @ApiProperty({
        description: 'verification Code',
        format: 'string'
    })
    @IsNotEmpty({ message: "Enter a valid code." })
    @Transform((value) => value.value?.trim())
    readonly code: string;

    @ApiProperty({
        description: 'Password Requirements: Minimum 8 characters, Include at least one number, Include at least one upper-case letter, Include at least one special character.',
        format: 'string'
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/,
        { message: "Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character." })
    @Transform((value) => value.value?.trim())
    readonly newPassword: string
}
export class SetPasswordForKidsWOEmailPhoneDto extends CreateForgotPasswordDto {

    @ApiProperty({
        description: 'Password Requirements: Minimum 8 characters, Include at least one number, Include at least one upper-case letter, Include at least one special character.',
        format: 'string'
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/,
        { message: "Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character." })
    @Transform((value) => value.value?.trim())
    readonly newPassword: string

    @ApiProperty()
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid request id." })
    requestId: string
}

export class ConfirmPasswordResponseDto {
    @ApiProperty()
    readonly message: string
}

export class ConfirmPasswordOutputResponseDto {
    // @ApiProperty()
    // public data: ConfirmPasswordResponseDto;
    @ApiProperty()
    readonly message: string
}
