const StarNotary = artifacts.require("StarNotary");

module.exports = function (deployer) {
  const CONTRACT_NAME = "Star Notary Contract";
  const CONTRACT_SYMBOL = "SNC";
  deployer.deploy(StarNotary, CONTRACT_NAME, CONTRACT_SYMBOL);
};
