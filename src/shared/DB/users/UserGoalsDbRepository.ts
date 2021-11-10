import { BadRequestException, Injectable } from "@nestjs/common";
import { DB } from "../client";
import AWS = require('aws-sdk');
import uuidV4 = require('uuid/v4');
import { UserGoal } from '../../../users/entities/usergoal.entity';
import { UserGoalDbo } from './dbo/usergoal.dbo';
import { GoalStatus } from '../../../users/entities/usergoal.entity';
import { GoalsCategory } from '../../../users/entities/category.entity';
import { GoalsCategoryDbo } from './dbo/category.dbo';
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');
import { DynamodbUtil } from 'dynamodb-utility'

@Injectable()
export class UserGoalsDbRepository extends DB {
    constructor() {
        super();
    }

    createUserGoal = async (item: UserGoalDbo) => {
        item.createdDate = moment.utc().format('YYYY-MM-DDTHH:mm:ssZ');
        var params = {
            TableName: "UserGoals",
            Item: item
        };
        let result = await this.dynamodb.put(params).promise();
        console.log(result);
        const response = this.mappedGoal(item);
        return response;
    }

    mapGoalEntityToDbo(goal: UserGoal) {
        let item = new UserGoalDbo();
        item.userGoalId = uuidV4();
        item.goalName = goal.name;
        item.categoryId = goal.categoryId;
        item.description = goal.description;
        item.amount = goal.amount;
        item.url = goal.url;
        item.startDate = goal.startDate;
        item.targetDate = goal.targetDate;
        item.completionDate = goal.completionDate;
        item.userId = goal.userId;
        item.status = goal.status;
        item.modifiedDate = goal.lastUpdated;
        return item;
    }

    async getAllUserGoals(userId: string) {
        var goalList = new Array<UserGoal>();
        const statement = `SELECT * FROM UserGoals WHERE ("userId" = '${userId}' AND "status" = '${GoalStatus.Active}' AND "completionDate" = null)`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            var prefResult = results.Items;
            prefResult.forEach(element => {
                goalList.push(this.mappedGoal(AWS.DynamoDB.Converter.unmarshall(element) as UserGoalDbo));
            });
        }
        return goalList;
    }

    deleteUserGoal = async (goalId: string) => {
        let goalData = await this.getGoalData(goalId);
        if (goalData) {
            const statement = `UPDATE UserGoals SET "status" = '${GoalStatus.Deleted}' WHERE "userGoalId" = '${goalId}'`;
            const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
            return {
                id: goalId,
                status: GoalStatus.Deleted
            };
        }
        else {
            return false;
        }
    }

    getGoalData = async (goalId: string) => {
        var goal = new UserGoal();
        const statement = `SELECT * FROM UserGoals WHERE "userGoalId" = '${goalId}' AND "status" = '${GoalStatus.Active}'`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            var prefResult = results.Items;
            prefResult.forEach(async element => {
                goal = this.mappedGoal(AWS.DynamoDB.Converter.unmarshall(element) as UserGoalDbo);
            });
            if (goal.completionDate != null) {
                throw new BadRequestException({
                    description: `${goal.name} (goal) is already marked as completed.`,
                    message: `Goal not found.`
                })
            }
        }
        else {
            throw new BadRequestException({
                message: 'Goal not found.'
            })
        }
        return goal;
    };


    mappedGoal(element: UserGoalDbo) {
        var goalInfo = new UserGoal();
        goalInfo.id = element.userGoalId.toString();
        goalInfo.name = element.goalName;
        goalInfo.categoryId = element.categoryId;
        goalInfo.type = element.type;
        goalInfo.amount = element.amount;
        goalInfo.targetDate = moment.utc(element.targetDate).format('YYYY-MM-DD[T]HH:mm:ssZ');
        goalInfo.completionDate = element.completionDate != null
            ? moment.utc(element.completionDate).format('YYYY-MM-DD[T]HH:mm:ssZ') : null;
        goalInfo.status = element.status;
        goalInfo.description = element.description;
        goalInfo.url = element.url;
        goalInfo.startDate = moment.utc(element.startDate).format('YYYY-MM-DD[T]HH:mm:ssZ');
        goalInfo.lastUpdated = element.modifiedDate != null
            ? moment.utc(element.modifiedDate).format('YYYY-MM-DD[T]HH:mm:ssZ') :
            null;
        goalInfo.userId = element.userId;
        return goalInfo;
    }

    // updateUserGoal = async (goal: UserGoalDbo, goalId: string) => {

    //     let goalData = await this.getGoalData(goalId);

    //     if (goalData) {

    //         let queryParameters = "";
    //         Object.keys(goal).forEach(function (key) {
    //             if (typeof goal[key] === 'undefined') {
    //                 delete goal[key];
    //             }
    //         });
    //         for (const a in goal) {
    //             if (queryParameters == "") {
    //                 queryParameters += `  "${a}" = '${goal[a]}' `;
    //             }
    //             else {
    //                 queryParameters += ` , "${a}" = '${goal[a]}' `;
    //             }
    //         }
    //         const statement = `UPDATE UserGoals SET ${queryParameters} WHERE "userGoalId" = '${goalId}'`;
    //         const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
    //         goalData = await this.getGoalData(goalId);
    //         return goalData;
    //     }
    //     else {
    //         throw new BadRequestException({
    //             message: 'Goal not found.'
    //         })
    //     }
    // }

    updateUserGoal = async (goal: UserGoalDbo, goalId: string) => {

        const goalsModel = new DynamodbUtil('UserGoals', {
            region: 'us-east-1',
        });

        let goalData = await this.getGoalData(goalId);

        if (goalData) {
            const response = await goalsModel.patch({ userGoalId: goalId }, goal);
            goalData = this.mappedGoal(response);
            return goalData;
        }
        else {
            return false;
        }
    }

    getAllCategories = async () => {
        var categoryList = new Array<GoalsCategory>();
        const statement = `SELECT * FROM GoalsCategory`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            var prefResult = results.Items;
            prefResult.forEach(element => {
                categoryList.push(this.mappedCategory(AWS.DynamoDB.Converter.unmarshall(element) as GoalsCategoryDbo));
            });
        }
        return categoryList;
    }

    mappedCategory(element: GoalsCategoryDbo) {
        var categoryInfo = new GoalsCategory();
        categoryInfo.id = element.id;
        categoryInfo.name = element.name;
        categoryInfo.iconName = element.iconName;
        categoryInfo.color = element.color;
        return categoryInfo;
    }


    isCategoryExist = async (id: string) => {
        const statement = `SELECT * FROM GoalsCategory WHERE "id" = '${id}'`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            return true
        }
        else {
            return false;
        }
    }

    getCategoryById = async (id: string) => {
        let category = new GoalsCategory();
        const statement = `SELECT * FROM GoalsCategory WHERE "id" = '${id}'`;
        const results = await this.DynamoDB.executeStatement({ Statement: statement }).promise();
        if (results.Items.length > 0) {
            let prefResult = results.Items;
            prefResult.forEach(element => {
                category = this.mappedCategory(AWS.DynamoDB.Converter.unmarshall(element) as GoalsCategoryDbo);
            });
        }
        else {
            throw new BadRequestException({ "message": "Goal Category not found." })
        }
        return category;
    }
}

