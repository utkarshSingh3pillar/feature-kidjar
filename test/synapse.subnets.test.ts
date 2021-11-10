import { CreateSubnet, ShipCard } from './../src/synapse/dbo/subnet';
import { UserSubnets } from './../src/synapse/services/user.subnet';
import { UserTranscations } from './../src/synapse/services/user.transcations';
import { SynapseUserAccountsService } from '../src/synapse/services/user.accounts';
import { Address } from './../src/synapse/dbo/address';
import { SynapseUserService } from '../src/synapse/services/user';
describe('Synapse Subnet Test Cases', function () {

    test('create subnet test', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userSubnet = new UserSubnets();
        let nodeId = '6166caeb58c6ba0570551989';
        let createSubnet: CreateSubnet = {
            nickname: 'Sumit Debit Card',
            account_class: 'CARD',
            preview_only: false,
            status: 'ACTIVE'
        }

        let resultTrans = await userSubnet.createSubnet(result, nodeId, createSubnet);
        done();
    });

    test('get all subnets', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userSubnet = new UserSubnets();
        let nodeId = '6166caeb58c6ba0570551989';

        let resultTrans = await userSubnet.getAllSubnets(result, nodeId);
        console.log(JSON.stringify(resultTrans.data));
        done();
    });

    test('get subnet details', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userSubnet = new UserSubnets();
        let nodeId = '6166caeb58c6ba0570551989';

        let resultTrans = await userSubnet.getSubnet(result, nodeId, "617691b6099ab810988b8e62");

        console.log(JSON.stringify(resultTrans.data));
        done();
    });

    test('activate debit card', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userSubnet = new UserSubnets();
        let nodeId = '6166caeb58c6ba0570551989';

        let resultTrans = await userSubnet.activateDebitCard(result, nodeId, "617691b6099ab810988b8e62");

        console.log(JSON.stringify(resultTrans.data));
        done();
    });


    test('ship debit card', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userSubnet = new UserSubnets();
        let nodeId = '6166caeb58c6ba0570551989';
        let shipCard: ShipCard = {
            fee_node_id: '6166caeb58c6ba0570551989',
            expedite: false,
            card_style_id: '660'
        }
        let resultTrans = await userSubnet.shipCard(result, nodeId, "617691b6099ab810988b8e62", shipCard);

        console.log(JSON.stringify(resultTrans.data));
        done();
    });




})