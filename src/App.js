import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState(null);
  const [canVote, setCanVote] = useState(true);

  useEffect(() => {
    if (isConnected) {
      console.log("Connected, loading data...");
      loadBlockchainData();
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [isConnected]);

  async function loadBlockchainData() {
    try {
      console.log("Fetching candidates...");
      await getCandidates();
      console.log("Calculating remaining time...");
      await calculateRemainingTime();
      console.log("Fetching current status...");
      await getCurrentStatus();
      console.log("Checking voting status...");
      await checkCanVote();
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  }

  async function vote() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );

      console.log("Voting for candidate index:", number);
      const tx = await contractInstance.vote(number);
      await tx.wait();
      console.log("Voted successfully");
      await checkCanVote();
      await getCandidates();
    } catch (err) {
      console.error("Error while voting:", err);
    }
  }

  async function checkCanVote() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const voter = await contractInstance.voters(await signer.getAddress());
      console.log("Has voted status:", voter.hasVoted);
      setCanVote(voter.hasVoted); // Show button if the user has not voted
    } catch (err) {
      console.error("Error checking canVote status:", err);
    }
  }

  async function getCandidates() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
  
      console.log("Fetching candidates from contract...");
      const candidatesList = await contractInstance.fetchTotalVotesForCandidates();
      console.log("Candidates fetched from contract:", candidatesList);
  
      const formattedCandidates = candidatesList.map((candidate, index) => ({
        index: index,
        name: candidate.name,
        totalVotes: candidate.totalVotes.toNumber()
      }));
  
      console.log("Formatted candidates:", formattedCandidates);
      setCandidates(formattedCandidates);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  }
  

  
  

  async function getCurrentStatus() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const status = await contractInstance.getCurrentVotingStatus();
      console.log("Voting status:", status);
      setVotingStatus(status);
    } catch (err) {
      console.error("Error fetching voting status:", err);
    }
  }

  async function calculateRemainingTime() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );
      const time = await contractInstance.calculateRemainingTime();
      const remainingTime = parseInt(time.toString(), 10);
      console.log("Remaining time:", remainingTime);
      setRemainingTime(remainingTime);
    } catch (err) {
      console.error("Error fetching remaining time:", err);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      checkCanVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
        checkCanVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  async function handleNumberChange(e) {
    const index = e.target.value;
    console.log("Index is Selected: ", index);
    setNumber(index);
  }

  return (
    <div className="App">
      {votingStatus ? (
        isConnected ? (
          <Connected
            account={account}
            candidates={candidates}
            remainingTime={remainingTime}
            number={number}
            handleNumberChange={handleNumberChange}
            voteFunction={vote}
            showButton={canVote}
          />
        ) : (
          <Login connectWallet={connectToMetamask} />
        )
      ) : (
        <Finished />
      )}
    </div>
  );
}

export default App;
