import {React, useState} from "react";
import "./styles/CreateRoom.css";
import { useNavigate } from "react-router-dom";


const CreateRoom = () =>{
    const [secreteCode, setSecreteCode] = useState("");
    const navigate = useNavigate();

    const updateSecreteCode = (e) => {
        setSecreteCode(e.target.value);
    }

    const handleCreateRoom = () => {



    }

    const handleUploadRoom = () => {
        
    }

    return (
        <div className="create-room-container">
            <p className="secrete-code">Secrete Code</p>
            <input
                className="create-room-input"
                placeholder="Enter Secrete Code"
                maxLength={10}
                value={secreteCode}
                onChange={updateSecreteCode}
            ></input>
            <button className="create-new-game" onClick={handleCreateRoom}>New Game</button>
            <hr></hr>
            // upload json file, need to make sure json, file, send alert if not, after file uploaded, and join game pressed and file check to be json go to loading room
            <button className="upload-new-game" onClick={handleUploadRoom}>Join Game</button>




            
        </div>
    )

}


export default CreateRoom;