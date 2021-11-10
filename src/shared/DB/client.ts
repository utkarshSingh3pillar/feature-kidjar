import { DynamoDB } from 'aws-sdk';
import AWS = require('aws-sdk');
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import config = require('@tsmx/secure-config');
export class DB {
    dynamodb: DynamoDB.DocumentClient = null;
    DynamoDB: DynamoDB = null;
    constructor() {
        const isDev = config.env.NODE_ENV == 'local';
        if (isDev) {
            if (this.dynamodb == null) {
                this.dynamodb = new DynamoDB.DocumentClient({
                    region: config.AWS.region,
                    endpoint: 'http://localhost:8000',
                });
            }
        } else {
            if (this.dynamodb == null) {
                AWS.config.update({
                    accessKeyId: config.AWS.accessKeyId,
                    secretAccessKey: config.AWS.secretAccessKey,
                    region: config.AWS.region,
                    sslEnabled: false,
                    paramValidation: false,
                    convertResponseTypes: false
                });
                // let serviceConfigOptions: ServiceConfigurationOptions = {
                //     region: config.AWS.region,
                //     endpoint: `https://dynamodb.${config.AWS.region}.amazonaws.com`
                // };
                // this.DynamoDB = new AWS.DynamoDB(serviceConfigOptions);
                this.DynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
                //this.dynamodb = new AWS.DynamoDB.DocumentClient();
                this.dynamodb = new DynamoDB.DocumentClient({
                    region: config.AWS.region,
                    endpoint: `https://dynamodb.${config.AWS.region}.amazonaws.com`,
                    convertEmptyValues: true
                });
            }
        }
    }

    put(params: DynamoDB.DocumentClient.PutItemInput) {
        return this.dynamodb.put(params).promise();
    }

    update(params: DynamoDB.DocumentClient.UpdateItemInput) {
        return this.dynamodb.update(params).promise();
    }

    get(params: DynamoDB.DocumentClient.GetItemInput) {
        return this.dynamodb.get(params).promise();
    }
    scan(params: DynamoDB.DocumentClient.GetItemInput) {
        return this.dynamodb.scan(params).promise();
    }

    delete(params: DynamoDB.DocumentClient.DeleteItemInput) {
        return this.dynamodb.delete(params).promise();
    }

    query(params: DynamoDB.DocumentClient.QueryInput) {
        return this.dynamodb.query(params).promise();
    }

    batchWrite(params: DynamoDB.DocumentClient.BatchWriteItemInput) {
        return this.dynamodb.batchWrite(params).promise();
    }

    batchGet(params: DynamoDB.DocumentClient.BatchGetItemInput) {
        return this.dynamodb.batchGet(params).promise();
    }

}
