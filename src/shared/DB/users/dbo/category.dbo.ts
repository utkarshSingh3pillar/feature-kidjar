import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';

@table('GoalsCategory')
export class GoalsCategoryDbo {

    @attribute()
    id: string;

    @attribute()
    name: string;

    @attribute()
    iconName: string;

    @attribute()
    color: string;

}