import { useState } from 'react';
import { HiMenuAlt4 } from 'react-icons/hi';
import {AiOutlineClose} from 'react-icons/ai';

import logo from '../../images/logo.png';

// Navbar item component
const NavbarItem = ({title, classProps, onClick}) =>{
    return(
        <li className={`mx-4 cursor-pointer ${classProps}`} onClick={onClick}>
            {title}
        </li>
    );
}
// Navbar component
const Navbar = () => {
    const [toggleMenu, setToggleMenu] = useState(false);

    const handleMarketClick =() => {
        window.open('https://coston-explorer.flare.network', '_blank', 'noopener,noreferrer');
    }

    const handleExchangeClick =() => {
        window.open('https://app.uniswap.org/', '_blank', 'noopener,noreferrer');
    }

    const handleTutorialClick =() => {
        window.open('https://cryptozombies.io/', '_blank', 'noopener,noreferrer');
    }
    // function to handle wallet profile click
    const handleWalletClick = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }

        try {
            // Yêu cầu quyền → MetaMask tự mở popup profile
            // await window.ethereum.request({
            //     method: 'wallet_requestPermissions',
            //     params: [{ eth_accounts: {} }],
            // });
            alert("Click the MetaMask icon in your browser to view your wallet profile.");
        } catch (error) {
            console.log("User denied permission request");
            console.error(error);
            // Fallback: hướng dẫn người dùng
            alert("Click the MetaMask icon in your browser to view your wallet profile.");
        }
    };
    // Menu items with their respective click handlers
    const menuItems = [
        { title: "Market", onClick: handleMarketClick },
        { title: "Exchange", onClick: handleExchangeClick },
        { title: "Tutorial", onClick: handleTutorialClick },
        { title: "Wallets", onClick: handleWalletClick },
    ];

    return(
        <nav className="w-full flex md:justify-center justify-between items-center p-4 ">
        <div className="md:flex-[0.5] flex initial justify-center items-center">
            <img src={logo} alt="logo" className="w-32 cursor-pointer" 
                onClick={() => window.open('https://www.youtube.com/watch?v=xvFZjo5PgG0&list=RDxvFZjo5PgG0&start_radio=1',
                 '_blank', 'noopener, noreferrer')}/>
        </div>
        <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
            {menuItems.map((item, index) =>(
                <NavbarItem key={item+index} title={item.title} onClick={item.onClick}/>
            ))}
            {/* <li className="bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]">
                Login
            </li> */}
        </ul>
       {/* Mobile Menu Toggle */}
            <div className="flex relative">
                {toggleMenu ? (
                    <AiOutlineClose
                        fontSize={28}
                        className="text-white md:hidden cursor-pointer"
                        onClick={() => setToggleMenu(false)}
                    />
                ) : (
                    <HiMenuAlt4
                        fontSize={28}
                        className="text-white md:hidden cursor-pointer"
                        onClick={() => setToggleMenu(true)}
                    />
                )}

                {/* Mobile Menu */}
                {toggleMenu && (
                    <ul className="z-10 fixed top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in">
                        <li className="text-xl w-full my-2">
                            <AiOutlineClose onClick={() => setToggleMenu(false)} />
                        </li>
                        {menuItems.map((item, index) => (
                            <NavbarItem
                                key={item.title + index}
                                title={item.title}
                                classProps="my-2 text-lg"
                                onClick={() => {
                                    item.onClick?.();        // Gọi link nếu có
                                    setToggleMenu(false);    // Đóng menu
                                }}
                            />
                        ))}
                    </ul>
                )}
                </div>
        </nav>
    );
}
export default Navbar;