import React, { useState, useEffect } from "react";
import Web3 from "web3";
import SimpleTokenABI from "./SimpleToken.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  // Connect to wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        const contractInstance = new web3Instance.eth.Contract(
          SimpleTokenABI.abi,
          CONTRACT_ADDRESS
        );
        setContract(contractInstance);
      } catch (err) {
        setTxStatus("Wallet connection failed");
      }
    } else {
      setTxStatus("Please install MetaMask!");
    }
  };

  // Fetch balance
  const fetchBalance = async () => {
    if (contract && account) {
      setLoading(true);
      try {
        const bal = await contract.methods.balanceOf(account).call();
        setBalance(web3.utils.fromWei(bal, "ether"));
      } catch (e) {
        setTxStatus("Failed to fetch balance");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchBalance();
    }
    // eslint-disable-next-line
  }, [contract, account]);

  // Transfer tokens
  const handleTransfer = async (e) => {
    e.preventDefault();
    setTxStatus("");
    if (!web3.utils.isAddress(transferTo)) {
      setTxStatus("Invalid recipient address");
      return;
    }
    setLoading(true);
    try {
      await contract.methods
        .transfer(transferTo, web3.utils.toWei(transferAmount, "ether"))
        .send({ from: account });
      setTxStatus("Transfer successful!");
      setTransferTo("");
      setTransferAmount("");
      fetchBalance();
    } catch (err) {
      setTxStatus("Transfer failed: " + (err.message || err));
    }
    setLoading(false);
  };

  // Copy address to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={`App${darkMode ? " dark" : ""}`}>
      <div className="appbar">
        <span className="logo">SimpleToken</span>
        <button className="icon-btn" onClick={toggleDarkMode} title="Toggle dark mode" style={{marginLeft: 'auto', marginRight: '1.5rem'}}>
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>
      <header className="App-header">
        <div className="card">
          <h1>SimpleToken DApp</h1>
          {!account ? (
            <button className="primary-btn" onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <>
              <div className="address-row">
                <span>Connected: <b>{account.slice(0, 6)}...{account.slice(-4)}</b></span>
                <button className="icon-btn" onClick={handleCopy} title="Copy address">
                  {copied ? "✓" : "📋"}
                </button>
              </div>
              <div className="balance-row">
                <span>
                  Balance: <b>{loading ? "..." : balance}</b> <span style={{ color: '#6366f1' }}>STKN</span>
                </span>
                <button className="icon-btn" onClick={fetchBalance} title="Refresh balance">🔄</button>
              </div>
              <form onSubmit={handleTransfer}>
                <input
                  type="text"
                  placeholder="Recipient address"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="0"
                  step="any"
                  disabled={loading}
                />
                <button className="primary-btn" type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Transfer"}
                </button>
              </form>
              {txStatus && <div className="status">{txStatus}</div>}
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default App; 