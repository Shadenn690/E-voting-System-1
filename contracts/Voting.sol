// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 totalVotes;
    }

    Candidate[] public candidates;
    address deployer;
    mapping(address => bool) public voters;

    uint256 public votingStartTime;
    uint256 public votingEndTime;

constructor(string[] memory _candidateNames, uint256 _votingPeriodMinutes) {
    uint256 length = _candidateNames.length;
    for (uint256 i = 0; i < length; i++) {
        string memory candidateName = _candidateNames[i];
        candidates.push(Candidate({
            name: candidateName,
            totalVotes: 0
        }));
    }
    deployer = msg.sender;
    votingStartTime = block.timestamp;
    uint256 _votingPeriodSeconds = _votingPeriodMinutes * 1 minutes;
    votingEndTime = votingStartTime + _votingPeriodSeconds;

}

    modifier deployerOnly {
        require(msg.sender == deployer);
        _;
    }

    function fetchTotalVotesForCandidates() public view returns (Candidate[] memory){
        return candidates;
    }

    function getCurrentVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStartTime && block.timestamp < votingEndTime);
    }

    function calculateRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStartTime, "Voting has not started yet.");

        if (block.timestamp >= votingEndTime) {
            return 0;
        } else {
            uint256 remainingTime = votingEndTime - block.timestamp;
            return remainingTime;
        }
    }
    function addCandidate(string memory _name) public deployerOnly {
        candidates.push(Candidate({
                name: _name,
                totalVotes: 0
        }));
    }

    function vote(uint256 _candidateIndex) public {
        require(!voters[msg.sender], "Voting multiple times is not allowed!.");
        require(_candidateIndex < candidates.length, "Candidate index does not exist!.");

        candidates[_candidateIndex].totalVotes++;
        voters[msg.sender] = true;
    }
    
}
