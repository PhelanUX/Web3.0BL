import React, { useContext } from "react";
import { TransactionContext } from '../context/TransactionContext';
import { shortenAddress } from "../utils/shortenAddress";
import useFetch from "../hooks/useFetch";

const TransactionCard = ({addressTo, addressFrom, timestamp, message, keyword, amount, url, transactionHash}) =>{
    const gifUrl = useFetch({keyword});

    return (
        <div className="bg-[#181918] m-4 flex flex-1
      2xl:min-w-[450px]
      2xl:max-w-[500px]
      sm:min-w-[270px]
      sm:max-w-[300px]
      min-w-full
      flex-col p-3 rounded-md hover:shadow-2xl">
        <div className="flex flex-col items-center w-full mt-3">
            <div className="w-full mb-6 p-2">
                <a href={`https://coston-explorer.flare.network/address/${addressFrom}`} 
                    target="_blank" rel="noopener noreferrer">
                        <p className="text-white text-base">From: {shortenAddress(addressFrom)}</p>
                </a>
                <a href={`https://coston-explorer.flare.network/address/${addressTo}`} 
                    target="_blank" rel="noopener noreferrer">
                        <p className="text-white text-base">To: {shortenAddress(addressTo)}</p>
                </a>
                <p className="text-white text-base">Amount: {amount} CFLR</p>

                <a href={`https://coston-explorer.flare.network/tx/${transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all">
                        <p className="text-white text-base">
                            Id Transaction: {transactionHash ? shortenAddress(transactionHash) : 'N/A'}
                        </p>
                </a>

                {message && (
                    <>
                        <br/>
                        <p className="text-white text-base">Message: {message}</p>
                    </>
                )}
            </div>
                <img
                    src={gifUrl || url}
                    alt="gif"
                    className="w-full h-64 2x:h-96 rounded-md shadow-lg object-cover"
                />
                <div className="bg-black p-3 px-5 w-max  rounded-3xl -mt-5 shadow-2xl">
                    <p className="text-[#37cd7a] font-bold">{timestamp}</p>
                </div>
        </div>
      </div>
    );
}

const Transactions = () => {
    const { currentAccount, transactions } = useContext(TransactionContext);

    const[showmore, setShowMore] = React.useState(false);

    //dao giao dich de hien thi giao dich moi nhat o tren cung
    const reversedTransactions = [...transactions].reverse();

    //10 giao dich gan nhat
    const lastestTransactions = reversedTransactions.slice(0,12);

    //giao dich cu hon
    const olderTransactions = reversedTransactions.slice(12);

    return(
        <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
            <div className="flex flex-col md:p-12 py-12 px-4">
                {currentAccount ? (
                    <h3 className="text-white text-3xl text-center my-2">
                        Lastest Transaction
                    </h3>
                ) :
                (
                   <h3 className="text-white text-3xl text-center my-2">
                        Connect your account to see the lastest transactions
                    </h3> 
                )}
                {/*hien thi 10 giao dich gan nhat*/}
                <div className="flex flex-wrap justify-center items-center mt-10">
                    {lastestTransactions.map((transaction, i) =>(
                        <TransactionCard key ={i} {...transaction}/>
                    ))}
                </div>

                {/*Nut show more - neu co giao dich cu hon moi hien nut show more*/}
                {olderTransactions.length> 0 &&(
                    <div className="flex justify-center mt-6">
                        <button className="text-white bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500 transition-all"
                            onClick={() => setShowMore(!showmore)}>
                            {showmore ? 'Hide older Transactions' : 'Show older Transactions'}
                        </button>
                    </div>
                )}

                {/*hien thi giao dich cu hon neu nguoi dung bam nut show more*/}
                {showmore &&(
                    <div className="flex flex-wrap justify-center items-center mt-6">
                        {olderTransactions.map((transaction, i) =>(
                            <TransactionCard key={`old-${i}`} {...transaction} />
                        ))}
                    </div>
                )}


                {/*hien thi toan bo giao dich*/}
                {/* <div className="flex flex-wrap justify-center items-center mt-10">
                    {[...transactions].reverse().map((transaction, i) =>(
                        <TransactionCard key ={i} {...transaction}/>
                    ))}
                </div> */}
            </div>
        </div>
    );
}
export default Transactions;