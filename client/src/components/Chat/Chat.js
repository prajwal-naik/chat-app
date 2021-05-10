import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import io from 'socket.io-client';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input'
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';

import './Chat.css';

let socket;

const Chat = ({location}) => {
	const [name, setName] = useState('');
	const [room, setRoom] = useState('');
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [users, setUsers] = useState('');
	const ENDPOINT="localhost:5000";

	useEffect(() => {
		const { name, room } = queryString.parse(location.search); //returns params passed 
		
		socket=io(ENDPOINT);

		setName(name);
		setRoom(room);

		socket.emit("join", {name: name, room: room}, ({ error }) => {
		});

		return () => {
			socket.emit("disconnect");
			socket.off();
		}

	}, [ENDPOINT, location.search]); //this is only for it to take place when the values in the list change

	useEffect(() => {
		socket.on('message', message => {
		  setMessages(messages => [ ...messages, message ]);
		});
		
		socket.on("roomData", ({ users }) => {
		  setUsers(users);
		});
	}, []);

	const sendMessage = (event) =>{

		event.preventDefault(); //because react refreshes browser on buttonpress or submit
		if(message){
			socket.emit('sendMessage', message, () => setMessage(''));
		}
	}

	return (
		<div className="outerContainer">
			<div className="container">

				<InfoBar room={room} />
				<Messages messages={messages} name={name} />
				<Input message={message} setMessage={setMessage}
						sendMessage={sendMessage}
				/>
			</div>
			<TextContainer users={users}/>
		</div>
	);
}

export default Chat;
