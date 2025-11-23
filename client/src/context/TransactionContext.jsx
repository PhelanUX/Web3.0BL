
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

// KHÔNG lấy ethereum quá sớm
const getEthereum = () => {
  return typeof window !== "undefined" && window.ethereum
    ? window.ethereum
    : null;
};

// Provider an toàn
const getEthereumContract = () => {
  const ethereum = getEthereum();
  if (!ethereum) return null;

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};
// TẠO PROVIDER
export const TransactionProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  // HANDLE CHANGE FORM
  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  // GET ALL TRANSACTIONS
  const getAllTransactions = async () => {
  try {
    if (!ethereum) return;

    const contract = getEthereumContract();
    const rawTxs = await contract.getAllTransactions();

    if (!rawTxs || rawTxs.length === 0) {
      setTransactions([]);
      return;
    }
    // STRUCTURE DATA
    const structured = rawTxs.map(tx => ({
      addressTo: tx.receiver,
      addressFrom: tx.sender,
      timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
      message: tx.message,
      keyword: tx.keyword,
      amount: parseInt(tx.amount._hex) / 1e18,
      transactionHash: tx.txHash === "0x0000000000000000000000000000000000000000000000000000000000000000" 
        ? "Pending..." 
        : tx.txHash,
    }));

    setTransactions(structured);

  } catch (error) {
    console.error("Lỗi:", error);
  }
};

  //CHECK WALLET
  const checkIfWalletIsConnected = async () => {
    try {
      const ethereum = getEthereum();
      if (!ethereum) return;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        await getAllTransactions();
      } else {
        setCurrentAccount("");
      }
    } catch (error) {
      console.error("Wallet check error:", error);
    }
  };

  //CHECK TRANSACTION COUNT
  const checkIfTransactionsExist = async () => {
    try {
      const contract = getEthereumContract();
      if (!contract) return;

      const count = await contract.getTransactionCount();
      setTransactionCount(count.toNumber());
    } catch (error) {
      console.error("Count check error:", error);
    }
  };

  //CONNECT WALLET
  const connectWallet = async () => {
    try {
      const ethereum = getEthereum();
      if (!ethereum) return alert("Please install MetaMask!");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      await getAllTransactions();
    } catch (error) {
      console.error(error);
    }
  };

  //SEND TRANSACTION
  const sendTransaction = async () => {
  try {
    const ethereum = getEthereum();
    if (!ethereum) return alert("Cần MetaMask!");

    const { addressTo, amount, keyword, message } = formData;
    if (!addressTo || !amount || !keyword || !message) return alert("Điền đầy đủ!");

    const parsedAmount = ethers.utils.parseEther(amount);
    const contract = getEthereumContract();

    setIsLoading(true);

    // BƯỚC 1: Gửi ETH trước (MetaMask sẽ hiện popup)
    const ethTxHash = await ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: currentAccount,
        to: addressTo,
        gas: "0x5208",
        value: parsedAmount._hex,
      }],
    });

    console.log("ETH gửi xong, đang đợi xác nhận... Hash:", ethTxHash);

    // BƯỚC 2: Đợi ETH transaction được đào → lấy hash thật
    const provider = new ethers.providers.Web3Provider(ethereum);
    const ethTxReceipt = await provider.waitForTransaction(ethTxHash);
    
    if (!ethTxReceipt.status) throw new Error("Gửi ETH thất bại!");

    const realTxHash = ethTxReceipt.transactionHash;
    console.log("ETH xác nhận xong! Hash thật:", realTxHash);

    // BƯỚC 3: Gọi contract và truyền hash thật vào
    const tx = await contract.addToBlockchain(
      addressTo,
      parsedAmount,
      message,
      keyword,
      realTxHash  
    );

    console.log("Đang lưu vào blockchain... Hash contract:", tx.hash);
    await tx.wait();

    // BƯỚC 4: Reload dữ liệu
    await getAllTransactions();
    
    setFormData({ addressTo: "", amount: "", keyword: "", message: "" });
    setIsLoading(false);
    
    //alert(`THÀNH CÔNG! Hash: ${realTxHash.slice(0,10)}...${realTxHash.slice(-8)}`);
    // Xác nhận xong thì reload trang
    const userConfirmed = window.confirm(
        `THÀNH CÔNG! Hash: ${realTxHash.slice(0,10)}...${realTxHash.slice(-8)}`
    );

    if (userConfirmed) {
      window.location.reload();
    }
    else {
        window.location.reload();
    }

  } catch (error) {
    setIsLoading(false);
    console.error("LỖI CHI TIẾT:", error);
    alert("Gửi thất bại!");
  }
};

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();

    if (!ethereum) return;

    // Reload khi đổi ví
    ethereum.on("accountsChanged", async accounts => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        await getAllTransactions();
      } else {
        setCurrentAccount("");
      }
    });
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
        transactionCount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// import React, { useEffect, useState } from "react";
