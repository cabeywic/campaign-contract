import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

// import dotenv from "dotenv";
// dotenv.config();
const factoryAddress = "0x46d827CE3c927A82DeEc899Fe2BAF0Dc72Ff3c34";

const instance = new web3.eth.Contract(JSON.parse(CampaignFactory.interface), factoryAddress);

export default instance;