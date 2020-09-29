import React, { useState } from 'react';
import uuid from 'react-uuid';
import './JoinRoom.css';

const JoinRoom = (props) => {
    const [userName, setUserName] = useState("");
    const [roomID, setRoomID] = useState("");
    const [isValid, setisValid] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        props.history.push("/room/" + roomID, {
            userName
        });
    }

    const createMeeting = () => {

        if (userName === "") {
            setisValid(false);
            return;
        }

        props.history.push("/room/" + uuid(), {
            userName
        });
    }

    const handleInputChange = (e) => {
        switch (e.target.name) {
            case "username": {
                setUserName(e.target.value);
                if (e.target.value === "")
                    setisValid(false)
                else
                    setisValid(true);
                break;
            }
            case "roomID": {
                setRoomID(e.target.value);
                break;
            }
            default: {}
        }
    }

    let errorMessage = null;
    if (!isValid)
        errorMessage = (
            <p style={{color: "red"}}>User name is required !</p>
        );

    return (
        <div className='centered-form'>
            <div className='centered-form__box'>
                <h1>Join/Create</h1>
                <form onSubmit={handleSubmit}>
                    <label>Display name</label>
                    <input type='text' name='username' placeholder='Display name' required onChange={handleInputChange} />
                    { errorMessage }
                    <label>Room ID</label>
                    <input type='text' name='roomID' placeholder='room id' required onChange={handleInputChange} />
                    <button type="submit">Join</button>
                </form>
                <button onClick={createMeeting}>Create</button>
            </div>
        </div>
    );
}

export default JoinRoom;