// import { ethers } from 'ethers';

// import { contractABI, contractAddress } from '../utils/constants';

// export const TransactionContext = React.createContext();

// const { ethereum } = window;

// const getEthereumContract = () => {
//     const provider = new ethers.providers.Web3Provider(ethereum);
//     const signer = provider.getSigner();
//     return new ethers.Contract(contractAddress, contractABI, signer);
// };

// export const TransactionProvider = ({ children }) => {
//     const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
//     const [currentAccount, setCurrentAccount] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [transactionCount, setTransactionCount] = useState(0);
//     const [transactions, setTransactions] = useState([]);
//     const [feePercent, setFeePercent] = useState(1);

//     const handleChange = (e, name) => {
//         setFormData(prev => ({ ...prev, [name]: e.target.value }));
//     };

//     // LẤY PHÍ TỪ CONTRACT
//     const getFeeInfo = async () => {
//         try {
//             if (!ethereum) return;
//             const contract = getEthereumContract();
//             const fee = await contract.feePercent();
//             setFeePercent(fee.toNumber() / 100);
//         } catch (error) {
//             console.error("getFeeInfo error:", error);
//         }
//     };

//     // LẤY GIAO DỊCH TỪ EVENTS
//     const getAllTransactions = async () => {
//         try {
//             if (!ethereum) return;

//             const contract = getEthereumContract();
//             const filter = contract.filters.Transfer();
//             const events = await contract.queryFilter(filter, 0, 'latest');

//             const structured = events.map((event) => ({
//                 addressTo: event.args.receiver,
//                 addressFrom: event.args.from,
//                 timestamp: new Date(event.args.timestamp.toNumber() * 1000).toLocaleString(),
//                 message: event.args.message,
//                 keyword: event.args.keyword,
//                 amount: parseInt(event.args.amount._hex) / 1e18,
//                 fee: parseInt(event.args.fee._hex) / 1e18,
//                 transactionHash: event.transactionHash,
//             }));

//             setTransactions(structured);
//         } catch (error) {
//             console.error("getAllTransactions error:", error);
//         }
//     };

//     const checkIfWalletIsConnected = async () => {
//         try {
//             if (!ethereum) return;
//             const accounts = await ethereum.request({ method: 'eth_accounts' });
//             if (accounts.length) {
//                 setCurrentAccount(accounts[0]);
//                 await getAllTransactions();
//                 await getFeeInfo();
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const checkIfTransactionsExist = async () => {
//         try {
//             if (!ethereum) return;
//             const contract = getEthereumContract();
// const count = await contract.getTransactionCount();
//             setTransactionCount(count.toNumber());
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const connectWallet = async () => {
//         try {
//             if (!ethereum) return alert("Please install MetaMask");
//             const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//             setCurrentAccount(accounts[0]);
//             await getAllTransactions();
//             await getFeeInfo();
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // GỬI TIỀN QUA CONTRACT - TỰ ĐỘNG TRỪ PHÍ
//     const sendTransaction = async () => {
//         try {
//             if (!ethereum) return alert("Please install MetaMask");

//             const { addressTo, amount, keyword, message } = formData;
//             if (!addressTo || !amount || !keyword || !message) {
//                 alert("Please fill all fields");
//                 return;
//             }

//             const contract = getEthereumContract();
//             const parsedAmount = ethers.utils.parseEther(amount);

//             setIsLoading(true);

//             // GỬI TIỀN QUA CONTRACT (không gửi trực tiếp)
//             const tx = await contract.addToBlockchain(
//                 addressTo,
//                 message,
//                 keyword,
//                 { value: parsedAmount }
//             );

//             console.log(`Submitted: ${tx.hash}`);
//             await tx.wait();
//             console.log(`Confirmed: ${tx.hash}`);

//             const count = await contract.getTransactionCount();
//             setTransactionCount(count.toNumber());

//             await getAllTransactions();
//             setIsLoading(false);
//             setFormData({ addressTo: "", amount: "", keyword: "", message: "" });

//         } catch (error) {
//             setIsLoading(false);
//             console.error("sendTransaction error:", error);
//             alert("Transaction failed");
//         }
//     };

//     useEffect(() => {
//         checkIfWalletIsConnected();
//         checkIfTransactionsExist();
//     }, []);

//     return (
//         <TransactionContext.Provider value={{
//             connectWallet,
//             currentAccount,
//             formData,
//             setFormData,
//             handleChange,
//             sendTransaction,
//             transactions,
//             isLoading,
//             transactionCount,
//             feePercent
//         }}>
//             {children}
//         </TransactionContext.Provider>
//     );
// };