const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;
const CONTRACT_NAME = "Star Notary Contract";
const CONTRACT_SYMBOL = "SNC";

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let instance = await StarNotary.deployed();
  let name = "Awesome Star!";
  let starId = 1;
  await instance.createStar(name, starId, {
    from: accounts[0],
  });
  let newStarName = await instance.lookUptokenIdToStarInfo.call(starId);
  assert.equal(newStarName, name);
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  const balanceOfUser2BeforeTransaction = web3.utils.toBN(
    await web3.eth.getBalance(user2)
  );
  const txInfo = await instance.buyStar(starId, {
    from: user2,
    value: balance,
  });
  const balanceAfterUser2BuysStar = web3.utils.toBN(
    await web3.eth.getBalance(user2)
  );
  // calculate the gas fee
  const tx = await web3.eth.getTransaction(txInfo.tx);
  const gasPrice = web3.utils.toBN(tx.gasPrice);
  const gasUsed = web3.utils.toBN(txInfo.receipt.gasUsed);
  const txGasCost = gasPrice.mul(gasUsed);
  // make sure that [final_balance == initial_balance - star_price - gas_fee]
  const starPriceBN = web3.utils.toBN(starPrice); // from string
  const expectedFinalBalance = balanceOfUser2BeforeTransaction
    .sub(starPriceBN)
    .sub(txGasCost);
  assert.equal(
    expectedFinalBalance.toString(),
    balanceAfterUser2BuysStar.toString()
  );
});

// Implement Task 2 Add supporting unit tests
it("can get contract name and symbol properly", async () => {
  //1. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided in the constructor
});

it("lookup non existing star", async () => {
  let tokenId = 9999999999;
  let instance = await StarNotary.deployed();
  let newStarName = await instance.lookUptokenIdToStarInfo(tokenId);
  assert.equal(newStarName, "");
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  let name1 = "Test Star1 Name";
  let name2 = "Test Star2 Name";
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let tokenId1 = 7;
  let tokenId2 = 8;
  await instance.createStar(name1, tokenId1, { from: user1 });
  await instance.createStar(name2, tokenId2, { from: user2 });
  assert.equal(await instance.ownerOf.call(tokenId1), user1);
  assert.equal(await instance.ownerOf.call(tokenId2), user2);
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(tokenId1, tokenId2, { from: user1 });
  // 3. Verify that the owners changed
  assert.equal(await instance.ownerOf.call(tokenId1), user2);
  assert.equal(await instance.ownerOf.call(tokenId2), user1);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  let name = "Test Star Name";
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let tokenId = 9;
  await instance.createStar(name, tokenId, { from: user1 });
  assert.equal(await instance.ownerOf.call(tokenId), user1);
  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(user2, tokenId, { from: user1 });
  // 3. Verify the star owner changed.
  assert.equal(await instance.ownerOf.call(tokenId), user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  let name = "Test Star Name";
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let tokenId = 10;
  await instance.createStar(name, tokenId, { from: user1 });
  // 2. Call your method lookUptokenIdToStarInfo
  let newStarName = await instance.lookUptokenIdToStarInfo(tokenId);
  // 3. Verify if you Star name is the same
  assert.equal(newStarName, name);
});
