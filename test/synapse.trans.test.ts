import { CreateTransaction } from './../src/synapse/dbo/transactions';
import { UserTranscations } from '../src/synapse/services/user.transcations';
import { SynapseUserAccountsService } from '../src/synapse/services/user.accounts';
import { Address } from '../src/synapse/dbo/address';
import { SynapseUserService } from '../src/synapse/services/user';
describe('GET Synapse User Trans Data', function () {

    test('create transaction test', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('618902c1bcaadc33b680ea6d');
        let userTrans = new UserTranscations();
        let nodeId = '618a0c72f0caea4f3b922cb7';
        let transaction: CreateTransaction = {
            "to": {
                "type": "ACH-US",
                "id": nodeId
            },
            "amount": {
                "amount": 100.1,
                "currency": "USD"
            },
            "extra": {
                "ip": "127.0.0.1",
                "note": "Test transaction" + new Date()
            }
        };
        let resultTrans = await userTrans.createTrans(result, nodeId, transaction);
        done();
    });

    test('dummy transaction test', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('618902c1bcaadc33b680ea6d');
        let nodeId = '618a0c72f0caea4f3b922cb7';

        let dummyResult = await result.triggerDummyTransactions(nodeId);

        done();
    });

    test.skip('delete specific transcation', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userTrans = new UserTranscations();
        let resultTrans = await userTrans.deleteTransaction(result, '6166caeb58c6ba0570551989', '6172ccce2241e407023c1f15');
        done();
    });
    test('comment specific transcation', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userTrans = new UserTranscations();
        let resultTrans = await userTrans.commentOnTransaction(result, '6166caeb58c6ba0570551989', '6172ccce2241e407023c1f15', "Sumit Test Comment");
        done();
    });
    test('get specific transcation acc number', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userTrans = new UserTranscations();
        let resultTrans = await userTrans.getTransDetailByAccTranscationId(result, '6166caeb58c6ba0570551989', '6172ccce2241e407023c1f15');
        done();
    });

    test('get transcations by acc number', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userTrans = new UserTranscations();
        let resultTrans = await userTrans.getAllTransByAccountId(result, '6166caeb58c6ba0570551989');
        done();
    });
    test('get transcations by users', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let userTrans = new UserTranscations();
        let resultTrans = await userTrans.getAllTransByUser(result);
        done();
    });
});