import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RedocOptions, RedocModule } from 'nestjs-redoc'
import { ErrorOutputResponseDto } from 'src/shared/dto/error.response.dto';

export class DocSetupUtility {
    constructor() { }
    public static async apidocsetup(app: INestApplication) {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Gravy Stacks API')
            .setDescription('Gravy Stack API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const doc = SwaggerModule.createDocument(app, swaggerConfig, { extraModels: [ErrorOutputResponseDto] });
        SwaggerModule.setup('api', app, doc);

        const options = new DocumentBuilder()
            .setTitle('Gravy Stack API')
            .setDescription('This is the main mobile API powering the Gravy Stacks.')
            .setVersion('1.0')
            .addTag('gravystacks')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, options, { extraModels: [ErrorOutputResponseDto] });
        const redocOptions: RedocOptions = {
            title: 'Gravy Stack API',
            logo: {
                url: 'https://myfirstsale.com/wp-content/uploads/2020/09/MyFirstSale-revised-logo-1.png',
                backgroundColor: '#F0F0F0',
                altText: 'My First Sale'
            },
            sortPropsAlphabetically: true,
            hideDownloadButton: false,
            hideHostname: false,
            auth: {
                enabled: true,
                user: 'admin',
                password: '123'
            },
            tagGroups: [
                {
                    name: 'Authentication',
                    tags: ['auth'],
                },
                {
                    name: 'Users',
                    tags: ['users', 'goals', 'referrals'],
                },
                // {
                //     name: 'Goals',
                //     tags: ['goals'],
                // }
            ]
        };
        // Instead of using SwaggerModule.setup() you call this module
        await RedocModule.setup('/docs', app, document, redocOptions);
    }
}