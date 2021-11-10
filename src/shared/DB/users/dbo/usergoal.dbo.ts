import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { GoalStatus } from '../../../../users/entities/usergoal.entity';


@table('UserGoal')
export class UserGoalDbo {
    @attribute()
    userGoalId: { type: string, hashKey: true };

    @attribute()
    goalName: string;

    @attribute()
    categoryId: string;

    @attribute()
    type: string;

    @attribute()
    description: string;

    @attribute()
    url: string;

    @attribute()
    startDate: string;

    @attribute()
    targetDate: string;

    @attribute()
    completionDate?: string;

    @attribute()
    amount: number;

    @attribute()
    userId: string;

    @attribute()
    status: GoalStatus;

    @attribute()
    createdDate: string;

    @attribute()
    modifiedDate: string;

}