import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, Matches, MaxLength, ValidateIf } from "class-validator";
import { UserStatus } from "src/users/entities/user.entity";


export class CodeDeliveryDetails {
    @ApiProperty()
    deliveryMedium: string;
    @ApiProperty()
    destination: string;
}

// export class KidForgotPasswordDetails {
//     @ApiProperty()
//     message: string;
//     @ApiProperty()
//     requestId: string;
// }

export class RegistrationRequestDto {
    @ApiProperty({
        description: 'First name of the User',
        format: 'string',
        maxLength: 20,
        minLength: 1
    })
    @IsNotEmpty({ message: "Enter a valid first name." })
    @MaxLength(20)
    @Transform((value) => value.value?.trim())
    firstName: string;

    @ApiProperty({
        description: 'Last name of the User',
        format: 'string',
        maxLength: 20,
        minLength: 1
    })
    @IsNotEmpty({ message: "Enter a valid last name." })
    @MaxLength(20)
    @Transform((value) => value.value?.trim())
    lastName: string;

    @ApiProperty({
        description: 'username of the user',
        format: 'string',
        uniqueItems: true,
        maxLength: 255
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())

    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })
    username: string;

    @ApiProperty({
        description: 'date of birth of the user',
        format: 'date'
    })
    @IsDateString({ strict: true }, { message: "Enter the valid Birth Date." })
    @Transform((value) => value.value?.trim())
    birthDate: string;

    @ApiProperty({
        title: 'user phone number',
        description: 'A phone number must start with a plus (+) sign, followed immediately by the country code',
        format: 'phone',
        uniqueItems: true,
    })
    @IsPhoneNumber(null, { each: true, message: 'Enter a valid phone number.', always: true })
    // @IsNotEmpty({ message: "Enter a valid phone number" })
    @Transform((value) => value.value?.trim())
    phoneNumber: string;


    @ApiProperty({
        description: 'email of the user',
        format: 'email',
        uniqueItems: true,
    })
    @IsEmail({}, { message: 'Enter a valid email.' })
    @Transform((value) => value.value?.trim())
    email: string;

    @ApiProperty({
        description: 'Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character.',
        format: 'string'
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/,
        { message: "Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character." })
    @Transform((value) => value.value?.trim())
    password: string;
}

export class RegisterKidRequestDto {
    @ApiProperty({
        description: 'Kids First name',
        format: 'string',
        maxLength: 20,
        minLength: 1
    })
    @IsNotEmpty({ message: "Enter a valid first name." })
    @MaxLength(20)
    @Transform((value) => value.value?.trim())
    firstName: string;

    @ApiProperty({
        description: 'Kids Last name',
        format: 'string',
        maxLength: 20,
        minLength: 1
    })
    @IsNotEmpty({ message: "Enter a valid last name." })
    @MaxLength(20)
    @Transform((value) => value.value?.trim())
    lastName: string;

    @ApiProperty({
        description: 'username of the user',
        format: 'string',
        uniqueItems: true,
    })
    @MaxLength(255)
    @Transform((value) => value.value?.trim())
    @IsNotEmpty({ message: "Enter a valid username." })
    @Matches(/^([A-z0-9!@#$%^&*().,<>{}[\]<>?_=+\-|;:\'\"\/])*[^\s]\1*$/,
        { message: 'Enter a valid username.' })
    username: string;

    @ApiProperty({
        description: 'date of birth of the user',
        format: 'date'
    })
    @IsNotEmpty({ message: "Enter the valid Birth Date." })
    @Transform((value) => value.value?.trim())
    birthDate: string;

    @ApiProperty({
        description: 'email of the user',
        format: 'email',
        uniqueItems: true,
        required: false
    })
    @Transform((value) => value.value?.trim())
    @ValidateIf((value) => value != null)
    @IsOptional()
    email: string;

    @ApiProperty({
        description: 'Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character.',
        format: 'string'
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{8,99}$/,
        { message: "Enter a valid password with at least minimum 8 characters, include at least one number, include at least one upper-case letter, include at least one special character." })
    @Transform((value) => value.value?.trim())
    password: string;

    parentId: string
    @ApiProperty({
        title: 'user phone number',
        description: 'A phone number must start with a plus (+) sign, followed immediately by the country code',
        format: 'phone',
        uniqueItems: true,
        required: false
    })
    @IsPhoneNumber(null, { each: true, message: 'Enter a valid phone number.', always: true })
    @Transform((value) => value.value?.trim())
    @ValidateIf((value) => value != null)
    @IsOptional()
    phoneNumber: string;
    ipAddress: any;
}


export class RegistrationResponseDto {
    @ApiProperty({
        description: `username can be set by the user at the time of Registration, it can be username
                        or email or phone number`
    })
    username: string;
    @ApiProperty()
    codeDeliveryDetails: CodeDeliveryDetails;
    @ApiProperty()
    public userId: string;
    @ApiProperty({
        enum: UserStatus
    })
    userStatus: UserStatus;
}

export class RegistrationOutputResponseDto {
    @ApiProperty()
    public data: RegistrationResponseDto;
    @ApiProperty()
    message: string;
}

export class KidsRegistrationResponseDto {
    @ApiProperty()
    username: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    userStatus: UserStatus;
}
export class KidsRegistrationOutputResponseDto {
    @ApiProperty()
    public data: KidsRegistrationResponseDto;
    @ApiProperty()
    message: string;
}

export class AutoVerifyRegisterRequestDto {
    username: string;
    phone: boolean;
    email: boolean;
}

export class RequestRegistrationRequestDto {
    @ApiProperty({
        description: `name of the kid who wants to get registered.`
    })
    @IsNotEmpty({ message: "Enter a valid name." })
    @Transform((value) => value.value?.trim())
    name: string;

    @ApiProperty({
        title: 'user phone number',
        description: 'A phone number must start with a plus (+) sign, followed immediately by the country code',
        format: 'phone',
        uniqueItems: true,
    })
    @IsPhoneNumber(null, { each: true, message: 'Enter a valid phone number.', always: true })
    @Transform((value) => value.value?.trim())
    phoneNumber: string;
}
