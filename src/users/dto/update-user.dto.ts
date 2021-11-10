import { ApiProperty, PartialType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { }


export class UserOutputResponseDto {
    @ApiProperty()
    public data: User;
}
