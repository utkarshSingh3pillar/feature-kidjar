
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty,IsIn} from "class-validator";


export class JarSummaryOutputResponse {
  
    @ApiProperty()
    name: string;
  
    @ApiProperty()
    amount: number;
  }
  
  
  export class JarsSummaryOutputResponseDto {
    @ApiProperty()
    public data: JarSummaryOutputResponse;
    @ApiProperty()
    message: string;
  }

  export class JarTransactionsOutputResponse {
  
    @ApiProperty()
    id: string;
  
    @ApiProperty()
    name: string;
  
    @ApiProperty()
    amount: number;

    @ApiProperty()
    date: string;

    @ApiProperty()
    status: string;
  
  }
  
  
  export class JarsTransactionsOutputResponseDto {
    @ApiProperty({
      isArray: true
    })
    public data: JarTransactionsOutputResponse;
    @ApiProperty()
    message: string;
  }


  export class JarTransactionsDto {

    @ApiProperty({
        description: 'jar type to retrieve transactions for',
        format: 'string'
    })
    @IsIn(['SAVE', 'SHARE','SPEND'])
    jar: string;

    @ApiProperty({
        description: 'transaction type',
        format: 'string'
    })
    @IsIn(['INCOMING', 'OUTGOING'])
    type: string;

    @ApiProperty({
        description: 'per page',
        format: 'number'
    })
    @IsNotEmpty()
    pageSize: number;

    @ApiProperty({
      description: 'page number',
      format: 'number'
  })
  @IsNotEmpty()
  pageId: number
}
