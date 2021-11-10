import { Injectable } from "@nestjs/common";
import { CreateUserAccount } from "../dbo/account";
import { CreateSubnet, ShipCard } from "../dbo/subnet";
import { CreateTransaction } from "../dbo/transactions";
import { SynapseClient } from "./client";

@Injectable()
export class UserSubnets extends SynapseClient {
    constructor() {
        super();
    }

    createSubnet = async (synapseUser: any, accountId: string, createSubnet: CreateSubnet) => {
        try {
            const result = await synapseUser.createSubnet(accountId, createSubnet);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    getAllSubnets = async (synapseUser: any, accountId: string) => {
        try {
            const result = await synapseUser.getAllSubnets(accountId);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    getSubnet = async (synapseUser: any, accountId: string, subnetId: string) => {
        try {
            const result = await synapseUser.getSubnet(accountId, subnetId, {
                full_dehydrate: true,
            });
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    private patchSubnet = async (synapseUser: any, accountId: string, subnetId: string, updateSubnet: any) => {
        try {
            const result = await synapseUser.updateSubnet(accountId, subnetId, updateSubnet);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    activateDebitCard = async (synapseUser: any, accountId: string, subnetId: string) => {
        try {
            const result = await this.patchSubnet(synapseUser, accountId, subnetId, {
                "status": "ACTIVE"
            });
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    deactivateDebitCard = async (synapseUser: any, accountId: string, subnetId: string) => {
        try {
            const result = await this.patchSubnet(synapseUser, accountId, subnetId, {
                "status": "INACTIVE"
            });
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    deleteDebitCard = async (synapseUser: any, accountId: string, subnetId: string) => {
        try {
            const result = await this.patchSubnet(synapseUser, accountId, subnetId, {
                "status": "TERMINATED"
            });
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    setDebitCardPin = async (synapseUser: any, accountId: string, subnetId: string, cardPin: string) => {
        try {
            const result = await this.patchSubnet(synapseUser, accountId, subnetId, { card_pin: cardPin });
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    shipCard = async (synapseUser: any, accountId: string, subnetId: string, shipCard: ShipCard) => {
        try {
            return await synapseUser.shipCard(accountId, subnetId, shipCard);
        } catch (error) {
            console.log(error);
        }
    }
    getShipCardDetails = async (synapseUser: any, accountId: string, subnetId: string, shipmentId: string) => {
        try {
            const result = await synapseUser.getCardShipment(accountId, subnetId, shipmentId);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
    deleteShipCard = async (synapseUser: any, accountId: string, subnetId: string, shipmentId: string) => {
        try {
            const result = await synapseUser.deleteCardShipment(accountId, subnetId, shipmentId);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
        }
    }
}