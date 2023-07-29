'use client'

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingContract from "../contracts/Voting.json"; // Replace with the path to your compiled contract JSON
import styles from './page.module.css';

export default function Home() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [votingContract, setVotingContract] = useState<ethers.Contract>();
  const [votingOptions, setVotingOptions] = useState<{ name: string; voteCount: number }[]>(
    []
  );
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0x241951979aF99635BeE8F0E4998f08234136f71e"; // Replace with the deployed contract address
        const contract = new ethers.Contract(
          contractAddress,
          VotingContract.abi,
          signer
        );
        setProvider(provider);
        setVotingContract(contract);
        await getVotingOptions(contract);
        const hasVoted = await contract.hasVoted(await signer.getAddress())
        setHasVoted(hasVoted);
      } else {
        alert("Please install MetaMask to use this app.");
      }
    };
    init();
  }, []);
  
  const getVotingOptions = async (contract: any) => {
    const optionCount = await contract.getOptionCount();
    const options = [];
    for (let i = 0; i < optionCount; i++) {
      const [name, voteCount] = await contract.getOption(i);
      options.push({ name, voteCount: voteCount.toNumber() });
    }
    setVotingOptions(options);
  };

  const handleVote = async (contract: any) => {
    try {
      await contract.vote(selectedOption);
      setHasVoted(true);
      await getVotingOptions(contract); // Refresh the options after voting
    } catch (error: any) {
      console.error("Error voting:", error.message);
      if (error.message.includes("already voted")) {
        setHasVoted(true);
      }
    }
  };

  const renderOptions = () => {
    return votingOptions.map((option, index) => (
      <div key={index}>
        <label>
          <input
            type="radio"
            value={index}
            checked={selectedOption === index}
            onChange={() => setSelectedOption(index)}
            disabled={hasVoted}
          />
          {option.name} ({option.voteCount} votes)
        </label>
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Voting DApp on Klaytn</h1>
      {!provider ? (
        <button className={styles.button} onClick={() => window.ethereum.enable()}>
          Connect Wallet (MetaMask)
        </button>
      ) : (
        <div>
          <h2 className={styles.subheading}>Options:</h2>
          {renderOptions()}
          {hasVoted ? (
            <p className={styles.message}>You have already voted!</p>
          ) : (
            <button className={styles.button} onClick={() => handleVote(votingContract)}>
              Vote
            </button>
          )}
        </div>
      )}
    </div>
  );
}
