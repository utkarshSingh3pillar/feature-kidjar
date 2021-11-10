import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import moment = require("moment");
import { JarSettingsDto } from "../dto/jar-value.dto";


export class Preferences {

    @ApiProperty()
    jarBucketSettings: JarSettingsDto;
}

export class User {
    @ApiProperty()
    userId: string;
    @ApiPropertyOptional()
    parentId?: string;
    @ApiProperty()
    username: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiPropertyOptional()
    gender: string;
    @ApiProperty()
    emailId?: string;
    @ApiPropertyOptional()
    phoneNumber?: string;
    @ApiProperty()
    birthDate: string;
    @ApiPropertyOptional()
    avatar: string;
    @ApiPropertyOptional()
    sharedCode: string;
    @ApiPropertyOptional()
    sharedText: string;
    @ApiPropertyOptional({ type: User, isArray: true })
    subMembers?: User[];
    @ApiProperty()
    userStatus: UserStatus;
    paymentUserId?: string;
    paymentDocumentId?: string;
    spendAccountId?: string;
    shareAccountId?: string;
    saveAccountId?: string;
    achAccountId?: string;
    getAge() {
        return moment().diff(this.birthDate, 'years');
    }
    @ApiProperty()
    preferences: Preferences;
}
export class AuthTicket {

    @ApiProperty()
    idToken: string;
    @ApiProperty()
    tokenType: string;
    @ApiProperty()
    expires: number;
    @ApiProperty()
    refreshToken: string;
    @ApiProperty()
    issued: number;
}



export enum UserStatus {
    ACTIVE = '1',
    PENDING = '2',
    DISABLED = '3'
}

