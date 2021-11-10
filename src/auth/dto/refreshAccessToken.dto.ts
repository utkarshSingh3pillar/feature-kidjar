import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, Matches, MaxLength } from "class-validator";
import { AuthTicket } from "src/users/entities/user.entity";

export class RefreshAccessTokenDto {
    @ApiProperty({
        description: 'user refresh token',
        uniqueItems: true,
    })
    @IsNotEmpty({ message: "Enter a valid refresh token." })
    @Transform((value) => value.value?.trim())
    readonly refreshToken: string;

    @ApiProperty({
        description: 'username for refresh token',
        format: 'string',
        uniqueItems: true,
        maxLength: 255
    })
    @MaxLength(255)
    @Matches(/^[\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]+$/,
        { message: "Enter a valid username." })
    @IsNotEmpty({ message: "Enter a valid username." })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    readonly username: string
}

export class RefreshAccessTokenOutputResponseDto {
    @ApiProperty()
    public data: AuthTicket;
}