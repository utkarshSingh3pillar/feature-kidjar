import { UserDbo } from './../shared/DB/users/dbo/user.dbo';
import {
  applyDecorators,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDbRepository } from 'src/shared/DB/users/UserDbRepository';
import { User } from './entities/user.entity';
import { JarSettingsDto } from './dto/jar-value.dto';
import { CreateUserGoalDto } from './dto/create-user-goal.dto';
import { GoalStatus } from './entities/usergoal.entity';
import { UpdateUserGoalDto } from '../users/dto/update-user-goal.dto';
import { UserGoalDbo } from '../shared/DB/users/dbo/usergoal.dbo';
import { UserGoalsDbRepository } from 'src/shared/DB/users/UserGoalsDbRepository';
import AWS = require('aws-sdk');
import config = require('@tsmx/secure-config');
import moment = require('moment');
import uuidV4 = require('uuid/v4');
import { RequestRegistrationRequestDto } from '../auth/dto';
import { SNS } from 'aws-sdk';
import { SynapseUserService } from './../synapse/services/user';
import { SynapseUserAccountsService } from './../synapse/services/user.accounts';
import { UserTranscations } from './../synapse/services/user.transcations';
import { JarTransactionsDto } from './dto/kidJar.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userDbRepository: UserDbRepository,
    private readonly usergoalsDbRepository: UserGoalsDbRepository,
    private readonly synapseUserService: SynapseUserService,
    private readonly synapseUserAccountsService: SynapseUserAccountsService,
    private readonly synapseUserTransactionsService: UserTranscations,
  ) {}
  async create(user: User) {
    let data = await this.userDbRepository.createUser(user);
    return data;
  }

  async update(userId: string, patchUser: any) {
    let data = await this.userDbRepository.updateUser(patchUser, userId);
    return data;
  }

  async isUserAlreadyExists(user: User) {
    let data = await this.userDbRepository.isUserAlreadyExists(user);
    return data;
  }

  async isCategoryExist(categoryId: string) {
    let data = await this.usergoalsDbRepository.isCategoryExist(categoryId);
    return data;
  }

  async findOne(id: string) {
    return await this.userDbRepository.getUserData(id);
  }

  async kidJarSummary(paymentUserId: string, NodeId: string) {
    const user = await this.synapseUserService.getUser(paymentUserId);
    let accounts = await this.synapseUserAccountsService.getUserAccount(
      user,
      NodeId,
    );
    return await accounts.data.info.balance.amount;
  }

  async kidJarTransactions(
    paymentUserId: string,
    NodeId: string,
    transactionsFilter: JarTransactionsDto,
  ) {
    const user = await this.synapseUserService.getUser(paymentUserId);
    let transactionsdata = await this.synapseUserTransactionsService.getAllTransByAccountId(
      user,
      NodeId,
    );
    let transactions = transactionsdata.data.trans;
    let result = [];
    for (let key in transactions) {
      if (
        transactionsFilter.type === 'INCOMING' &&
        transactions[key].to.id === NodeId
      ) {
        result.push({
          id: transactions[key]._id,
          name:transactions[key].note || 'dummy',
          amount: transactions[key].amount.amount,
          status: transactions[key].recent_status.status,
          date: moment(transactions[key].recent_status.date).format(
            'YYYY-MM-DD[T]HH:mm:ssZ',
          ),
        });
      }
      if (
        transactionsFilter.type === 'OUTGOING' &&
        transactions[key].from.id === NodeId
      ) {
        result.push({
          id: transactions[key]._id,
          name:transactions[key].note || 'dummy',
          amount: transactions[key].amount.amount,
          status: transactions[key].recent_status.status,
          date: moment(transactions[key].recent_status.date).format(
            'YYYY-MM-DD[T]HH:mm:ssZ',
          ),
        });
      }
    }

    return await result;
  }

  async findOneGoal(goalId: string) {
    let goalData = await this.usergoalsDbRepository.getGoalData(goalId);
    if (goalData) {
      let goalCategory = await this.usergoalsDbRepository.getCategoryById(
        goalData.categoryId,
      );
      delete goalData.categoryId;
      goalData['category'] = goalCategory;
    }
    return goalData;
  }

  async updateUserStatusToConfirm(
    username: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user = updateUserDto as User;
    let data = await this.userDbRepository.updateUserStatusToConfirm(
      username,
      user,
    );
    return data;
  }

  async addAvatar(userId: string, imageBuffer: Buffer, filename: string) {
    try {
      AWS.config.update({
        region: config.AWS.region,
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
      });
      const s3 = new AWS.S3();
      const uploadResult = await s3
        .upload({
          Bucket: config.S3.bucketName,
          Body: imageBuffer,
          Key: `profile/${userId}/${filename}`,
          ACL: 'public-read',
        })
        .promise();

      return await this.userDbRepository.updateUserAvatar(
        userId,
        uploadResult.Location,
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  async getPreferences(userId: string) {
    const result = await this.userDbRepository.getPreferences(userId);
    return result != '' ? JSON.parse(result) : {};
  }

  async updateJarValues(userId: string, jarValue: JarSettingsDto) {
    return await this.userDbRepository.updateJarValues(userId, jarValue);
  }

  async createUserGoal(createUserGoal: CreateUserGoalDto) {
    let userGoalDbo = this.mapCreateUserGoalToUserGoalDbo(createUserGoal);
    let data = await this.usergoalsDbRepository.createUserGoal(userGoalDbo);
    return data;
  }

  mapCreateUserGoalToUserGoalDbo(createUserGoal: CreateUserGoalDto) {
    let item = new UserGoalDbo();
    item.userGoalId = uuidV4();
    item.goalName = createUserGoal.name;
    item.categoryId = createUserGoal.categoryId;
    item.type = createUserGoal.type;
    item.startDate = moment.utc().format('YYYY-MM-DD[T]HH:mm:ssZ');
    item.targetDate = moment
      .utc(createUserGoal.targetDate)
      .format('YYYY-MM-DD[T]HH:mm:ssZ');
    item.userId = createUserGoal.userId;
    item.amount = createUserGoal.amount;
    item.status = GoalStatus.Active;
    item.completionDate = null;
    return item;
  }

  async findUserGoals(userId: string) {
    let userGoal = await this.usergoalsDbRepository.getAllUserGoals(userId);
    let categories = await this.usergoalsDbRepository.getAllCategories();
    userGoal.forEach(element => {
      element['category'] = categories.find(x => x.id == element.categoryId);
      delete element.categoryId;
    });
    return userGoal;
  }

  async updateUserGoal(updateUserGoal: UpdateUserGoalDto, goalId) {
    let userGoal = this.mapUpdateUserGoalToUserGoal(updateUserGoal);
    let data = await this.usergoalsDbRepository.updateUserGoal(
      userGoal,
      goalId,
    );
    return data;
  }

  async deleteUserGoal(goalId: string) {
    let data = await this.usergoalsDbRepository.deleteUserGoal(goalId);
    return data;
  }

  mapUpdateUserGoalToUserGoal(updateUserGoal: UpdateUserGoalDto) {
    let item = new UserGoalDbo();
    if (updateUserGoal.name != null) item.goalName = updateUserGoal.name;
    if (updateUserGoal.categoryId != null)
      item.categoryId = updateUserGoal.categoryId;
    if (updateUserGoal.type != null) item.type = updateUserGoal.type;
    if (updateUserGoal.targetDate != null)
      item.targetDate = moment
        .utc(updateUserGoal.targetDate)
        .format('YYYY-MM-DD[T]HH:mm:ssZ');
    // if (updateUserGoal.completionDate != null) item.completionDate = moment.utc(updateUserGoal.completionDate)
    //   .format('YYYY-MM-DD[T]HH:mm:ssZ');
    if (updateUserGoal.amount != null) item.amount = updateUserGoal.amount;
    item.modifiedDate = moment.utc().format('YYYY-MM-DD[T]HH:mm:ssZ');
    return item;
  }

  validateModel(model, isUpdate) {
    let targetDate = moment(model.targetDate);
    let todayDate = moment(new Date());
    if (model.targetDate != undefined) {
      if (!targetDate.isValid() || todayDate.diff(targetDate) > 0) {
        throw new BadRequestException({
          message: 'Enter a valid target date.',
        });
      }
    }

    // if (model.completionDate != undefined) {
    //   let completionDate = moment(model.completionDate)
    //   if (!completionDate.isValid() || todayDate.diff(completionDate) >= 0) {
    //     throw new BadRequestException({ "message": "Enter a valid completion date" })
    //   }
    // }

    if (isUpdate) {
      if (model.amount != undefined && model.amount <= 0) {
        throw new BadRequestException({ message: 'Enter a valid amount.' });
      }
    } else {
      if (model.amount == null || model == undefined || model.amount <= 0) {
        throw new BadRequestException({ message: 'Enter a valid amount.' });
      }
    }
  }

  async forwardSignUpRequest(
    requestRegisterRequestDto: RequestRegistrationRequestDto,
  ) {
    const isParentExist = await this.checkIfParentExists(
      requestRegisterRequestDto.phoneNumber,
    );
    const textMessage = `I (${requestRegisterRequestDto.name}) want to learn to be a financially capable self-starter! Please open up a GravyStack account so I can get started! `;
    const appLink = 'https://apps.apple.com/ro/app/google/id284815942';
    const kidPageLink = 'https://www.apple.com/app-store';
    if (isParentExist) {
      var params: SNS.Types.PublishInput = {
        Message: `${textMessage} , ${kidPageLink}`,
        PhoneNumber: requestRegisterRequestDto.phoneNumber,
      };
    } else {
      params = {
        Message: `${textMessage} , ${appLink}`,
        PhoneNumber: requestRegisterRequestDto.phoneNumber,
      };
    }

    return new AWS.SNS({ apiVersion: `2010–03–31` }).publish(params).promise();
  }

  private async checkIfParentExists(phoneNumber: string) {
    return await this.userDbRepository.getUserByPhoneNumber(phoneNumber);
  }

  async getAllCategories() {
    return await this.usergoalsDbRepository.getAllCategories();
  }

  async getCategoryById(id: string) {
    return await this.usergoalsDbRepository.getCategoryById(id);
  }

  // async findKidByUsername(username: string) {
  //   return await this.userDbRepository.findKidData(username);
  // }

  async findParentById(userId: string) {
    return await this.userDbRepository.getUserData(userId);
  }
}
