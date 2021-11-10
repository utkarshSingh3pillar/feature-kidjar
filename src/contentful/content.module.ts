import { Module } from "@nestjs/common";
import { ContentController } from "./content.controller";
import { ContentService } from "./services/content.services";

@Module({
    imports: [],
    providers: [ContentService],
    controllers: [ContentController],
})
export class ContentModule { }