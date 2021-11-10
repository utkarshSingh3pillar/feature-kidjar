import { Controller, Get, Req, Res } from "@nestjs/common";
import { Request, Response } from 'src/core';
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { getFaq } from "./services/faq";

@Controller('content')
export class ContentController {

    @Get('faq')
    @ApiExcludeEndpoint()
    async getContentFulData(@Req() req: Request, @Res() res: Response) {
        let result = await getFaq();
        return res.success(result);
    }
}