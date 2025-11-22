
// import React, { useEffect, useState } from "react";
// import { ethers } from 'ethers';

// import { contractABI, contractAddress } from '../utils/constants';

// export const TransactionContext = React.createContext();

// const { ethereum } = window;

// // TẠO HÀM KẾT NỐI VỚI CONTRACT
// const getEthereumContract = () => {
//     const provider = new ethers.providers.Web3Provider(ethereum);
//     const signer = provider.getSigner();
//     return new ethers.Contract(contractAddress, contractABI, signer);
// };
// // TẠO PROVIDER
// export const TransactionProvider = ({ children }) => {
//     const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
//     const [currentAccount, setCurrentAccount] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [transactionCount, setTransactionCount] = useState(0);
//     const [transactions, setTransactions] = useState([]);
//     const [lastTxHash, setLastTxHash] = useState("");

//     const handleChange = (e, name) => {
//         setFormData(prev => ({ ...prev, [name]: e.target.value }));
//     };

//     // LẤY TXHASH TỪ LOCALSTORAGE
//     const getStoredTxHash = (index) => {
//         return localStorage.getItem(`txHash_${index + 1}`) || null;
//     };

//     // LẤY TẤT CẢ GIAO DỊCH
//     const getAllTransactions = async () => {
//         try {
//             if (!ethereum) return;

//             const contract = getEthereumContract();
//             const rawTxs = await contract.getAllTransactions();

//             // Lấy event logs từ contract (giả sử contract phát event Transfer hoặc tên event phù hợp)
//             // events[i].transactionHash chứa txHash của giao dịch tương ứng
//             let events = [];
//             try {
//                 const filter = contract.filters.Transfer(); // if your event is named Transfer
//                 events = await contract.queryFilter(filter);
//             } catch (e) {
//                 console.warn("No events available or filter name mismatch:", e);
//             }

//             const structured = rawTxs.map((tx, idx) => {
//                 const storedHash = getStoredTxHash(idx);
//                 const isLatest = idx === rawTxs.length - 1;
//                 const hash = storedHash || (isLatest && lastTxHash) || 'Pending...';
                

//                 return {
//                     addressTo: tx.receiver,
//                     addressFrom: tx.sender,
//                     timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
//                     message: tx.message,
//                     keyword: tx.keyword,
//                     amount: parseInt(tx.amount._hex) / 1e18,
//                     transactionHash: hash,
//                 };
//             });

//             setTransactions(structured);
//         } catch (error) {
//             console.error("getAllTransactions error:", error);
//         }
//     };

//     // KIỂM TRA VÍ ĐÃ KẾT NỐI
//     const checkIfWalletIsConnected = async () => {
//         try {
//             if (!ethereum) return;

//             const accounts = await ethereum.request({ method: 'eth_accounts' });
//             if (accounts.length) {
//                 setCurrentAccount(accounts[0]);
//                 await getAllTransactions();
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // KIỂM TRA SỐ LƯỢNG GIAO DỊCH
//     const checkIfTransactionsExist = async () => {
//         try {
//             if (!ethereum) return;

//             const contract = getEthereumContract();
//             const count = await contract.getTransactionCount();
//             const countNum = count.toNumber();

//             setTransactionCount(countNum);
//             localStorage.setItem("transactionCount", countNum.toString());
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // KẾT NỐI VÍ
//     const connectWallet = async () => {
//         try {
//             if (!ethereum) return alert("Please install MetaMask");

//             const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//             setCurrentAccount(accounts[0]);
//             await getAllTransactions();
//         } catch (error) {
//             console.error(error);
//             throw new Error("No ethereum object");
//         }
//     };

//     // GỬI GIAO DỊCH
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

//             // GỬI ETH
//             await ethereum.request({
//                 method: 'eth_sendTransaction',
//                 params: [{
//                     from: currentAccount,
//                     to: addressTo,
//                     gas: "0x5208",
//                     value: parsedAmount._hex,
//                 }],
//             });

//             setIsLoading(true);
//             console.log("Submitting to blockchain...");

//             // GỌI CONTRACT
//             const tx = await contract.addToBlockchain(addressTo, parsedAmount, message, keyword);
//             setLastTxHash(tx.hash);

//             console.log(`Submitted: ${tx.hash}`);
//             await tx.wait();
//             console.log(`Confirmed: ${tx.hash}`);

//             // LẤY INDEX MỚI NHẤT
//             const count = await contract.getTransactionCount();
//             const countNum = count.toNumber();

//             // LƯU HASH VĨNH VIỄN
//             localStorage.setItem(`txHash_${countNum}`, tx.hash);

//             // CẬP NHẬT STATE
//             setTransactionCount(countNum);
//             localStorage.setItem("transactionCount", countNum.toString());

//             // TẢI LẠI GIAO DỊCH
//             await getAllTransactions();

//             setIsLoading(false);

//         } catch (error) {
//             setIsLoading(false);
//             console.error("sendTransaction error:", error);
//             alert("Transaction failed");
//         }
//     };
// // KIỂM TRA KHI COMPONENT ĐƯỢC MOUNT
//     useEffect(() => {
//         checkIfWalletIsConnected();
//         checkIfTransactionsExist();

//         if (!ethereum) return;
//         // chuyen doi tai khoan tu doi khi tai khoan trong meta mask thay doi
//         ethereum.on("accountsChanged", async (accounts) => {
//             if (accounts.length > 0) {
//                 setCurrentAccount(accounts[0]);
//                 await getAllTransactions();
//             } else {
//                 setCurrentAccount("");
//             }
//         });
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
//             transactionCount
//         }}>
//             {children}
//         </TransactionContext.Provider>
//     );
// };

