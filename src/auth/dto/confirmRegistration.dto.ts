import { IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';


export class ConfirmRegistrationDto {
    @ApiProperty({
        description: `username can be set by the user at the time of Registration, it can be username
                        or email or phone number`
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })
    username: string;
    @ApiProperty()
    @IsNotEmpty({ message: "Enter a valid code." })
    @MaxLength(6)
    @Transform((value) => value.value?.trim())
    code: string;

    ipAddress: string;
}

export class ResendConfirmRegistrationCodeDto {
    @ApiProperty({
        description: `username can be set by the user at the time of Registration, it can be username
                        or email or phone number`
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })
    username: string;
}

export class ConfirmRegistrationOutputResponseDto {
    // @ApiProperty()
    // public data: object;
    @ApiProperty()
    message: string
}