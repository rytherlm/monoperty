import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import LoadingRoom from './components/LoadingRoom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/loading-room" element={<LoadingRoom />} />
      </Routes>
    </Router>
   
  );
}

export default App;
