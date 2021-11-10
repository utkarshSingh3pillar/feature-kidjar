import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class FileUploadDto {
    @ApiProperty({ type: 'string', format: 'binary', required: true })
    @IsNotEmpty()
    @Transform((value) => value.value?.trim())
    image: any;
}

export class FileUploadOutputResponseDto {
    @ApiProperty()
    message: string;
}