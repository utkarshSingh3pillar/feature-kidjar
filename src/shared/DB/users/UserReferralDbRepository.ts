import { ReferralStatus } from './../../../users/dto/referral/create-user-referral.dto';
import { BadRequestException, Injectable } from "@nestjs/common";
import { DB } from "../client";
import { UserReferralDbo } from "./dbo/user.referral.dbo";
import _ = require('lodash');
import AWS = require('aws-sdk');

@Injectable()
export class UserReferralDbRepository extends DB {
    constructor() {
        super();
    }

    searchPhoneReferralsByUserId = async (phoneNumbers: string[] = null) => {
        var referralList = new Array<UserReferralDbo>();
        let statement = '';
        if (phoneNumbers != null && phoneNumbers.length > 0) {
            let phoneContains = _.uniq(phoneNumbers).join("','");
            statement = `SELECT * FROM Referral WHERE ("receiverPhoneNumber" in ('${phoneContains}'))`;
            const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
            if (results.Items.length > 0) {
                var referralDbResult = results.Items;
                referralDbResult.forEach(element => {
                    referralList.push(AWS.DynamoDB.Converter.unmarshall(element) as UserReferralDbo);
                });
            }
        }

        return referralList;

    };

    findUserReferralsByUserId = async (userId: string, phoneNumbers: string[] = null) => {
        var referralList = new Array<UserReferralDbo>();
        let statement = '';
        if (phoneNumbers != null && phoneNumbers.length > 0) {
            let phoneContains = phoneNumbers.join("','");
            statement = `SELECT * FROM Referral WHERE ("senderUserId" = '${userId}' and "receiverPhoneNumber" in ('${phoneContains}'))`;
        }
        else {
            statement = `SELECT * FROM Referral WHERE ("senderUserId" = '${userId}')`;
        }
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            var referralDbResult = results.Items;
            referralDbResult.forEach(element => {
                referralList.push(AWS.DynamoDB.Converter.unmarshall(element) as UserReferralDbo);
            });
        }
        return referralList;

    };

    createUserReferrals = async (item: Array<UserReferralDbo>) => {
        let referrals = [];
        let savedRecords = [];
        if (item.length > 0) {
            let userId = _.map(item, 'senderUserId')[0];
            let phoneNumbers = [...new Set(_.map(item, 'receiverPhoneNumber'))];
            let referredUsers = await this.findUserReferralsByUserId(userId, phoneNumbers);
            item.forEach(element => {
                if (!_.find(referredUsers, { 'senderUserId': userId, 'receiverPhoneNumber': element.receiverPhoneNumber })) {
                    savedRecords.push(element);
                    referrals.push({
                        PutRequest: {
                            Item: element,
                        }
                    });
                }
            });
            if (referrals.length > 0) {
                var params = {
                    RequestItems: {
                        'Referral': referrals
                    }
                };
                let result = await this.dynamodb.batchWrite(params).promise();
                return {
                    status: ReferralStatus.Invited,
                    phoneNumbers: [...new Set(_.map(savedRecords, 'receiverPhoneNumber'))]
                };
            }
            else {
                throw new BadRequestException({ message: 'Referral request is already sent.', description: 'Referral request is already sent.' });
            }
        }
        throw new BadRequestException({ message: 'Select atleast one number for referral.', description: 'Select atleast one number for referral.' });
    }

}
