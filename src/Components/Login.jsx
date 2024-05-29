import React from "react";

const Login = (props) => {

    const handleLogin = () => {
        props.connectWallet();
    };
    return (
        <div className="login-container">
            <h1 className="welcome-message">Welcome to decentralized voting application</h1>
            <button className="login-button" onClick={handleLogin}>
                Login with MetaMask
            </button>
        </div>
    );
};

export default Login;