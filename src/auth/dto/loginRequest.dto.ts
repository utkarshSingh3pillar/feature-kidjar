import { AuthTicket, User } from './../../users/entities/user.entity';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';



export class LoginRequestDto {
    @ApiProperty()
    @ApiProperty({
        description: `username can be set by the user at the time of Registration, it can be username
                        or email or phone number`,
        uniqueItems: true
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })

    username: string;
    @ApiProperty({
        description: 'Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character.',
        format: 'string'
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/,
        { message: 'Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character.' })

    @Transform((value) => value.value?.trim())
    password: string;
}


export class LoginResponseDto {
    @ApiProperty()
    userInfo: User;
    @ApiProperty()
    ticket: AuthTicket;
}

export class LoginOutputResponseDto {
    @ApiProperty()
    public data: LoginResponseDto;
}

