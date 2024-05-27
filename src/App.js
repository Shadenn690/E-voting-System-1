import { useState, useEffect } from 'react';
import {ethers} from 'ethers';
import {contractAbi, contractAddress} from './Constant/constant';
import Login from './Components/Login';
import Finished from './Components/Finished';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setremainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('null');
  const [idNumber, setIdNumber] = useState('');
  const [CanVote, setCanVote] = useState(true);


  useEffect( () => {
    if(isConnected){
      getCandidates();
      calculateRemainingTime();
      getCurrentStatus();
      checkCanVote();
    }
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return() => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    }
  },[isConnected]);


  async function vote(candidateIndex) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );

      const tx = await contractInstance.vote(number);
      await tx.wait();
      getCandidates();
      //canVote();
      checkCanVote();
  }


  async function checkCanVote() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const voter = await contractInstance.voters(await signer.getAddress());
      setCanVote(voter.hasVoted);

  }

  async function getCandidates() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const candidatesList = await contractInstance.fetchTotalVotesForCandidates();
      const formattedCandidates = candidatesList.map((candidate, index) => {
        return {
          index: index,
          name: candidate.name,
          totalVotes: candidate.totalVotes.toNumber()
        }
      });
      setCandidates(formattedCandidates);
  }


  async function getCurrentStatus() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const status = await contractInstance.getCurrentVotingStatus();
      console.log(status);
      setVotingStatus(status);
  }

  async function calculateRemainingTime() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract (
        contractAddress, contractAbi, signer
      );
      const time = await contractInstance.calculateRemainingTime();
      setremainingTime(parseInt(time, 16));
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
        setNumber(number);
        setIdNumber(idNumber)
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
        checkCanVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser")
    }
  }

  async function handleNumberChange(e) {
    const index = e.target.value;
    console.log("Index is Selected: ", index);
    setNumber(index);
  }
  function handleIdNumberChange(e){
    const id = e.target.value;
    console.log("ID Number entered: ", id)
    setIdNumber(e.target.value);
  }

  return (
    <div className="App">
      { votingStatus ? (isConnected ? (<Connected 
                      account = {account}
                      candidates = {candidates}
                      remainingTime = {remainingTime}
                      number= {number}
                      isNumber={idNumber}
                      handleNumberChange = {handleNumberChange}
                      handleIdNumberChange ={handleIdNumberChange}
                      voteFunction = {vote}
                      showButton = {CanVote}/>) 
                      
                      : 
                      
                      (<Login connectWallet = {connectToMetamask}/>)) : (<Finished />)}
      
    </div>
  );



}




export default App;
