import { Injectable } from "@nestjs/common";
import { getFaq } from "./faq";

@Injectable()
export class ContentService {
    constructor() {

    }

    async getFAQ() {
        return await getFaq();
    }
}