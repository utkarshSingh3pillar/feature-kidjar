const Synapse = require('synapsenode');
import config = require('@tsmx/secure-config');
const Client: any = Synapse.Client;

export class SynapseClient {
    client: any;
    constructor() {
        const isProductionEnv = config.env.NODE_ENV == 'Prod';
        if (!isProductionEnv) {
            this.client = new Client({
                client_id: 'client_id_dCP1ZtgbLmu25akj3nc9XAM0BFRse7q8r0zETVSH',
                client_secret: 'client_secret_FNRO1eP85EgjAGoTqhSUrs64KJ0bV3v9Buk7MHzx',
                fingerprint: '{{fp}}',
                ip_address: "::1",
                // isProduction boolean determines if production (true) or sandbox (false) endpoint is used
                isProduction: false
            });

        }
        else {
            this.client = new Client({
                client_id: 'client_id_dCP1ZtgbLmu25akj3nc9XAM0BFRse7q8r0zETVSH',
                client_secret: 'client_secret_FNRO1eP85EgjAGoTqhSUrs64KJ0bV3v9Buk7MHzx',
                fingerprint: '{{fp}}',
                ip_address: "::1",
                // isProduction boolean determines if production (true) or sandbox (false) endpoint is used
                isProduction: false
            });
        }
    }



}