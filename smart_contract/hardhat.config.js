require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  // Phien ban Solidity
  solidity: "0.8.20",
  networks: {
    coston: {
      // Coston testnet RPC URL
      url: "https://coston-api.flare.network/ext/C/rpc",
      // Tai khoan tu bien moi truong (mac dinh neu trinh duyet khong co tai khoan nay thi se tu lien ket den tai khoan co trong trinh duyet do)
      accounts: [process.env.PRIVATE_KEY],
      // Chain ID cua Coston testnet
      chainId: 16
    }
  }
};
