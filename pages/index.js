import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [characterMessage, setCharacterMessage] = useState("");
  const [amount, setAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = (await atm.getBalance()).toNumber();
      setBalance(balance);
      return balance;
    }
  };

  const deposit = async () => {
    if (atm) {
      const note = window.prompt("Enter a note for deposit (optional):");
      let tx = await atm.deposit(amount, { value: ethers.utils.parseEther(amount.toString()) });
      await tx.wait();
      const newBalance = await getBalance();
      alert(`Deposit successful! New Balance: ${newBalance}`);
      addHistory("Deposit", amount, note || "");
      setCharacterMessage("(ﾉ◕ヮ◕)ﾉ* - Thank you for the money");
    }
  };

  const withdraw = async () => {
    if (atm) {
      const note = window.prompt("Enter a note for withdrawal (optional):");
      try {
        let tx = await atm.withdraw(amount);
        await tx.wait();
        const newBalance = await getBalance();
        alert(`Withdrawal successful! New Balance: ${newBalance}`);
        addHistory("Withdraw", amount, note || "");
        setCharacterMessage("ಠ_ಠ - Why did you take the money");
      } catch (error) {
        console.error("Withdrawal error:", error.message);
        alert("There is not Enough Balance in Your Wallet");
      }
    }
  };

  const addHistory = (action, amount, note = "") => {
    const timestamp = new Date().toLocaleString();
    setHistory([...history, { action, amount, note, timestamp }]);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p className="highlighted">Your Account: {account} </p>
        <p className="highlighted">Your Balance: {balance}</p>
        <div className="slider-container">
          <input
            type="range"
            min="1"
            max="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <span>{amount} ETH</span>
        </div>
        <button className="deposit-button" onClick={deposit}>Deposit {amount} ETH</button>
        <button className="withdraw-button" onClick={withdraw}>Withdraw {amount} ETH</button>
        {characterMessage && <p className="character-message">{characterMessage}</p>}
        <h2>Transaction History</h2>
        <div className="filter-buttons">
          <button onClick={() => handleFilterChange("All")}>All</button>
          <button onClick={() => handleFilterChange("Deposit")}>Deposits</button>
          <button onClick={() => handleFilterChange("Withdraw")}>Withdrawals</button>
        </div>
        <ul>
          {history.map((item, index) => {
            if (filter === "All" || item.action === filter) {
              return (
                <li
                  key={index}
                  className={item.action === "Deposit" ? "deposit-item" : "withdraw-item"}
                >
                  {item.timestamp} - {item.action} {item.amount} ETH -
                  {item.note && <span> Note: {item.note}</span>}
                </li>
              );
            } else {
              return null;
            }
          })}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the AdamWal_Lee_t</h1></header>
      {initUser()}
      <style jsx global>{`
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #f3e5f5;
          color: #4a148c;
          font-family: 'Arial', sans-serif;
        }
        button {
          background-color: #7b1fa2;
          color: white;
          font-size: 18px;
          margin: 10px 0;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #6a1b9a;
        }
        .deposit-button {
          background-color: #4caf50;
        }
        .withdraw-button {
          background-color: #f44336;
        }
        .deposit-button:hover,
        .withdraw-button:hover {
          background-color: #388e3c, #d32f2f;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        header {
          background: linear-gradient(to right, #8e24aa, #5f27cd);
          padding: 20px;
          width: 100%;
          text-align: center;
          color: white;
          font-family: 'Roboto', sans-serif;
        }
        h1 {
          font-size: 36px;
          margin: 0;
        }
        .highlighted {
          background-color: rgba(255, 255, 0, 0.1);
          padding: 10px;
          border-radius: 15px;
          text-align: center;
        }
        .content {
          display: flex;
          width: 80%;
          justify-content: space-between;
        }
        .account-info {
          flex: 1;
          text-align: left;
          margin-right: 20px;
        }
        .transaction-history {
          flex: 1;
          text-align: right;
          margin-left: 20px;
        }
        p {
          font-size: 18px;
          margin: 10px 0;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          background-color: #e1bee7;
          margin: 5px 0;
          padding: 10px;
          border-radius: 5px;
        }
        .deposit-item {
          background-color: #90ee90;
          color: black;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 5px;
        }
        .withdraw-item {
          background-color: #ffcccb;
          color: black;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 5px;
        }
        .character-message {
          font-size: 20px;
          color: #9c27b0;
          margin-top: 20px;
          background-color: rgba(255, 255, 0, 0.1);
          padding: 10px;
          border-radius: 15px;
          text-align: right;
        }
        .slider-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
          padding: 10px;
          border: 2px solid #b39ddb; 
          border-radius: 8px;
          background-color: #e1bee7;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .slider-container input {
          margin-right: 10px;
          width: 100%;
          max-width: 300px;
          -webkit-appearance: none;
          appearance: none;
          background: #ce93d8;
          height: 8px;
          border-radius: 5px;
          outline: none;
          transition: background 0.3s ease;
        }

        .slider-container input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7e57c2;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .slider-container input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #7e57c2;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .slider-container input:hover {
          background: #ba68c8;
        }

        .slider-container input::-webkit-slider-thumb:hover {
          background: #673ab7;
        }

        .slider-container input::-moz-range-thumb:hover {
          background: #673ab7;
        }


      `}</style>
    </main>
  );
}
