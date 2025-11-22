// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Transactions {
    uint256 transactionCount;
    // SỰ KIỆN GIAO DỊCH
    //event Transfer (address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);
    event Transfer (address indexed from, address receiver, uint amount, string message, uint256 timestamp, string keyword, string txHash);
    // CẤU TRÚC GIAO DỊCH
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
        //them id giao dich
        string txHash;
    }

    TransferStruct[] transactions;
    // LƯU GIAO DỊCH VÀO BLOCKCHAIN
    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword, string memory txHash) public {
        transactionCount +=1;

        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword, txHash));

        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword, txHash);
    }
    // LẤY TẤT CẢ GIAO DỊCH
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }
    // LẤY SỐ LƯỢNG GIAO DỊCH
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}