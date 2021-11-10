import { attribute, table } from '@aws/dynamodb-data-mapper-annotations';
import { ReferralStatus } from 'src/users/dto/referral/create-user-referral.dto';


@table('Referral')
export class UserReferralDbo {
    @attribute()
    referralId: { type: string, hashKey: true };

    @attribute()
    senderUserId: string;

    @attribute()
    inviteCode: string;

    @attribute()
    message: string;

    @attribute()
    senderName: string;

    @attribute()
    receiverPhoneNumber: string

    @attribute()
    status: ReferralStatus;

    @attribute()
    createdDate: string;

    @attribute()
    modifiedDate: string;

}