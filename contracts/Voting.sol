// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 totalVotes;
    }
    struct Voter {
        bool hasVoted;
    }

    Candidate[] public candidates;
    address deployer;
    mapping(address => Voter) public voters;
    mapping(string => bool) public authorizedVoters;

    uint256 public votingStartTime;
    uint256 public votingEndTime;

    event VoterAuthorized(string idNumber); // Event for authorized voters
    event VoteCasted(string idNumber, uint256 candidateIndex); // Event for vote casting

    constructor(string[] memory _candidateNames, uint256 _votingPeriodMinutes, string[] memory _authorizedIdNumbers) {
        // Check if candidate names array is not empty
        require(_candidateNames.length > 0, "Candidate names array must not be empty");

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

        // Check if authorized voters array is not empty
        require(_authorizedIdNumbers.length > 0, "Authorized ID numbers array must not be empty");

        for (uint256 i = 0; i < _authorizedIdNumbers.length; i++) {
            authorizedVoters[_authorizedIdNumbers[i]] = true;
            emit VoterAuthorized(_authorizedIdNumbers[i]); // Emit event for authorized voters
        }
    }

    modifier deployerOnly {
        require(msg.sender == deployer);
        _;
    }

    function fetchTotalVotesForCandidates() public view returns (Candidate[] memory) {
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

    function vote(string memory _idNumber, uint256 _candidateIndex) public {
        require(authorizedVoters[_idNumber], "You are not authorized to vote.");
        require(!voters[msg.sender].hasVoted, "Voting multiple times is not allowed.");
        require(_candidateIndex < candidates.length, "Candidate index does not exist.");

        candidates[_candidateIndex].totalVotes++;
        voters[msg.sender].hasVoted = true;
        emit VoteCasted(_idNumber, _candidateIndex); // Emit event for vote casting
    }
}
