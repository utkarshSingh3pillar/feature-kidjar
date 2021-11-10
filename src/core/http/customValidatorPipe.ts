import { ArgumentMetadata, Injectable, PipeTransform, HttpException, HttpStatus, BadRequestException } from "@nestjs/common";
import { validate } from 'class-validator';
import { plainToClass } from "class-transformer";

@Injectable()
export class CustomValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;
        if (this.isEmpty(value)) {
            throw new BadRequestException('Validation Failed');
        }

        const object = plainToClass(metatype, value);
        const errors = await validate(object);

        if (errors.length > 0) {
            let uniqueErrors = this.formatErrors(errors);
            throw new BadRequestException({ message: uniqueErrors, description: "Validation Failed." });
        }
    }

    private formatErrors(errors: any[]) {
        let arr = {};
        let values = []
        errors.map(error => {
            for (let key in error.constraints) {
                if (!arr[error.property]) {
                    arr[error.property] = error.constraints[key];
                    values.push(error.constraints[key]);
                }
            }
        });
        return values;
    }

    private isEmpty(value: any) {
        if (Object.keys(value).length < 1) {
            return true;
        }
        return false;
    }

}