import { Injectable } from "@nestjs/common";
import _ = require("lodash");
import { Address } from "../dbo";
import { CreateUserAccount } from "../dbo/account";
import { AddUserKYC, CreateUser, LinkedBankAccountInfo } from "../dbo/user";
import { SynapseClient } from "./client";
import { SynapseUserAccountsService } from "./user.accounts";

@Injectable()
export class SynapseUserService extends SynapseClient {
    constructor(private readonly accountService: SynapseUserAccountsService) {
        super();
    }
    createUser = async (createUser: CreateUser) => {

        try {
            const synapseUserResult = await this.client.createUser({
                logins: createUser.logins,
                phone_numbers: createUser.phone_numbers,
                legal_names: createUser.phone_numbers,
                documents: createUser.documents,
                extra: createUser.extra
            },
                '127.0.0.1'
            );
            console.log(JSON.stringify(synapseUserResult));
            return synapseUserResult;
        } catch (error) {
            console.log(error);
        }
    }

    linkBankAccount = async (userId: string, synapseUser: any, info: LinkedBankAccountInfo) => {
        try {
            let linkBankAccount: CreateUserAccount = {
                type: "ACH-US",
                info: {
                    nickname: `ACH-${userId}`,
                    "account_num": info.account_num,
                    "routing_num": info.routing_num,
                    "type": info.type,
                    "class": info.class
                }
            }
            let linkBankAccResult = await this.accountService.createUserAccount(synapseUser, linkBankAccount);
            console.log(linkBankAccResult);
            return {
                ach: linkBankAccResult,
            };
        } catch (error) {

        }
    }

    addUserKYC = async (userId: string, synapseUser: any, addKidsUser: AddUserKYC) => {

        try {
            const addUserKYCResult = await synapseUser.addUserKyc({
                documents: addKidsUser.documents,
            });
            let documentId: string = _.result(_.find(addUserKYCResult.data.documents, c => c.name == addKidsUser.documents[0].name), 'id');

            let accountNodeResult = await this.createGravyStackAccs(userId, synapseUser, documentId.toString());

            return {
                ...accountNodeResult,
                synapseUser: addUserKYCResult,
                documentId: documentId
            };
        } catch (error) {
            console.log(error);
        }
    }

    createGravyStackAccs = async (userId: string, synapseUser: any, documentId: string) => {
        try {
            let spendAcc: CreateUserAccount = {
                type: "IC-DEPOSIT-US",
                info: {
                    nickname: `Spend-${userId}`,
                    document_id: documentId
                }
            }

            let saveAcc: CreateUserAccount = {
                type: "IB-DEPOSIT-US",
                info: {
                    nickname: `Save-${userId}`,
                    document_id: documentId
                }
            }

            let shareAcc: CreateUserAccount = {
                type: "IC-DEPOSIT-US",
                info: {
                    nickname: `Share-${userId}`,
                    document_id: documentId
                }
            }
            let createSpendAccResult = await this.accountService.createUserAccount(synapseUser, spendAcc);
            let createSaveAccResult = await this.accountService.createUserAccount(synapseUser, saveAcc);
            let createShareAccResult = await this.accountService.createUserAccount(synapseUser, shareAcc);

            // let [createSpendAccResult, createSaveAccResult, createShareAccResult] =
            //     await Promise.all([await this.accountService.createUserAccount(synapseUser, spendAcc),
            //     await this.accountService.createUserAccount(synapseUser, saveAcc),
            //     await this.accountService.createUserAccount(synapseUser, shareAcc)]
            //     )

            return {
                spend: createSpendAccResult,
                save: createSaveAccResult,
                share: createShareAccResult
            };
        } catch (error) {
            console.log(error);
        }
    }

    addKidUserAccountWithKYC = async (synapseUser: any, addKidsUser: AddUserKYC) => {

        try {
            const addUserKYCResult = await synapseUser.addUserKyc({
                documents: addKidsUser.documents,
            });


            return addUserKYCResult;
        } catch (error) {
            console.log(error);
        }
    }


    getUser = async (userId: string) => {
        try {
            let result = await this.client.getUser(userId);
            console.log(result);
            return result;
        } catch (error) {

        }
    }

    verifyRoutingNumber = async (routingNumber: string, type: string) => {
        try {
            const result = await this.client.verifyRoutingNumber({
                "routing_num": routingNumber,
                "type": type
            });
            console.log(result);
            return result;
        } catch (error) {

        }

    }

    verifyAddress = async (address: Address) => {
        try {
            const result = await this.client.verifyAddress({
                "address_street": address.street,
                "address_city": address.city,
                "address_subdivision": address.subDivision,
                "address_country_code": address.countryCode,
                "address_postal_code": address.postalCode
            });
            console.log(result);
            return result;
        } catch (error) {

        }
    }

}

@Injectable()
export class Transcations extends SynapseClient {

}




