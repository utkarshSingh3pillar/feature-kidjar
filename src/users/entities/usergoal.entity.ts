import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";


export class UserGoal {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    categoryId: string;

    @ApiProperty()
    type: string;

    @ApiPropertyOptional()
    description: string;

    @ApiPropertyOptional()
    url: string;

    @ApiProperty()
    startDate: string;

    @ApiProperty()
    targetDate: string;

    @ApiPropertyOptional()
    completionDate?: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    status: GoalStatus;

    @ApiProperty()
    userId: string;

    // @ApiProperty()
    // createdDate: string;

    @ApiPropertyOptional()
    lastUpdated: string;

}

export enum GoalStatus {
    Deleted = '0',
    Active = '1',
    Archive = '2'
}





