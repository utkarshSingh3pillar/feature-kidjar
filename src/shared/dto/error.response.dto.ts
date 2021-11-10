import { ApiProperty } from "@nestjs/swagger";

export class ErrorOutputResponseDto {
    @ApiProperty()
    message: string;
    @ApiProperty()
    errors: string[];
}