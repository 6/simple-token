import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-vyper';
import dotenv from 'dotenv';

dotenv.config();

const { ALCHEMY_KOVAN_API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    kovan: {
      hardhat: {},
      url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KOVAN_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    version: '0.8.4',
  },
  vyper: {
    version: '0.2.15',
  },
};
