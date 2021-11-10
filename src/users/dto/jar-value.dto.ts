import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class JarSettingsDto {

    @ApiProperty({
        description: 'spend percentage',
        format: 'number'
    })
    @IsNotEmpty()
    spend: number;

    @ApiProperty({
        description: 'save percentage',
        format: 'number'
    })
    @IsNotEmpty()
    save: number;

    @ApiProperty({
        description: 'share percentage',
        format: 'number'
    })
    @IsNotEmpty()
    share: number
}

export class UpdateJarSettingsOutputResponseDto {
    @ApiProperty()
    message: string;
}

export class GetUserPreferencesResponseDto {
    @ApiProperty()
    jarBucketSettings: JarSettingsDto;
}

export class GetUserPreferencesOutputResponseDto {
    @ApiProperty()
    data: GetUserPreferencesResponseDto;
}

