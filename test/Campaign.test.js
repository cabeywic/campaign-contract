const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const Campaign = require('../ethereum/build/Campaign.json');
const CampaignFactory = require('../ethereum/build/CampaignFactory.json');

const MINIMUM_CONTRIBUTION = 100;

let accounts;
let campaign, campaignAddress, campaignFactory;

beforeEach(async() => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();


    // Use one of the accounts to deploy the contract
    campaignFactory = await new web3.eth.Contract(JSON.parse(CampaignFactory.interface))
     .deploy({ data: CampaignFactory.bytecode })
     .send({ from: accounts[0], gas: '1000000' });
    
    await campaignFactory.methods.createCampaign(MINIMUM_CONTRIBUTION).send({ from: accounts[0], gas: '1000000' });
    let campaigns = await campaignFactory.methods.getCampaigns().call();
    campaignAddress = campaigns[0];

    campaign = await new web3.eth.Contract(JSON.parse(Campaign.interface), campaignAddress)

})

describe('Lottery Contract', () => {
    it('deploys the campaign factory and campaign contract', () => {
        assert.ok(campaignFactory.options.address);
        assert.ok(campaign.options.address);
    }) ;

    it('marks the caller as the manager', async() => {
        let manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('marks contributors as approvers', async() => {
        await campaign.methods.contribute().send({ from: accounts[1], value: '500' });

        let isApprover = await campaign.methods.approvers(accounts[1]).call();
        assert(isApprover);
    });

    it('requires a minimum contribution', async()=> {
        try {
            await campaign.methods.contribute().send({ from: accounts[1], value: '50' });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async() => {
        await campaign.methods.createRequest('Buy some wood', 500, accounts[2]).send({ from: accounts[0], gas: '1000000'});
        
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy some wood', request.description);
    });

    it('allows only contributors to approve requests', async() =>{
         // Contribute to campaign
         await campaign.methods.contribute().send({
            from: accounts[1], 
            value: web3.utils.toWei('1', 'ether') 
        });

        // Create new request
        await campaign.methods
         .createRequest('Buy some wood', web3.utils.toWei('1', 'ether'), accounts[2])
         .send({ from: accounts[0], gas: '1000000' });

        // Approve request for campaign
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000' });

        // Get request information
        let request = await campaign.methods.requests(0).call();
        assert.equal(request.approvalCount, 1);
    });

    it('needs a majority to finalize requests', async()=>{
         // Contribute to campaign
        for(i of [1,3,4]){
            await campaign.methods.contribute().send({
                from: accounts[i], 
                value: web3.utils.toWei('1', 'ether') 
            });
        }

        // Create new request
        await campaign.methods
         .createRequest('Buy some wood', web3.utils.toWei('5', 'ether'), accounts[2])
         .send({ from: accounts[0], gas: '1000000' });

        // Approve request for campaign
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000' });

        try{
            //Finalize request to supplier
            await campaign.methods.finalizeRequest(0).send({ from: accounts[0], gas: '1000000' });
            assert(false);
        }catch(err){
            assert(err);
        }
    });

    it('processes requests', async() => {
        // Contribute to campaign
        await campaign.methods.contribute().send({
            from: accounts[1], 
            value: web3.utils.toWei('10', 'ether') 
        });

        // Create new request
        await campaign.methods
         .createRequest('Buy some wood', web3.utils.toWei('5', 'ether'), accounts[2])
         .send({ from: accounts[0], gas: '1000000' });

        // Approve request for campaign
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000' });

        // Inital supplier account balance
        let initialBalance = await web3.eth.getBalance(accounts[2]);
        initialBalance = parseFloat(web3.utils.fromWei(initialBalance, 'ether'));

        //Finalize request to supplier
        await campaign.methods.finalizeRequest(0).send({ from: accounts[0], gas: '1000000' });

        // Final supplier account balance
        let finalBalance = await web3.eth.getBalance(accounts[2]);
        finalBalance = parseFloat(web3.utils.fromWei(finalBalance, 'ether'));

        assert(finalBalance-initialBalance>4.8);
    })
})