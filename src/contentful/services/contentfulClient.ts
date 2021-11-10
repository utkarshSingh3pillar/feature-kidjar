import contentful = require('contentful')
import config = require('@tsmx/secure-config');

export const client = contentful.createClient({
    accessToken: config.contentful.accessToken,
    space: config.contentful.space
});