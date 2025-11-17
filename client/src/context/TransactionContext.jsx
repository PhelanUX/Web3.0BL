// import React, { Children, useEffect, useState} from "react";
// import {ethers } from 'ethers';

// import { contractABI, contractAddress} from  '../utils/constants';

// export const TransactionContext = React.createContext();

// const { ethereum } = window;

// const getEthereumContract = () => {
//     const provider = new ethers.providers.Web3Provider(ethereum);
//     const signer = provider.getSigner();
//     const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    
//     return transactionContract;
// }

// export const TransactionProvider = ({children}) => {
//     const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
//     const [currentAccount, setCurrentAccount] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
//     const [transactions,setTransactions] = useState([])
//     const [lastTxHash, setLastTxHash] = useState("");

//     const handleChange = (e, name) => {
//         setformData((prevState) => ({ ...prevState, [name]: e.target.value }))
//     }

//     const getAllTransactions = async () => {
//         try {
//             if(!ethereum) return alert("Please install metamask");
//             const transactionContract = getEthereumContract();
            
//             const availableTransactions = await transactionContract.getAllTransactions();

//             // const structuredTransactions = availableTransactions.map((transaction) => ({
//             //     //transactionHash: transaction.transactionHash,
//             //     addressTo: transaction.receiver,
//             //     addressFrom: transaction.sender,
//             //     timestamp: new Date(transaction.timestamp.toNumber()*1000).toLocaleString(),
//             //     message:transaction.message,
//             //     keyword:transaction.keyword,
//             //     amount: parseInt(transaction.amount._hex) / (10**18),                
//             // }))
//             const structuredTransactions = availableTransactions.map((transaction, index) => {
//                 const isLatest = index === availableTransactions.length - 1;
//                 return {
//                 //transactionHash: transaction.transactionHash,
//                 addressTo: transaction.receiver,
//                 addressFrom: transaction.sender,
//                 timestamp: new Date(transaction.timestamp.toNumber()*1000).toLocaleString(),
//                 message:transaction.message,
//                 keyword:transaction.keyword,
//                 amount: parseInt(transaction.amount._hex) / (10**18), 
//                 transactionHash: isLatest && lastTxHash ? lastTxHash : 'Pending...',               
//             }})

//             setTransactions(structuredTransactions);
//             console.log(structuredTransactions);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     const checkIfWalletIsConnected = async () => {
//         try {
//             if(!ethereum) return alert("Please install metamask");
    
//             const accounts = await ethereum.request({ method: 'eth_accounts' });
    
//             if(accounts.length){
//                 setCurrentAccount(accounts[0]);
    
//                 getAllTransactions();
//             } else {
//                 console.log("no account found");
//             }
    
//             console.log(accounts);  
//         } catch (error) {
//              console.log(error);
            
//         }
//     }

//     const checkIfTransactionsExist = async () =>{
//         try {
//             const transactionContract = getEthereumContract();
//             const transactionsCount = await transactionContract.getTransactionCount();
            
//             window.localStorage.setItem("transactionCount", transactionCount);
//         } catch (error) {
//             console.log(error);
//             throw new Error("No ethereum object")
//         }
//     }

//     //connect the wallet
//     const connectWallet = async () =>{
//         try {
//             if(!ethereum) return alert("Please install metamask");

//             const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

//             setCurrentAccount(accounts[0]);
//             await getAllTransactions();
//             //window.location.reload();
//         } catch (error) {
//             console.log(error);
//             throw new Error("No ethereum object")
//         }
//     }

//     const sendTransaction = async () => {

//         try {
//             if(!ethereum) return alert("Please install metamask");

//             const { addressTo, amount, keyword, message } = formData;
//             const transactionContract = getEthereumContract();
//             const parsedAmount= ethers.utils.parseEther(amount);

//             await ethereum.request({
//                 method: 'eth_sendTransaction',
//                 params:[{
//                     from: currentAccount,
//                     to: addressTo,
//                     gas: '0x5208', //21000 GWEI
//                     value: parsedAmount._hex, //0.00001
//                 }]
//             });
//             setIsLoading(true);

//             //goi contract luu data k can hash
//             const tx = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
//             setLastTxHash(tx.hash);
//             await tx.wait();

//             //const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
//             //await transactionHash.wait();

