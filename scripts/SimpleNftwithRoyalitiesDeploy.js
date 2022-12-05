async function main() {
  const [deployer, account1, account2, account3, account4, account5] =
    await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`account1: ${account1.address}`);
  console.log(`account2: ${account2.address}`);
  console.log(`account3: ${account3.address}`);
  console.log(`account4: ${account4.address}`);
  console.log(`account5: ${account5.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`);
  const NFT = await ethers.getContractFactory("simpleNFTRoyalities");
  const nft = await NFT.deploy(
    "Test",
    "test",
    "ipfs://URI/",
    "ipfs://notRevealedUri",
    [
      deployer.address,
      account1.address,
      account2.address,
      account3.address,
      account4.address,
      account5.address,
    ],
    [20, 25, 15, 20, 10, 10]
  );
  console.log(`simpleNFTGift Contract address: ${nft.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
