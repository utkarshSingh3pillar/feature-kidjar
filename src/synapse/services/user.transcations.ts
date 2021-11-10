import { Injectable } from "@nestjs/common";
import { CreateUserAccount } from "../dbo/account";
import { CreateTransaction } from "../dbo/transactions";
import { SynapseClient } from "./client";

@Injectable()
export class UserTranscations extends SynapseClient {
    constructor() {
        super();
    }

    createTrans = async (synapseUser: any, accountId: string, createTransaction: CreateTransaction) => {
        try {
            const result = await synapseUser.createTransaction(accountId, createTransaction);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    getTransDetailByAccTranscationId = async (synapseUser: any, accountId: string, transcationId: string) => {
        try {
            return await synapseUser.getTransaction(accountId, transcationId);
        } catch (error) {

        }
    }
    getAllTransByAccountId = async (synapseUser: any, accountId: string) => {
        try {
            return await synapseUser.getAllNodeTransactions(accountId);
        } catch (error) {

        }
    }

    getAllTransByUser = async (synapseUser: any) => {
        try {
            return await synapseUser.getUserTransactions();
        } catch (error) {

        }
    }
    deleteTransaction = async (synapseUser: any, accountId: string, transcationId: string) => {
        try {
            const result = await synapseUser.deleteTransaction(accountId, transcationId);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    commentOnTransaction = async (synapseUser: any, accountId: string, transcationId: string, message: string) => {
        try {
            const result = await synapseUser.commentOnStatus(accountId, transcationId, {
                comment: message
            });
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }


}