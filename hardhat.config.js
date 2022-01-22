/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-ethers");
 require("@nomiclabs/hardhat-waffle");
 require("solidity-coverage");
 require("hardhat-gas-reporter");
 
 module.exports = {
   solidity: {
     compilers: [
       {
         version: "0.8.9",
         settings: {
           optimizer: {
             enabled: true,
             runs: 200
           }
         }
       },
       {
         version: "0.5.16",
         settings: {
           optimizer: {
             enabled: true,
             runs: 200
           }
         }
       }
     ]
   },
   networks: {
  }
 };
 