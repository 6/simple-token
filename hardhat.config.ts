import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-vyper';
import dotenv from 'dotenv';

dotenv.config();

const { ALCHEMY_KOVAN_API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: '0.8.4',
    networks: {
      kovan: {
        url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KOVAN_API_KEY}`,
        accounts: [`0x${PRIVATE_KEY}`],
      },
    },
  },
  vyper: {
    version: '0.2.15',
  },
};
