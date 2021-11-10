import { BadRequestException, Injectable } from "@nestjs/common";
import { DB } from "../client";
import { Preferences, User, UserStatus } from './../../../users/entities/user.entity';
import { UserDbo } from './dbo/user.dbo';
import AWS = require('aws-sdk');
import uuidV4 = require('uuid/v4');
import { JarSettingsDto } from "src/users/dto/jar-value.dto";
import { UserGoal } from '../../../users/entities/usergoal.entity';
import { UserGoalDbo } from '../users/dbo/usergoal.dbo';
import { GoalStatus } from '../../../users/entities/usergoal.entity';
import _ = require("lodash");
import { DynamodbUtil } from "dynamodb-utility";
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');

@Injectable()
export class UserDbRepository extends DB {
    constructor() {
        super();
    }

    updateUserStatusToConfirm = async (username: string, user: User) => {
        try {
            const fetchUserByUsername = `SELECT userId FROM Users WHERE "username" = '${username}'`;
            const fetchUserByUsernameResult = await this.DynamoDB.executeStatement({ Statement: fetchUserByUsername }).promise();
            if (fetchUserByUsernameResult.Items.length > 0) {
                const userId = AWS.DynamoDB.Converter.unmarshall(fetchUserByUsernameResult.Items[0]).userId;
                const updateUserStatus = `UPDATE Users SET "userStatus" = '${user.userStatus}' WHERE userId = '${userId}'`;
                const updateUserStatusResult = await this.DynamoDB.executeStatement({ Statement: updateUserStatus }).promise();
                return true;
            }
            else {
                throw new BadRequestException({
                    message: "User not found."
                });
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    updateUserAvatar = async (userId: string, photoUrl: string) => {
        try {
            const updateUserStatus = `UPDATE Users SET "avatar" = '${photoUrl}' WHERE userId = '${userId}'`;
            await this.DynamoDB.executeStatement({ Statement: updateUserStatus }).promise();
            return true;

        } catch (error) {
            throw new Error(error);
        }
    }


    encryptSharedCode = (userId, length) => {
        var characters = `${userId.replace(/-/g, "")}`; //add prefix 0 and remove `-`
        var result = '';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    };

    mapCreateEntityToDbo(user: User) {
        var item = new UserDbo();
        item.userId = user.userId;
        item.parentId = user.parentId;
        item.username = user.username;
        item.firstName = user.firstName;
        item.lastName = user.lastName;
        item.emailId = user.emailId;
        item.phoneNumber = user.phoneNumber;
        item.birthDate = user.birthDate;
        item.userStatus = user.userStatus;
        item.preferences = JSON.stringify(user.preferences);
        item.sharedCode = this.encryptSharedCode(user.userId, 6).toUpperCase();

        return item;
    }

    createUser = async (user: User) => {
        try {
            let item = this.mapCreateEntityToDbo(user);
            var params = {
                TableName: "Users",
                Item: item
            };
            let result = await this.dynamodb.put(params).promise();
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }
    updateUser = async (user: any, userId: string) => {
        const usersModel = new DynamodbUtil('Users', {
            region: 'us-east-1',
        });

        let userData = await usersModel.get({ userId: userId });

        if (userData.userId) {
            const response = await usersModel.patch({ userId: userId }, user);
            userData = this.mappedUser(response);
            return userData;
        }
        else {
            return false;
        }
    }
    // getUserData_1 = async (userId: string) => {
    // TODO: will do performance check after couple of data entered.
    //     var params = {
    //         TableName: "Users",
    //         ProjectionExpression: "#userId,#parentId, firstName, LastName",
    //         FilterExpression: "#userId = :userId Or #parentId = :userId",
    //         ExpressionAttributeNames: {
    //             "#userId": "UserId",
    //             "#parentId": "ParentId",
    //         },
    //         ExpressionAttributeValues: {
    //             ":userId": userId
    //         }
    //     };
    //     const results = await this.dynamodb.scan(params).promise();

    //     var userInfo = new User();
    //     var result = results.Items.filter(c => !c.ParentId);
    //     var submembersInfo = results.Items.filter(c => c.ParentId != null);
    //     result.forEach(element => {
    //         userInfo = this.mappedUser(element);
    //     });
    //     if (submembersInfo.length > 0) {
    //         userInfo.subMembers = [];
    //         submembersInfo.forEach(element => {
    //             userInfo.subMembers.push(this.mappedUser(element));
    //         });
    //     }
    //     return userInfo;
    // };

    getUserData = async (userId: string, isIncludeChildInfo: boolean = true) => {
        var userInfo = new User();
        let statement = '';
        if (isIncludeChildInfo)
            statement = `SELECT * FROM Users WHERE ("userId" = '${userId}' OR "parentId" = '${userId}') AND "userStatus" = '1'`;
        else
            statement = `SELECT * FROM Users WHERE "userId" = '${userId}' AND "userStatus" = '1'`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            var result = results.Items.filter(c => AWS.DynamoDB.Converter.unmarshall(c).userId == userId);
            var submembersInfo = results.Items.filter(c => AWS.DynamoDB.Converter.unmarshall(c).parentId == userId);
            result.forEach(element => {
                userInfo = this.mappedUser(AWS.DynamoDB.Converter.unmarshall(element) as UserDbo);
            });
            if (submembersInfo.length > 0) {
                userInfo.subMembers = [];
                submembersInfo.forEach(element => {
                    userInfo.subMembers.push(this.mappedUser(AWS.DynamoDB.Converter.unmarshall(element) as UserDbo));
                });
            }
        }
        else {
            throw new BadRequestException({
                message: 'User not found.'
            })
        }

        return userInfo;
    };

    isUserAlreadyExists = async (user: User) => {
        const statement = `SELECT * FROM Users 
                            WHERE ("username" = '${user.username}'
                                OR "emailId" = '${user.emailId}'
                                OR "emailId" = '${user.username}'
                                OR "phoneNumber" = '${user.phoneNumber}'
                                OR "phoneNumber" = '${user.username}'
                                )`;

        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            var result = this.mappedUser(AWS.DynamoDB.Converter.unmarshall(results.Items[0]) as UserDbo);
            if (((result.emailId != undefined && result.emailId == user.emailId)
                || (result.emailId != undefined && result.emailId == user.username))
                && (result.userStatus == '1' || result.userStatus == '2')) {
                return {
                    userStatus: result.userStatus,
                    success: true,
                    message: 'User with Email already exists.',
                    user: result
                };
            }
            else if (((result.phoneNumber != undefined && result.phoneNumber == user.phoneNumber)
                || (result.phoneNumber != undefined && result.phoneNumber == user.username))
                && (result.userStatus == '1' || result.userStatus == '2')) {
                return {
                    userStatus: result.userStatus,
                    success: true,
                    message: 'User with Phone Number already exists.',
                    user: result
                };
            }
            else if ((result.username == user.username)
                && (result.userStatus == '1' || result.userStatus == '2')) {
                return {
                    userStatus: result.userStatus,
                    success: true,
                    message: 'Username not available.',
                    user: result
                };
            }
            else if (result.userStatus == '2') {
                return {
                    userStatus: result.userStatus,
                    success: true,
                    message: 'User is not confirmed yet.',
                    user: result
                };
            }
        }
        else {
            return {
                userStatus: null,
                success: false,
                message: "User doesn't exists."
            };
        }

    };

    mappedUser(element: UserDbo) {
        var userInfo = new User();
        userInfo.userId = element.userId;
        userInfo.paymentUserId = element.paymentUserId;
        userInfo.paymentDocumentId = element.paymentDocumentId;
        userInfo.spendAccountId = element.spendAccountId;
        userInfo.shareAccountId = element.shareAccountId;
        userInfo.saveAccountId = element.saveAccountId;
        userInfo.achAccountId = element.achAccountId;
        userInfo.parentId = element.parentId;
        userInfo.phoneNumber = element.phoneNumber;
        userInfo.birthDate = moment.utc(element.birthDate).format('YYYY-MM-DDTHH:mm:ssZ');
        userInfo.userStatus = element.userStatus;
        userInfo.username = element.username;
        userInfo.firstName = element.firstName;
        userInfo.lastName = element.lastName;
        userInfo.gender = element.gender;
        userInfo.emailId = element.emailId;
        userInfo.avatar = element.avatar;
        userInfo.preferences = element.preferences != null ? JSON.parse(element.preferences) : {};
        userInfo.sharedCode = element.sharedCode;
        if (element.parentId == null) {
            userInfo.sharedText = "I'm helping my child become a financially capable self starter. Create a gravystack account to get your kid started, too!";
        } else {
            userInfo.sharedText = "I'm becoming a financially capable self starter. Create a gravystack account to get started, too!";
        }
        return userInfo;
    }

    updateJarValues = async (userId: string, jarBucketValues: JarSettingsDto) => {
        try {
            var preferences = new Preferences();
            const fetchUserById = `SELECT * FROM Users WHERE "userId" = '${userId}'`;
            const fetchUserByIdResult = await this.DynamoDB.executeStatement({ Statement: fetchUserById }).promise();
            if (fetchUserByIdResult.Items.length > 0) {
                var savedPreferences = fetchUserByIdResult.Items[0].preferences;
                savedPreferences = JSON.parse(savedPreferences != undefined ? savedPreferences['S'] : null);
                if (savedPreferences && savedPreferences['jarBucketSettings']) {
                    savedPreferences['jarBucketSettings'] = jarBucketValues;
                    const serializedPreference = JSON.stringify(savedPreferences);
                    const updateJarValue = `Update Users SET "preferences" = '${serializedPreference}' WHERE userId = '${userId}'`;
                    await this.DynamoDB.executeStatement({ Statement: updateJarValue }).promise();
                }
                else {
                    preferences.jarBucketSettings = jarBucketValues;
                    const serializedPreference = JSON.stringify(preferences);
                    const updateJarValue = `Update Users SET "preferences" = '${serializedPreference}' WHERE userId = '${userId}'`;
                    await this.DynamoDB.executeStatement({ Statement: updateJarValue }).promise();
                }

                return true;
            }
            else {
                throw new BadRequestException({
                    message: "User not found."
                });
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    getPreferences = async (userId: string) => {
        try {
            var result = "";
            const fetchUserById = `SELECT preferences FROM Users WHERE "userId" = '${userId}'`;
            const fetchUserByIdResult = await this.DynamoDB.executeStatement({ Statement: fetchUserById }).promise();

            if (fetchUserByIdResult.Items.length > 0) {
                var prefResult = fetchUserByIdResult.Items;
                result = AWS.DynamoDB.Converter.unmarshall(prefResult[0]).preferences;
                if (result == undefined) {
                    result = "";
                }
            }
            else {
                result = "";
            }
            return result;

        } catch (error) {
            throw new Error(error);
        }
    }

    searchUserByPhone = async (phoneNumbers: string[] = null) => {
        var usersList = new Array<any>();
        let statement = '';
        if (phoneNumbers != null && phoneNumbers.length > 0) {
            let phoneContains = _.uniq(phoneNumbers).join("','");
            statement = `SELECT phoneNumber, userStatus FROM Users WHERE ("phoneNumber" in ('${phoneContains}'))`;
            const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
            if (results.Items.length > 0) {
                var userSearchDbResult = results.Items;
                userSearchDbResult.forEach(element => {
                    let user = AWS.DynamoDB.Converter.unmarshall(element) as UserDbo;
                    usersList.push({
                        "phoneNumber": user.phoneNumber,
                        "status": user.userStatus == UserStatus.ACTIVE ? 'Joined' : 'Pending',
                    });
                });
            }
        }
        return usersList;

    };

    getUserByPhoneNumber = async (phoneNumber: string) => {
        const statement = `SELECT * FROM Users WHERE ("phoneNumber" = '${phoneNumber}' AND "userStatus" = '1')`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

}

