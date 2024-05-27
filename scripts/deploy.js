async function main() {// we define the function with async to allow the use of await
  const Voting = await ethers.getContractFactory("Voting");


  const authorizedIdNumbers=["12345","67890","11111","22222"]
  // Start deployment, returning a promise that resolves to a contract object
  const Voting_ = await Voting.deploy(["Obama", "Biden", "Trump", "Klinton"], 60, authorizedIdNumbers);
  await Voting_.deployed();
  console.log("Contract deployed to:", Voting_.address);

  // Log authorized voters
  for (const id of authorizedIdNumbers) {
    console.log(`Authorized voter: ${id}`);
  }
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });