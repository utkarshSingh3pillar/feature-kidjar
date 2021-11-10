import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class GoalsCategory {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    iconName: string;

    @ApiProperty()
    color: string;

}