//             console.log('Loading - ${transactionHash.hash}');
//             setIsLoading(false);
//             console.log('Success - ${transactionHash.hash}');

//             const transactionsCount = await transactionContract.getTransactionCount();

//             setTransactionCount(transactionsCount.toNumber());

//             await getAllTransactions();
//             //window.location.reload();
//         } catch (error) {
//             console.log(error);
//             throw new Error("No ethereum object")
//         }
//     } 

//     useEffect(() =>{
//         checkIfWalletIsConnected();
//         checkIfTransactionsExist();
//     }, []);

//     return(
//         <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setformData, handleChange, sendTransaction, transactions, isLoading }}>
//             {children}
//         </TransactionContext.Provider>
//     );
// } 
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

// TẠO HÀM KẾT NỐI VỚI CONTRACT
const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
};
// TẠO PROVIDER
export const TransactionProvider = ({ children }) => {
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [currentAccount, setCurrentAccount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [lastTxHash, setLastTxHash] = useState("");

    const handleChange = (e, name) => {
        setFormData(prev => ({ ...prev, [name]: e.target.value }));
    };

    // LẤY TXHASH TỪ LOCALSTORAGE
    const getStoredTxHash = (index) => {
        return localStorage.getItem(`txHash_${index + 1}`) || null;
    };

    // LẤY TẤT CẢ GIAO DỊCH
    const getAllTransactions = async () => {
        try {
            if (!ethereum) return;

            const contract = getEthereumContract();
            const rawTxs = await contract.getAllTransactions();

            const structured = rawTxs.map((tx, idx) => {
                const storedHash = getStoredTxHash(idx);
                const isLatest = idx === rawTxs.length - 1;
                const hash = storedHash || (isLatest && lastTxHash) || 'Pending...';

                return {
                    addressTo: tx.receiver,
                    addressFrom: tx.sender,
                    timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
                    message: tx.message,
                    keyword: tx.keyword,
                    amount: parseInt(tx.amount._hex) / 1e18,
                    transactionHash: hash,
                };
            });

            setTransactions(structured);
        } catch (error) {
            console.error("getAllTransactions error:", error);
        }
    };

    // KIỂM TRA VÍ ĐÃ KẾT NỐI
    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return;

            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                await getAllTransactions();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // KIỂM TRA SỐ LƯỢNG GIAO DỊCH
    const checkIfTransactionsExist = async () => {
        try {
            if (!ethereum) return;

            const contract = getEthereumContract();
            const count = await contract.getTransactionCount();
            const countNum = count.toNumber();

            setTransactionCount(countNum);
            localStorage.setItem("transactionCount", countNum.toString());
        } catch (error) {
            console.error(error);
        }
    };

    // KẾT NỐI VÍ
    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            await getAllTransactions();
        } catch (error) {
            console.error(error);
            throw new Error("No ethereum object");
        }
    };

    // GỬI GIAO DỊCH
    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");

            const { addressTo, amount, keyword, message } = formData;
            if (!addressTo || !amount || !keyword || !message) {
                alert("Please fill all fields");
                return;
            }

            const contract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            // GỬI ETH
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: "0x5208",
                    value: parsedAmount._hex,
                }],
            });

            setIsLoading(true);
            console.log("Submitting to blockchain...");

            // GỌI CONTRACT
            const tx = await contract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            setLastTxHash(tx.hash);

            console.log(`Submitted: ${tx.hash}`);
            await tx.wait();
            console.log(`Confirmed: ${tx.hash}`);

            // LẤY INDEX MỚI NHẤT
            const count = await contract.getTransactionCount();
            const countNum = count.toNumber();

            // LƯU HASH VĨNH VIỄN
            localStorage.setItem(`txHash_${countNum}`, tx.hash);

            // CẬP NHẬT STATE
            setTransactionCount(countNum);
            localStorage.setItem("transactionCount", countNum.toString());

            // TẢI LẠI GIAO DỊCH
            await getAllTransactions();

            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);
            console.error("sendTransaction error:", error);
            alert("Transaction failed");
        }
    };
// KIỂM TRA KHI COMPONENT ĐƯỢC MOUNT
    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider value={{
            connectWallet,
            currentAccount,
            formData,
            setFormData,
            handleChange,
            sendTransaction,
            transactions,
            isLoading,
            transactionCount
        }}>
            {children}
        </TransactionContext.Provider>
    );
};