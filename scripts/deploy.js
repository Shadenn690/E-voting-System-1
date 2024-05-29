async function main() {// we define the function with async to allow the use of await
  const Voting = await ethers.getContractFactory("Voting");


  
  // Start deployment, returning a promise that resolves to a contract object
  const Voting_ = await Voting.deploy(["Obama", "Biden", "Trump", "Klinton"], 60);
  await Voting_.deployed();
  console.log("Contract deployed to:", Voting_.address);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });