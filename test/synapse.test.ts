import { AddUserKYC } from './../src/synapse/dbo/user';
import { SynapseUserService } from '../src/synapse/services/user';
import { SynapseUserAccountsService } from '../src/synapse/services/user.accounts';
import { Address, CreateUser, Document } from './../src/synapse/dbo';
describe('GET Synapse User Data', function () {

    test('create synapse user test', async (done) => {
        let u = new SynapseUserService(null);
        let parentDocument: Document = {
            email: 'sumit1khandelwal@gmail.com',
            phone_number: '+919811776674',
            ip: '127.0.0.1',
            name: 'Sumit Parent',
            alias: 'Sumit Parent',
            entity_type: 'M',
            entity_scope: 'Arts & Entertainment',
            day: 1,
            month: 7,
            year: 1985,
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
        let childDocument: Document = {
            email: 'ishikhandelwal2018@gmail.com',
            phone_number: '+919811776674',
            ip: '127.0.0.1',
            name: 'Ishi Khandelwal 1',
            alias: 'Ishi K1',
            entity_type: 'MINOR',
            day: 20,
            month: 4,
            year: 2011,
            address_street: 'C',
            address_city: 'Noida',
            address_subdivision: 'UP',
            address_postal_code: '243122',
            address_country_code: 'IN',
            // virtual_docs: [{
            //     document_value: "2222",
            //     document_type: "SSN",
            // }],
            // physical_docs: [
            //     {
            //         document_value: "data:image/gif;base64,SUQs==",
            //         document_type: "GOVT_ID"
            //     },
            //     {
            //         document_value: "data:image/gif;base64,SUQs==",
            //         document_type: "GOVT_ID_BACK",
            //     }
            // ],
            // social_docs: [
            //     {
            //         document_value: "101 2nd St. STE 1500 SF CA US 94105",
            //         document_type: "MAILING_ADDRESS"
            //     }
            // ],
            docs_key: 'CHILD_DOCS',
            entity_scope: 'Education'
        }
        let user: CreateUser = {
            logins: [{ email: 'sumit1khandelwal@gmail.com' }],
            phone_numbers: ['+919811776674'],
            legal_names: ['Sumit Parent'],
            documents: [parentDocument, childDocument],
            extra: {
                "supp_id": "122eddfgbeafrfvbbb",
                "cip_tag": 1,
                "is_business": false
            }
        }
        let result = await u.createUser(user);
        console.log(result);
        done();
    })

    test.only('add new kid user test', async (done) => {
        let u = new SynapseUserService(null);
        let result = await u.getUser('6180f236336252740f8d96f2');

        let childDocument: Document = {
            email: 'ishikhandelwal2018@gmail.com',
            phone_number: '+919811776674',
            ip: '127.0.0.1',
            name: 'Ishi Khandelwal 2',
            alias: 'Ishi K2',
            entity_type: 'MINOR',
            day: 20,
            month: 4,
            year: 2011,
            address_street: 'C',
            address_city: 'Noida',
            address_subdivision: 'UP',
            address_postal_code: '243122',
            address_country_code: 'IN',
            docs_key: 'CHILD_DOCS',
            entity_scope: 'Education'
        }
        let user: AddUserKYC = {
            documents: [childDocument],
        }
        let addnewUserResult = await u.addUserKYC(result, user);
        console.log(addnewUserResult);
        done();
    })

    test('returns synapse user response', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('616fffac1473dc0c93f97dae');
        done();
    });

    test('returns synapse verify address response', async function (done) {
        let u = new SynapseUserService(null);
        let address = new Address()
        address.street = '101 2nd st ste 1500';
        address.city = 'san francisco';
        address.subDivision = 'CA';
        address.countryCode = 'US';
        address.postalCode = '94105';
        let result = await u.verifyAddress(address);
        done();
    });
    test('verify routing number', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.verifyRoutingNumber('084008426', 'ACH-US');
        done();
    });

    test('get account numbers', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let account = new SynapseUserAccountsService();
        let accountResult = await account.getUserAccounts(result);
        done();
    });

    test('get account number by account ID', async function (done) {
        let u = new SynapseUserService(null);
        let result = await u.getUser('61668dbb34661c0f6c0601fd');
        let account = new SynapseUserAccountsService();
        let accountResult = await account.getUserAccount(result, '6166caeb58c6ba0570551989');
        done();
    });
});
