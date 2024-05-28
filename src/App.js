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
  const [idNumber, setIdNumber] = useState('');
  const [canVote, setCanVote] = useState(true);

  useEffect(() => {
    if (isConnected) {
      getCandidates();
      calculateRemainingTime();
      getCurrentStatus();
      checkCanVote();
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

  async function vote(candidateIndex) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, contractAbi, signer
      );

      console.log(`Voting with idNumber: ${idNumber}, candidateIndex: ${candidateIndex}`);
      const tx = await contractInstance.vote(idNumber, candidateIndex);
      await tx.wait();
      console.log("Vote cast successfully");
      getCandidates();
      checkCanVote();
    } catch (error) {
      console.error("Error while voting:", error);
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
      setCanVote(!voter.hasVoted);
      console.log(`Can vote: ${!voter.hasVoted}`);
    } catch (error) {
      console.error("Error checking if can vote:", error);
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
      const candidatesList = await contractInstance.fetchTotalVotesForCandidates();
      const formattedCandidates = candidatesList.map((candidate, index) => {
        return {
          index: index,
          name: candidate.name,
          totalVotes: candidate.totalVotes.toNumber()
        };
      });
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
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
      console.log(`Voting status: ${status}`);
      setVotingStatus(status);
    } catch (error) {
      console.error("Error fetching voting status:", error);
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
      setRemainingTime(parseInt(time, 16));
    } catch (error) {
      console.error("Error calculating remaining time:", error);
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

  function handleNumberChange(e) {
    const index = e.target.value;
    console.log("Index is Selected: ", index);
    setNumber(index);
  }

  function handleIdNumberChange(e) {
    const id = e.target.value;
    console.log("ID Number entered: ", id);
    setIdNumber(e.target.value);
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
            isNumber={idNumber}
            handleNumberChange={handleNumberChange}
            handleIdNumberChange={handleIdNumberChange}
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
