import React, { useState } from "react";
import "./styles/Login.css";
import {useNavigate } from "react-router-dom";

const Login = () => {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setName(e.target.value);
    };

    const handleCreateRoom = () => {
        if (name) {
            document.cookie = `playerName=${name}; path=/`;
            navigate("/create-room");
        } else {
            alert("Please enter a name before creating a room.");
        }
    };

    const handleJoinRoom = () => {
        if (name) {
            document.cookie = `playerName=${name}; path=/`;
            navigate("/join-room");
        } else {
            alert("Please enter a name before joining a room.");
        }
    }

    return (
        <div className="login-container">
            <h1>Welcome To Monoperty</h1>
            <div className="login-square">
                <p>In Game Name</p>
                <input
                    className="login-input"
                    value={name}
                    onChange={handleInputChange}
                    placeholder="BestPlayerNumberOne"
                    maxLength={20}
                />
                <button className="create-room" onClick={handleCreateRoom}>
                    Create Room
                </button>
                <button className="join-room" onClick={handleJoinRoom}>
                    Join Room
                </button>
            </div>
        </div>
    );
};

export default Login;