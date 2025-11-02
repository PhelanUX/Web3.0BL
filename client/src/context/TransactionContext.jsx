import React, { Children, useEffect, useState} from "react";
import {ethers } from 'ethers';

import { contractABI, contractAddress} from  '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    console.log({
        provider,
        signer,
        transactionContract
    });
    //return transactionContract;
}

export const TransactionProvider = ({children}) => {
    const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [currentAccount, setCurrentAccount] = useState("");

    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }))
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
    
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            if(accounts.length){
                setCurrentAccount(accounts[0]);
    
                //getAllTransactions();
            } else {
                console.log("no account found");
            }
    
            console.log(accounts);  
        } catch (error) {
             console.log(error);
            
        }
    }

    const connectWallet = async () =>{
        try {
            if(!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");

            const { addressTo, amount, keyword, message } = formData;
            getEthereumContract();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object")
        }
    } 

    useEffect(() =>{
        checkIfWalletIsConnected();
    }, []);

    return(
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setformData, handleChange, sendTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
} 
