import React from 'react';
import "./ShowDetails.css";

const ShowDetails = (props) => {
    return (
        <div className="details">
            <h2>Joining Info</h2>
            <p>http://localhost:3000/{props.roomID}</p>
            <p>Room ID : {props.roomID}</p>
        </div>
    );
}

export default ShowDetails;