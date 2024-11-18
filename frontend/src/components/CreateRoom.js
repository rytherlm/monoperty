import { React, useState, useEffect } from "react";
import "./styles/CreateRoom.css";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

const CreateRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [existingRooms, setExistingRooms] = useState([]);
  const [username, setUsername] = useState(""); // Add username state
  const navigate = useNavigate();

  // Fetch available games when component mounts
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:3000/data');
        const data = await response.json();
        setExistingRooms(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();

    // Clean up cookies
    const deleteCookie = (name) => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    };
    deleteCookie("roomCode");
    deleteCookie("selectedRoom");

    // Socket.IO event listeners
    socket.on('room-created', ({ roomCode, userName }) => {
      console.log(`Room created: ${roomCode} by ${userName}`);
      document.cookie = `roomCode=${roomCode}; path=/`;
      document.cookie = `username=${userName}; path=/`;
      navigate("/loading-room");
    });

    socket.on('room-exists', ({ message }) => {
      alert(message);
    });

    socket.on('invalid-room-code', ({ message }) => {
      alert(message);
    });

    socket.on('username-too-short', ({ message }) => {
      alert(message);
    });

    // Cleanup function
    return () => {
      socket.off('room-created');
      socket.off('room-exists');
      socket.off('invalid-room-code');
      socket.off('username-too-short');
    };
  }, [navigate]);

  const handleCreateRoom = () => {
    if (!roomCode) {
      alert("Please enter a room code before creating a room.");
      return;
    }

    if (!username) {
      alert("Please enter a username.");
      return;
    }

    // Emit create-room event to server
    socket.emit('create-room', roomCode, username);
  };

  return (
    <div className="create-room-container">
      <p className="room-code">Room Code</p>
      <input
        className="create-room-input"
        placeholder="1234"
        maxLength={10}
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      
      <p className="username">Username</p>
      <input
        className="username-input"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <select 
        className="existing-games-dropdown" 
        value={selectedRoom} 
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">New Game</option>
        {existingRooms.map((game, index) => (
          <option key={index} value={game.name || game.id}>
            {game.name || game.id}
          </option>
        ))}
      </select>

      <button className="create-new-game" onClick={handleCreateRoom}>
        New Game
      </button>
    </div>
  );
};

export default CreateRoom;