// import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { contractABI, contractAddress } from "../utils/constants";

// export const TransactionContext = React.createContext();
// const { ethereum } = window;

// // 📌 NHỚ ĐIỀN BLOCK DEPLOY CONTRACT TẠI ĐÂY
// const DEPLOY_BLOCK = 45000000;

// // Tạo kết nối contract
// const getEthereumContract = () => {
//   const provider = new ethers.providers.Web3Provider(ethereum);
//   const signer = provider.getSigner();
//   return new ethers.Contract(contractAddress, contractABI, signer);
// };

// // Chunk query theo giới hạn RPC Songbird (30 blocks)
// const queryLogsChunked = async (contract, fromBlock, toBlock) => {
//   const logs = [];
//   const maxRange = 30;

//   for (let start = fromBlock; start <= toBlock; start += maxRange) {
//     const end = Math.min(start + maxRange, toBlock);
//     const filter = contract.filters.Transfer();

//     const chunkLogs = await contract.queryFilter(filter, start, end);
//     logs.push(...chunkLogs);
//   }
//   return logs;
// };

// export const TransactionProvider = ({ children }) => {
//   const [formData, setFormData] = useState({
//     addressTo: "",
//     amount: "",
//     keyword: "",
//     message: "",
//   });
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [transactionCount, setTransactionCount] = useState(0);
//   const [transactions, setTransactions] = useState([]);

//   const handleChange = (e, name) => {
//     setFormData(prev => ({ ...prev, [name]: e.target.value }));
//   };

//   // Lấy toàn bộ tx + txHash từ event logs
//   const getAllTransactions = async () => {
//     try {
//       if (!ethereum) return;

//       const provider = new ethers.providers.Web3Provider(ethereum);
//       const contract = getEthereumContract();

//       const rawTxs = await contract.getAllTransactions();
//       const latestBlock = await provider.getBlockNumber();

//       // 🔥 Lấy event Transfer theo chunk
//       const logs = await queryLogsChunked(contract, DEPLOY_BLOCK, latestBlock);

//       const structured = rawTxs.map((tx, idx) => {
//         const log = logs[idx];
//         const realTxHash = log?.transactionHash || "Pending...";

//         return {
//           addressTo: tx.receiver,
//           addressFrom: tx.sender,
//           timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
//           message: tx.message,
//           keyword: tx.keyword,
//           amount: parseInt(tx.amount._hex) / 1e18,
//           transactionHash: realTxHash,
//         };
//       });

//       setTransactions(structured);
//     } catch (err) {
//       console.error("getAllTransactions error:", err);
//     }
//   };

//   // Check ví
//   const checkIfWalletIsConnected = async () => {
//     try {
//       if (!ethereum) return;

//       const accounts = await ethereum.request({
//         method: "eth_accounts",
//       });

//       if (accounts.length) {
//         setCurrentAccount(accounts[0]);
//         await getAllTransactions();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Check số lượng transactions
//   const checkIfTransactionsExist = async () => {
//     try {
//       if (!ethereum) return;
//       const contract = getEthereumContract();
//       const count = await contract.getTransactionCount();
//       setTransactionCount(count.toNumber());
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Kết nối ví
//   const connectWallet = async () => {
//     try {
//       if (!ethereum) return alert("Vui lòng cài MetaMask");

//       const accounts = await ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       setCurrentAccount(accounts[0]);
//       await getAllTransactions();
//     } catch (err) {
//       console.error(err);
//       throw new Error("No ethereum object");
//     }
//   };

//   // Gửi giao dịch
//   const sendTransaction = async () => {
//     try {
//       if (!ethereum) return alert("Vui lòng cài MetaMask");

//       const { addressTo, amount, keyword, message } = formData;

//       if (!addressTo || !amount || !keyword || !message) {
//         alert("Vui lòng nhập đầy đủ");
//         return;
//       }

//       const contract = getEthereumContract();
//       const parsedAmount = ethers.utils.parseEther(amount);

//       // Gửi ETH
//       await ethereum.request({
//         method: "eth_sendTransaction",
//         params: [
//           {
//             from: currentAccount,
//             to: addressTo,
//             gas: "0x5208",
//             value: parsedAmount._hex,
//           },
//         ],
//       });

//       setIsLoading(true);

//       // Lưu tx vào contract
//       const tx = await contract.addToBlockchain(
//         addressTo,
//         parsedAmount,
//         message,
//         keyword
//       );

//       console.log("Submitted:", tx.hash);
//       await tx.wait();
//       console.log("Confirmed:", tx.hash);

//       // Update state
//       const count = await contract.getTransactionCount();
//       setTransactionCount(count.toNumber());

//       // Load lại tx
//       await getAllTransactions();
//       setIsLoading(false);
//     } catch (err) {
//       setIsLoading(false);
//       console.error("Transaction error:", err);
//       alert("Giao dịch thất bại!");
//     }
//   };

//   // Khi mount
//   useEffect(() => {
//     checkIfWalletIsConnected();
//     checkIfTransactionsExist();

//     if (!ethereum) return;

//     // Reload khi đổi ví
//     ethereum.on("accountsChanged", async accounts => {
//       if (accounts.length > 0) {
//         setCurrentAccount(accounts[0]);
//         await getAllTransactions();
//       } else {
//         setCurrentAccount("");
//       }
//     });
//   }, []);

//   return (
//     <TransactionContext.Provider
//       value={{
//         connectWallet,
//         currentAccount,
//         formData,
//         setFormData,
//         handleChange,
//         sendTransaction,
//         transactions,
//         isLoading,
//         transactionCount,
//       }}
//     >
//       {children}
//     </TransactionContext.Provider>
//   );
// };

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
