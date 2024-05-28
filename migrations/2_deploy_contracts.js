const Voting = artifacts.require("Voting");

module.exports = async function(deployer) {
    const authorizedIdNumbers = ["12345", "67890", "11111", "22222"];
    const candidateNames = ["Obama", "Biden", "Trump", "Clinton"];
    const votingPeriodMinutes = 60;

    await deployer.deploy(Voting, candidateNames, votingPeriodMinutes, authorizedIdNumbers);
    const votingInstance = await Voting.deployed();
    console.log("Contract deployed to:", votingInstance.address);

    // Log authorized voters
    for (const id of authorizedIdNumbers) {
        console.log(`Authorized voter: ${id}`);
    }
};
