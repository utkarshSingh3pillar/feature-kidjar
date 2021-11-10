var client = require('./contentfulClient').client

import contentful = require('contentful')
import config = require('@tsmx/secure-config');
import { fieldsParser } from 'contentful-parsers';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

export const getFaq = async () => {
    try {
        const client = contentful.createClient({
            accessToken: config.contentful.accessToken,
            space: config.contentful.space
        });
        const result = await client.getEntries(
            {
                include: 1,
                content_type: 'faq',
            }
        );
        const parseObject = fieldsParser(result.items[0]);
        console.log(parseObject);
        const resultFAQ = [];
        parseObject.items.forEach(element => {
            resultFAQ.push({
                question: element.question,
                answer: documentToHtmlString(element.answer)
            });
        });
        const finalResult = {
            title: parseObject.title,
            items: resultFAQ
        };
        return finalResult;
    } catch (error) {
        console.log(error);

    }

}