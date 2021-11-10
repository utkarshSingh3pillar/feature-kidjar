import { ConfirmRegistrationDto } from './dto/confirmRegistration.dto';
import { AddUserKYC, CreateUser, Document, LinkedBankAccountInfo } from './../synapse/dbo/user';
import { SynapseUserService } from './../synapse/services/user';
import { applyDecorators, BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthenticationDetails, CognitoRefreshToken, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';
import { UsersService } from 'src/users/users.service';
import { AutoVerifyRegisterRequestDto, KidsRegistrationResponseDto, LoginResponseDto, RefreshAccessTokenDto, RegisterKidRequestDto, RegistrationRequestDto } from './dto';
import { ConfirmPasswordDto, CreateForgotPasswordDto, SetPasswordForKidsWOEmailPhoneDto } from './dto/create-forgot-password.dto';
import { Preferences, User, UserStatus } from './../users/entities/user.entity';
const moment = require('moment-timezone/builds/moment-timezone-with-data-2012-2022');
var AWS = require('aws-sdk');
import config = require('@tsmx/secure-config');

import { JarSettingsDto } from 'src/users/dto/jar-value.dto';
import { resolve } from 'path';
import { reject } from 'lodash';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  private sessionUserAttributes: {};
  constructor(private readonly userService: UsersService,
    private readonly synapseUserService: SynapseUserService
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.Cognito.userPoolId,
      ClientId: config.Cognito.clientId,
    });
    AWS.config.update({
      accessKeyId: config.AWS.accessKeyId,
      secretAccessKey: config.AWS.secretAccessKey,
      region: config.AWS.region,
      sslEnabled: false,
      paramValidation: false,
      convertResponseTypes: false
    });
  }

  async registerUser(registerRequestDto: RegistrationRequestDto) {
    let user = new User();
    user.username = registerRequestDto.username;
    user.phoneNumber = registerRequestDto.phoneNumber;
    user.emailId = registerRequestDto.email;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (!isUserAlreadyExists.success) {
      return new Promise((resolve, reject) => {
        return this.userPool.signUp(
          registerRequestDto.username,
          registerRequestDto.password,
          [new CognitoUserAttribute({ Name: 'name', Value: `${registerRequestDto.firstName} ${registerRequestDto.lastName}` }),
          new CognitoUserAttribute({ Name: 'email', Value: registerRequestDto.email }),
          new CognitoUserAttribute({ Name: 'birthdate', Value: moment(registerRequestDto.birthDate).format('YYYY-MM-DD') }),
          new CognitoUserAttribute({ Name: 'phone_number', Value: registerRequestDto.phoneNumber })
          ],
          null,
          async (err, result) => {
            if (!result) {
              reject(new BadRequestException({ ...err, description: 'User registration failed.' }));
            } else {
              let user = new User();
              user.userId = result.userSub;
              user.userStatus = UserStatus.PENDING;
              user.firstName = registerRequestDto.firstName;
              user.lastName = registerRequestDto.lastName;
              user.emailId = registerRequestDto.email;
              user.birthDate = moment.utc(registerRequestDto.birthDate).format('YYYY-MM-DDTHH:mm:ssZ');
              user.phoneNumber = registerRequestDto.phoneNumber;
              user.username = registerRequestDto.username;
              await this.userService.create(user);
              resolve(result);
            }
          },
        );
      });
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'User registration failed.'
      })
    }
  }

  async registerKidsAccount(registerRequestDto: RegisterKidRequestDto, paymentUserId: string) {
    let user = new User();
    user.username = registerRequestDto.username;
    if (registerRequestDto.email != null) user.emailId = registerRequestDto.email;
    if (registerRequestDto.phoneNumber != null) user.phoneNumber = registerRequestDto.phoneNumber;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (!isUserAlreadyExists.success) {
      return new Promise((resolve, reject) => {
        let base = this;
        var attributeList = [];
        attributeList.push(new CognitoUserAttribute({ Name: "email", Value: registerRequestDto.email != '' ? registerRequestDto.email : '' }));
        attributeList.push(new CognitoUserAttribute({ Name: "phone_number", Value: registerRequestDto.phoneNumber != '' ? registerRequestDto.phoneNumber : '' }));
        attributeList.push(new CognitoUserAttribute({ Name: "name", Value: `${registerRequestDto.firstName} ${registerRequestDto.lastName}` }));
        attributeList.push(new CognitoUserAttribute({ Name: "birthdate", Value: moment(registerRequestDto.birthDate).format('YYYY-MM-DD') }));
        this.userPool.signUp(registerRequestDto.username, registerRequestDto.password,
          attributeList, null, function (err, result) {
            if (err) {
              console.log(err, err.stack);
              reject(new BadRequestException({ ...err, description: 'User registration failed.' }));
            }
            else {
              var confirmParams = {
                UserPoolId: config.Cognito.userPoolId,
                Username: registerRequestDto.username
              };
              // Confirm the user

              AWS.config.constructor({
                accessKeyId: config.AWS.accessKeyId,
                secretAccessKey: config.AWS.secretAccessKey,
                region: config.AWS.region
              });
              var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(base.userPool);
              cognitoidentityserviceprovider.adminConfirmSignUp(confirmParams, async function (err, confirmResult) {
                if (err) {
                  console.log(err, err.stack);
                  reject({ ...err, description: 'User registration failed.' });
                }
                else {
                  const jarBucketSettings = { "spend": 20, "save": 70, "share": 10 };
                  let preferences = new Preferences();
                  preferences.jarBucketSettings = jarBucketSettings as JarSettingsDto;
                  let user = new User();
                  user.userId = result.userSub;
                  user.userStatus = UserStatus.ACTIVE;
                  user.firstName = registerRequestDto.firstName;
                  user.lastName = registerRequestDto.lastName;
                  user.emailId = registerRequestDto.email;
                  user.birthDate = moment.utc(registerRequestDto.birthDate).format('YYYY-MM-DDTHH:mm:ssZ');
                  user.username = registerRequestDto.username;
                  user.parentId = registerRequestDto.parentId;
                  user.phoneNumber = registerRequestDto.phoneNumber;
                  user.preferences = preferences;
                  if (user.emailId != null && user.phoneNumber != null) {
                    try {
                      await base.autoverifiedEmailPhoneAttribute({ username: user.username });
                    }
                    catch (ex) {
                      console.log(ex);
                    }
                  } else {
                    if (user.emailId != null) {
                      try {
                        await base.autoverifiedEmailAttribute({ username: user.username });
                      }
                      catch (ex) {
                        console.log(ex);
                      }
                    }
                    if (user.phoneNumber != null) {
                      try {
                        await base.autoverifiedPhoneNumber({ username: user.username });
                      }
                      catch (ex) {
                        console.log(ex);
                      }
                    }
                  }
                  let userResult = await base.userService.create(user);
                  if (paymentUserId) {
                    let synapseKidUserResult = await base.createSynapseKidUser(paymentUserId, userResult, { ipAddress: registerRequestDto.ipAddress })

                    let patchUser = {
                      paymentUserId: paymentUserId,
                      paymentDocumentId: synapseKidUserResult.documentId,
                      saveAccountId: synapseKidUserResult.save.data.nodes[0]._id,
                      shareAccountId: synapseKidUserResult.share.data.nodes[0]._id,
                      spendAccountId: synapseKidUserResult.spend.data.nodes[0]._id
                    }

                    await base.userService.update(userResult.userId, patchUser);
                  }
                  let finalResult = new KidsRegistrationResponseDto();
                  finalResult.username = user.username;
                  finalResult.userId = result.userSub;
                  finalResult.userStatus = UserStatus.ACTIVE;
                  resolve(finalResult);
                }
              });
            }

          });
      });
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'User registration failed.'
      })
    }
  }

  async resendVerifyCode(confirmRegisterRequest: { username: string }) {
    var cognitoUser = new CognitoUser({
      Username: confirmRegisterRequest.username,
      Pool: this.userPool
    });

    let user = new User();
    user.username = confirmRegisterRequest.username;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '2') {
      return new Promise((resolve, reject) => {

        return cognitoUser.resendConfirmationCode(async (err, result) => {
          if (!result) {
            reject(new BadRequestException({ ...err, description: 'User resend verify code failed.' }));
          } else {
            const res = {
              deliveryMedium: result.CodeDeliveryDetails.DeliveryMedium,
              destination: result.CodeDeliveryDetails.Destination
            }
            resolve(res);
          }
        },
        );
      });
    }
    else if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '1') {
      throw new BadRequestException({
        message: 'User is already confirmed.',
        description: 'User resend verify code failed.'
      })
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'User resend verify code failed.'
      })
    }
  }

  async linkBankAccount(userId: string, paymentUserId: string) {
    let info: LinkedBankAccountInfo = {
      account_num: '12322134',
      routing_num: '051000017',
      type: 'PERSONAL',
      class: 'CHECKING'
    }
    let synapseParentUser = await this.synapseUserService.getUser(paymentUserId);
    let synapseUserCreationResult = await this.synapseUserService.linkBankAccount(userId, synapseParentUser, info);
    let patchUser = {
      achAccountId: synapseUserCreationResult.ach.data.nodes[0]._id,
    }

    await this.userService.update(userId, patchUser);
    return synapseUserCreationResult;
  }

  async confirmRegistration(confirmRegisterRequest: ConfirmRegistrationDto) {
    var cognitoUser = new CognitoUser({
      Username: confirmRegisterRequest.username,
      Pool: this.userPool
    });



    let user = new User();
    user.username = confirmRegisterRequest.username;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '2') {
      return new Promise((resolve, reject) => {

        return cognitoUser.confirmRegistration(confirmRegisterRequest.code, false, async (err, result) => {
          if (!result) {
            reject(new BadRequestException({ ...err, description: 'User confirm registration failed.' }));
          } else {
            const userData = {
              Username: confirmRegisterRequest.username,
              Pool: this.userPool,
            };
            //getUserData
            try {
              let cognitoUserData: any = await this.getCognitoUserData({ username: confirmRegisterRequest.username });
              try {
                if (cognitoUserData.UserAttributes.filter(c => c.Name == 'email_verified')[0].Value) {
                  await this.autoverifiedEmailAttribute({ username: confirmRegisterRequest.username });
                }
              } catch (error) {
                console.log(error);
              }
            } catch (error) {
              console.log(error);
            }

            let synapseUserCreationResult = await this.createSynapseParentUser(isUserAlreadyExists.user, { ipAddress: confirmRegisterRequest.ipAddress });
            await this.userService.update(isUserAlreadyExists.user.userId, {
              userStatus: UserStatus.ACTIVE,
              paymentUserId: synapseUserCreationResult?.id,
              paymentDocumentId: synapseUserCreationResult?.body.documents[0].id
            })
            // const synapseParentUserId = new CognitoUserAttribute({
            //   Name: "synapseParentUserId",
            //   Value: synapseUserCreationResult?.id
            // });
            // const synapseParentAccountId = new CognitoUserAttribute({
            //   Name: "synapseParentNodeId",
            //   Value: ""
            // });
            // const synapseParentDocumentId = new CognitoUserAttribute({
            //   Name: "synapseParentDocumentId",
            //   Value: synapseUserCreationResult?.body.documents[0].id
            // });

            // cognitoUser.updateAttributes([synapseParentUserId, synapseParentAccountId, synapseParentDocumentId], function (err, result) {
            // });
            //TODO:
            resolve(true);
          }
        },
        );
      });
    }
    else if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '1') {
      throw new BadRequestException({
        message: 'User is already confirmed.',
        description: 'User confirm registration failed.'
      })
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'User confirm registration failed.'
      })
    }
  }

  async createSynapseParentUser(appUser: User, extraInfo: any) {
    if (!appUser.parentId) {
      let dobMoment = moment.utc(appUser.birthDate);

      let parentDocument: Document = {
        email: appUser.emailId,
        phone_number: appUser.phoneNumber,
        ip: extraInfo.ipAddress,
        name: `${appUser.firstName + ' ' + appUser.lastName}`,
        alias: `${appUser.firstName + ' ' + appUser.lastName}`,
        entity_type: 'M',
        entity_scope: 'Arts & Entertainment',
        day: parseInt(dobMoment.format('DD')),
        month: parseInt(dobMoment.format('MM')),
        year: parseInt(dobMoment.format('YYYY')),
        address_street: 'C',
        address_city: 'Noida',
        address_subdivision: 'UP',
        address_postal_code: '243122',
        address_country_code: 'IN',
        virtual_docs: [{
          document_value: "2222",
          document_type: "SSN",
        }],
        physical_docs: [
          {
            document_value: "data:image/gif;base64,SUQs==",
            document_type: "GOVT_ID"
          },
          {
            document_value: "data:image/gif;base64,SUQs==",
            document_type: "GOVT_ID_BACK",
          }
        ],
        social_docs: [
          {
            document_value: "101 2nd St. STE 1500 SF CA US 94105",
            document_type: "MAILING_ADDRESS"
          }
        ],
        docs_key: null
      }
      let synapseUser: CreateUser = {
        logins: [{ email: parentDocument.email }],
        phone_numbers: [parentDocument.phone_number],
        legal_names: [parentDocument.name],
        documents: [parentDocument],
        extra: {
          "supp_id": appUser.userId,
          "env": config.env.NODE_ENV,
          "gravystackUserId": appUser.userId,
          "cip_tag": 1,
          "is_business": false
        }
      }
      return await this.synapseUserService.createUser(synapseUser);
    }
    else {
      return null;
    }
  }

  async createSynapseKidUser(paymentUserId: string, appUser: User, extraInfo: any) {
    if (appUser.parentId) {
      let synapseParentUser = await this.synapseUserService.getUser(paymentUserId);
      let dobMoment = moment.utc(appUser.birthDate);

      let childDocument: Document = {
        email: appUser.emailId,
        phone_number: appUser.phoneNumber,
        ip: extraInfo.ipAddress,
        name: `${appUser.firstName + ' ' + appUser.lastName}`,
        alias: `${appUser.firstName + ' ' + appUser.lastName}`,
        entity_type: 'MINOR',
        entity_scope: 'Education',
        day: parseInt(dobMoment.format('DD')),
        month: parseInt(dobMoment.format('MM')),
        year: parseInt(dobMoment.format('YYYY')),
        address_street: 'C',
        address_city: 'Noida',
        address_subdivision: 'UP',
        address_postal_code: '243122',
        address_country_code: 'IN',
        docs_key: 'CHILD_DOCS'
      }
      let documents = [childDocument]
      let createKidUser: AddUserKYC = {
        documents: documents,
      }
      return await this.synapseUserService.addUserKYC(appUser.userId, synapseParentUser, createKidUser);
    }
    else {
      return null;
    }
  }

  async autoVerifyUser(autoverifyUserRequest: AutoVerifyRegisterRequestDto) {
    let base = this;
    var confirmParams = {
      UserPoolId: config.Cognito.userPoolId,
      Username: autoverifyUserRequest.username
    };
    // Confirm the user
    AWS.config.constructor({
      accessKeyId: config.AWS.accessKeyId,
      secretAccessKey: config.AWS.secretAccessKey,
      region: config.AWS.region
    });

    let userCheckInDb = new User();
    userCheckInDb.username = autoverifyUserRequest.username;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(userCheckInDb);
    if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '2') {
      await this.userService.updateUserStatusToConfirm(autoverifyUserRequest.username, { userStatus: UserStatus.ACTIVE });
      return new Promise((resolve, reject) => {
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(base.userPool);
        cognitoidentityserviceprovider.adminConfirmSignUp(confirmParams, async function (err, confirmResult) {
          if (err) {
            console.log(err, err.stack);
            reject(err);
          }
          else {
            // else {
            resolve({
              message: "User is verified successfully."
            });
            //}
          }
        });
      });
    }
    else if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '1') {
      throw new BadRequestException({
        message: 'User is already confirmed.'
      })
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message
      })
    }
  }

  autoverifiedEmailPhoneAttribute(user: { username: string; }) {
    var poolData = {
      UserPoolId: config.Cognito.userPoolId,
      ClientId: config.Cognito.clientId,
      Region: config.AWS.region,
    };

    return new Promise((resolve, reject) => {
      AWS.config.constructor({
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
        region: config.AWS.region
      });
      var userPool = new AWS.CognitoIdentityServiceProvider(poolData);

      var params = {
        UserAttributes: [ /* required */
          {
            Name: 'email_verified', /* required */
            Value: 'true'
          },
          {
            Name: 'phone_number_verified', /* required */
            Value: 'true'
          }
          /* more items */
        ],
        UserPoolId: config.Cognito.userPoolId, /* required */
        Username: user.username
      };

      userPool.adminUpdateUserAttributes(params, function (err, data) {
        if (err) {
          console.log(err);
          console.log(err, err.stack);
          reject(err);
        } // an error occurred
        else {
          console.log(data);
          console.log(data);
          resolve(data);
        }          // successful response)
      });

    });

  }

  autoverifiedEmailAttribute(user: { username: string; }) {
    var poolData = {
      UserPoolId: config.Cognito.userPoolId,
      ClientId: config.Cognito.clientId,
      Region: config.AWS.region,
    };

    return new Promise((resolve, reject) => {
      AWS.config.constructor({
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
        region: config.AWS.region
      });
      var userPool = new AWS.CognitoIdentityServiceProvider(poolData);

      var params = {
        UserAttributes: [ /* required */
          {
            Name: 'email_verified', /* required */
            Value: 'true'
          },
          /* more items */
        ],
        UserPoolId: config.Cognito.userPoolId, /* required */
        Username: user.username
      };

      userPool.adminUpdateUserAttributes(params, function (err, data) {
        if (err) {
          console.log(err);
          console.log(err, err.stack);
          reject(err);
        } // an error occurred
        else {
          console.log(data);
          console.log(data);
          resolve(data);
        }          // successful response)
      });

    });

  }
  autoverifiedPhoneNumber(user: { username: string; }) {
    var poolData = {
      UserPoolId: config.Cognito.userPoolId,
      ClientId: config.Cognito.clientId,
    };

    return new Promise((resolve, reject) => {
      AWS.config.constructor({
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
        region: config.AWS.region
      });
      var userPool = new AWS.CognitoIdentityServiceProvider(poolData);

      var params = {
        UserAttributes: [ /* required */
          {
            Name: 'phone_number_verified', /* required */
            Value: 'true'
          },
          /* more items */
        ],
        UserPoolId: config.Cognito.userPoolId, /* required */
        Username: user.username
      };

      userPool.adminUpdateUserAttributes(params, function (err, data) {
        if (err) {
          console.log(err);
          console.log(err, err.stack);
          reject(err);
        } // an error occurred
        else {
          console.log(data);
          console.log(data);
          resolve(data);
        }          // successful response)
      });

    });

  }
  getCognitoUserData(user: { username: string; }) {
    var poolData = {
      UserPoolId: config.Cognito.userPoolId,
      ClientId: config.Cognito.clientId,
    };

    return new Promise((resolve, reject) => {
      AWS.config.constructor({
        accessKeyId: config.AWS.accessKeyId,
        secretAccessKey: config.AWS.secretAccessKey,
        region: config.AWS.region
      });
      var userPool = new AWS.CognitoIdentityServiceProvider(poolData);

      var params = {
        UserPoolId: config.Cognito.userPoolId, /* required */
        Username: user.username
      };

      userPool.adminGetUser(params, function (err, data) {
        if (err) {
          console.log(err);
          console.log(err, err.stack);
          reject(err);
        } // an error occurred
        else {
          console.log(data);
          console.log(data);
          resolve(data);
        }          // successful response)
      });

    });

  }

  async authenticateUser(user: { username: string; password: string }): Promise<LoginResponseDto> {
    const { username, password } = user;

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });
    const userData = {
      Username: username,
      Pool: this.userPool,
    };

    const newUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return newUser.authenticateUser(authenticationDetails, {
        onSuccess: async result => {
          const userInfo = await this.userService.findOne(result.getIdToken().decodePayload().sub);
          let finalResult: LoginResponseDto = {
            userInfo: userInfo,
            ticket: {
              "idToken": result.getIdToken().getJwtToken(),
              //"access_token": result.getAccessToken().getJwtToken(),
              "tokenType": "Bearer",
              "expires": result.getIdToken().getExpiration(),
              "refreshToken": result.getRefreshToken().getToken(),
              "issued": result.getIdToken().getIssuedAt()
            }
          }
          resolve(finalResult);
        },
        onFailure: err => {
          if (err.code == 'NotAuthorizedException')
            reject(new BadRequestException({ ...err, description: 'Login Failed.' }));
          else
            reject(new InternalServerErrorException({ ...err, description: 'Login Failed.' }));
        },
      });
    });
  }

  async refreshAccessToken(refreshAccessTokenDto: RefreshAccessTokenDto) {
    var refreshToken = new CognitoRefreshToken({ RefreshToken: refreshAccessTokenDto.refreshToken });

    var cognitoUser = new CognitoUser({
      Username: refreshAccessTokenDto.username,
      Pool: this.userPool
    });
    let user = new User();
    user.username = refreshAccessTokenDto.username;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (isUserAlreadyExists.success) {
      return new Promise((resolve, reject) => {
        return cognitoUser.refreshSession(refreshToken, (err, session) => {
          if (err) {
            reject(new BadRequestException({ ...err, description: 'Refresh access token failed.' }));
          } else {
            console.log(session);
            const res = {
              idToken: session.idToken.jwtToken,
              "tokenType": "Bearer",
              "expires": session.getIdToken().getExpiration(),
              refreshToken: session.refreshToken.token,
              "issued": session.getIdToken().getIssuedAt()
            };
            resolve(res);
          }
        });
      });
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'Refresh access token failed.'
      })
    }
  }

  async forgotPassword(createForgotPasswordDto: CreateForgotPasswordDto) {

    var cognitoUser = new CognitoUser({
      Username: createForgotPasswordDto.username,
      Pool: this.userPool
    });
    let user = new User();
    user.username = createForgotPasswordDto.username;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (!isUserAlreadyExists.user.phoneNumber && !isUserAlreadyExists.user.emailId &&
      isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '1') {
      let parentId = isUserAlreadyExists.user.parentId;
      let user = await this.userService.findOne(parentId);
      return new Promise((resolve, reject) => {
        let requestId = Buffer.from(isUserAlreadyExists.user.userId).toString('base64');
        this.sendSMSToParent(user, isUserAlreadyExists.user.username, requestId).then(res => {
          const response = {
            message: "Request sent!  Check the new password with your parent.",
            requestId: requestId
          }

          resolve(response);
        });
      })
    }
    else if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '1') {
      return new Promise((resolve, reject) => {
        cognitoUser.forgotPassword({
          onSuccess: result => {
            console.log(result);
            const res = {
              deliveryMedium: result.CodeDeliveryDetails.DeliveryMedium,
              destination: result.CodeDeliveryDetails.Destination
            }
            resolve(res);
          },
          onFailure: err => {
            reject(new BadRequestException({ ...err, description: 'Forgot password failed.' }));
          },
        });
      });
    }
    else if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '2') {
      throw new BadRequestException({
        message: 'User is not confirmed yet.',
        description: 'Forgot password failed.'
      })
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'Forgot password failed.'
      })
    }
  }

  async sendSMSToParent(user: User, kidName: string, requestId: string) {
    let textMessage = `${kidName} forgot their GravyStack password. Click here to it for them. Once you've reset it, tell them the new password so they can get to earning and learning!`;
    let appLink = 'https://apps.apple.com/ro/app/google/id284815942';
    var params = {
      Protocol: 'SMS',
      Message: `${textMessage} , ${appLink} ?requestId=${requestId}`,
      PhoneNumber: user.phoneNumber
    };

    return new AWS.SNS({ apiVersion: `2010–03–31` }).publish(params).promise();
  }

  async setPasswordForKidsWOEmailPhone(setForgotPasswordDto: SetPasswordForKidsWOEmailPhoneDto) {

    const userId = Buffer.from(setForgotPasswordDto.requestId, 'base64').toString();
    let user = new User();
    user.username = setForgotPasswordDto.username;
    await this.userService.isUserAlreadyExists(user).then(res => {
      if (userId != res.user.userId) {
        throw new BadRequestException({
          message: "Request Id is not valid.",
          description: "Request Id is not valid."
        })
      }
    });
    var params = {
      Password: setForgotPasswordDto.newPassword, /* required */
      UserPoolId: config.Cognito.userPoolId, /* required */
      Username: setForgotPasswordDto.username, /* required */
      Permanent: true
    };
    let base = this;
    AWS.config.constructor({
      accessKeyId: config.AWS.accessKeyId,
      secretAccessKey: config.AWS.secretAccessKey,
      region: config.AWS.region
    });

    return new Promise((resolve, reject) => {
      var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(base.userPool);
      cognitoidentityserviceprovider.adminSetUserPassword(params, async function (err, confirmResult) {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        }
        else {
          // else {
          resolve(true);
          //}
        }
      });
    });
  }

  async confirmPassword(confirmPasswordDto: ConfirmPasswordDto) {

    var cognitoUser = new CognitoUser({
      Username: confirmPasswordDto.username,
      Pool: this.userPool
    });

    let user = new User();
    user.username = confirmPasswordDto.username;
    const isUserAlreadyExists = await this.userService.isUserAlreadyExists(user);
    if (isUserAlreadyExists.success && isUserAlreadyExists.userStatus == '1') {
      return new Promise((resolve, reject) => {
        cognitoUser.confirmPassword(confirmPasswordDto.code, confirmPasswordDto.newPassword, {
          onFailure(err) {
            reject(new BadRequestException({ ...err, description: 'Confirm password failed.' }));
          },
          onSuccess() {
            resolve(true);
          },
        });
      });
    }
    else {
      throw new BadRequestException({
        message: isUserAlreadyExists.message,
        description: 'Confirm password failed.'
      })
    }
  }

  async logOut(user: { username: string; }) {
    let base = this;
    let cognitoUser = new CognitoUser({
      Username: user.username,
      Pool: this.userPool
    });
    return new Promise(async (resolve, reject) => {
      try {
        if (cognitoUser !== null) {
          cognitoUser.signOut();
        }
        resolve(true);
      }
      catch (ex) {
        reject(ex.message);
      }
    });
  }

}
