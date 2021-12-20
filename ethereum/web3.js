import Web3 from "web3";
// import dotenv from "dotenv";
// dotenv.config();
// const endpoint = process.env.ENDPOINT;
 
let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/44e33cf1b858454e82aa93ab0a125c79");
  web3 = new Web3(provider);
}
 
export default web3;