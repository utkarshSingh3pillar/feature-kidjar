import { Injectable } from '@nestjs/common';
import { UserReferralDbo } from 'src/shared/DB/users/dbo/user.referral.dbo';
import { UserDbRepository } from 'src/shared/DB/users/UserDbRepository';
import { UserReferralDbRepository } from 'src/shared/DB/users/UserReferralDbRepository';
import { UserReferralDto } from '../dto/referral/create-user-referral.dto';
import { User } from '../entities/user.entity';
import { CreateUserReferralDto, ReferralStatus, SearchUserReferralDto } from './../dto/referral/create-user-referral.dto';
import uuidV4 = require('uuid/v4');
import _ = require('lodash');
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');


@Injectable()
export class UsersReferralService {
    constructor(private readonly userReferralDbRepository: UserReferralDbRepository,
        private readonly userDbRepository: UserDbRepository,
    ) {

    }

    async createUserReferral(createUserReferral: CreateUserReferralDto) {
        const senderUserInfo = await this.userDbRepository.getUserData(createUserReferral.senderUserId, false);
        const referralDboEntity = this.mapCreateReferralToReferralDbo(createUserReferral, senderUserInfo);
        return await this.userReferralDbRepository.createUserReferrals(referralDboEntity);

    }

    async searchPhoneReferrals(searchUserReferralDto: SearchUserReferralDto) {
        let finalReferrals = Array<UserReferralDto>();

        const joinedReferrals = await this.userDbRepository.searchUserByPhone(searchUserReferralDto.phoneNumbers);
        joinedReferrals.forEach(element => {
            finalReferrals.push(this.mapDboEntitytoReferralDto({
                receiverPhoneNumber: element.phoneNumber,
                status: element.status
            }));
        });
        const joinedPhoneNumbers = _.map(finalReferrals, 'phoneNumber');
        const otherThanJoinedReferrals = _.xor(searchUserReferralDto.phoneNumbers, joinedPhoneNumbers);

        const referrals = await this.userReferralDbRepository.searchPhoneReferralsByUserId(otherThanJoinedReferrals);
        referrals.forEach(element => {
            finalReferrals.push(this.mapDboEntitytoReferralDto(element));
        });
        return finalReferrals;
    }

    async findUserReferrals(senderUserId: string) {
        const finalReferrals = Array<UserReferralDto>();
        const referrals = await this.userReferralDbRepository.findUserReferralsByUserId(senderUserId);
        referrals.forEach(element => {
            finalReferrals.push(this.mapDboEntitytoReferralDto(element));
        });
        return finalReferrals;
    }

    async updateUserReferral() {

    }

    mapDboEntitytoReferralDto(userReferralDbo: UserReferralDbo | any) {
        let userReferralDto = new UserReferralDto();
        userReferralDto.phoneNumber = userReferralDbo.receiverPhoneNumber;
        userReferralDto.status = userReferralDbo.status;
        return userReferralDto;
    }

    mapCreateReferralToReferralDbo(createUserReferral: CreateUserReferralDto, senderUserInfo: User) {
        let items = new Array<UserReferralDbo>();
        const uniquePhoneNumbers = [...new Set(createUserReferral.phoneNumbers)];
        uniquePhoneNumbers.forEach(phoneNumber => {
            let item = new UserReferralDbo;
            item.receiverPhoneNumber = phoneNumber;
            if (senderUserInfo.parentId == null) {
                item.message = "I'm helping my child become a financially capable self-starter. Create a GravyStack account to get your kid started, too!";
            }
            else {
                item.message = "I'm becoming a financially capable self-starter. Create a GravyStack account to get started, too!";
            }
            item.inviteCode = senderUserInfo.sharedCode;
            item.senderName = `${senderUserInfo.firstName} ${senderUserInfo.lastName}`;
            item.referralId = uuidV4();
            item.senderUserId = createUserReferral.senderUserId;
            item.createdDate = moment.utc().format('YYYY-MM-DD[T]HH:mm:ssZ');
            item.status = ReferralStatus.Invited;
            items.push(item);
        });
        return items;
    }

}