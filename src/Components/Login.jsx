import React, {useState} from "react";

const Login = (props) => {
    const [idNumber, setIdNumber] = useState("");

    const handleIdChange = (event) => {
        setIdNumber(event.target.value);
    };

    const handleLogin = () => {
        props.connectWallet(idNumber);
    };
    return (
        <div className="login-container">
            <h1 className="welcome-message">Welcome to decentralized voting application</h1>
            <input
                type="text"
                placeholder="Enter your ID number"
                value={idNumber}
                onChange={handleIdChange}
                className="id-input"
            />
            <button className="login-button" onClick={handleLogin}>
                Login with MetaMask
            </button>
        </div>
    );
};

export default Login;