async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`);
  const NFT = await ethers.getContractFactory("simpleNFTReveal");
  const nft = await NFT.deploy(
    "Test",
    "test",
    "ipfs://URI/",
    "ipfs://notRevealedUri"
  );
  console.log(`simpleNFTGift Contract address: ${nft.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
