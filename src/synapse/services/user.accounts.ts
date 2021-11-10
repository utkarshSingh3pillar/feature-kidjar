import { Injectable } from "@nestjs/common";
import { CreateUserAccount } from "../dbo/account";
import { SynapseClient } from "./client";

@Injectable()
export class SynapseUserAccountsService extends SynapseClient {
    constructor() {
        super();
    }

    createUserAccount = async (synapseUser: any, createUserAccount: CreateUserAccount) => {
        try {
            let result = await synapseUser.createNode(createUserAccount)
            return result;
        } catch (error) {

        }
    }
    getUserAccounts = async (synapseUser: any) => {
        try {
            return await synapseUser.getAllUserNodes();
        } catch (error) {

        }

    }
    getUserAccount = async (synapseUser: any, nodeId: string) => {
        try {
            return await synapseUser.getNode(nodeId);
        } catch (error) {
            console.log(error);
        }

    }


}