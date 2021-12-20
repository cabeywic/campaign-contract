import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;

const instance = new web3.eth.Contract(JSON.parse(CampaignFactory.interface), factoryAddress);

export default instance;