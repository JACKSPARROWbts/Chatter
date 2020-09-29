import React, { useState, useEffect,useRef } from 'react';
import "./ChatRoom.css";
import socketIOClient from 'socket.io-client';
import ShowDetails from '../ShowDetails/ShowDetails';
import uuid from 'react-uuid';
import Backdrop from '../../UI/Backdrop/Backdrop';
import InfoIcon from '@material-ui/icons/Info';
import axios from 'axios';
// import AttachmentIcon from '@material-ui/icons/Attachment';

const ENDPOINT = "localhost:5000/";
const socket = socketIOClient(ENDPOINT);



const ChatRoom = (props) => {
    const [userName, setUserName] = useState("");
    const [roomID, setRoomID] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showDetails, setShowDetails] = useState(false);
    const [img, setImg] = useState("");
    const [messageAlign, setMessageAlign] = useState("");
    const [imageAlign, setImageAlign] = useState("");
    const[txtfile,setTxtFile]=useState({name:"",type:"",size:"",data:""})
    const [blob,setBlob]=useState({text:""})
    const[url,setUrl]=useState("");
    const[download,setDownload]=useState([]);
    const[text,setText]=useState(false);
    const[link,setLink]=useState("");
    var type=document.getElementById('type')
    useEffect(() => {
        console.log(props)
        if (!props.location.state)
            return props.history.push("/");

        setUserName(props.location.state.userName);
        setRoomID(props.match.params.id);
        socket.emit("join", { userName: props.location.state.userName, roomID: props.match.params.id });
        socket.on("join", (time) => {
            console.log(time);
        });
        socket.on("message", ({ userName, message }) => {
            setMessageAlign("");
            addNewMessage(userName, message);
        });

        socket.on("send-image", ({ img }) => {
            setImageAlign("");
            addImagetoMessages(img);
        });
        socket.on("string file",({convert})=>{
            setUrl(convert)
        })
        socket.on("send textfile",({link})=>{
            fileDownload(link);
        })
    },[]);

    const addNewMessage = (userName, message) => {
        const newMessage = (
            <div key={uuid()} >
  <p className={"message " + messageAlign} id="zero" key={uuid()}><span>{userName} - </span>{message}</p>
</div>
        );
        setMessages(oldMessages => [ ...oldMessages, newMessage ]);
    }

    const addImagetoMessages = (img) => {
        const imgHtml = (
            <img className={"img-msg " + imageAlign} src={img} key={uuid()} alt="image N/A" />
        );
        setMessages(oldMessages => [ ...oldMessages, imgHtml ]);
    }

    const handleInputChange = (e) => {
        socket.emit('typing',{userName:props.location.state.userName,roomID:props.match.params.id})

            socket.on("typing",({userName})=>{
                type.innerHTML=`<p>${userName}is typing</p>`
                setTimeout(() => {
                    type.innerHTML="  "
                }, 2000);
                      })
        setMessage(e.target.value);
        setUserName(props.location.state.userName);
        setMessageAlign("message-align");
    }

    const arrayBufferToBase64 = (buffer) => {
        var binary = '';
        buffer.forEach((b) => binary += String.fromCharCode(b));
        return window.btoa(binary);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        const roomID = props.match.params.id
        if (message) {
            var type=document.getElementById("type")
            socket.emit("message", { userName, message, roomID });
            setMessageAlign("");
            addNewMessage("You", message);
            setMessage("");
            type.innerHTML=" ";
        }
        if (img) {
            socket.emit("send-image", { userName, img, roomID });
            setImageAlign("");
            addImagetoMessages(img);
            setImg("");
        }
        if(text){
            setBlob(blob.text=url);
            const bloburl=new Blob([blob.text],{type:'text/plain'});
            const sliceblob=bloburl.slice(0,1000)
            const print=window.URL.createObjectURL(sliceblob)
             socket.emit("send textfile",({link:print,roomID:roomID}))
             socket.on("send textfile",({link})=>{
                 console.log("the download is",link);
                 fileDownload(link);
             })
            
        }
    }

    const toggleInfo = () => {
        setShowDetails(prev => !prev);
    }
    const fileDownload=(print)=>{
         const link=(
             <a href={print} key={uuid()} download={txtfile.name}>Download</a>
         )
         setDownload(urls=>[...urls,link]);
        }
const redirect=(e)=>{
    props.history.push('/room/videocall/'+uuid()) 
}
    const addFile = async (e) => {
        if (e.target.files[0].type==="text/plain"){
            setText(true);
            const{name,type,size,data}=e.target.files[0]
            setTxtFile(txtfile.name=name,txtfile.type=type,txtfile.size=size,txtfile.data=data)
            console.log(txtfile.name,txtfile.type,txtfile.size);
            var fileReader=new FileReader(),
            slice=e.target.files[0].slice(0,100000);
            fileReader.readAsArrayBuffer(slice);
            fileReader.onload=(evt)=>{
                var arrayBuffer=fileReader.result;
                console.log("The arraybuffer is",arrayBuffer);
                console.log('the evt is',evt.target)
                socket.emit('slice upload',{
                    name:txtfile.name,
                    type:txtfile.type,
                    size:txtfile.size,
                    roomID:roomID,
                    data:arrayBuffer
                });                
            }
            
        }
        else{
        setImageAlign("img-align")
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const buffer = res.data;
            const base64Flag = "data:image.jpeg;base64,";
            const imageStr = arrayBufferToBase64(buffer.data.data);
            setImg(base64Flag + imageStr);
        } catch(err) {
            if (err.response.status === 500) {
                console.log("server error");
            } else {
                console.log(err.response.data.msg);
            }
        }
    }
    }


    let show = showDetails ? <ShowDetails roomID={roomID} /> : null;

    return (
        <div className='chat'>
            <Backdrop show={showDetails} clicked={toggleInfo} />
            <div id='sidebar' className='chat-sidebar'>

            </div>
            <div className='chat-main'>
                  
                <div  className='chat-messages'>
                    { messages }
                    {download}
                </div>
                    <p id="type"></p>
                <div className='compose'>
                    <form id="message-form" onSubmit={sendMessage} >
                        <textarea rows="1" name="message" type="text" placeholder="Message" value={message} onChange={handleInputChange} />
                        <button style={{height:40,width:70,
                        backgroundColor:" #7C5CBF",border:"none",color:"white",
                        fontSize:18}} id="button" >Send</button>
                    </form>
                    <InfoIcon style={{height:40}} fontSize="large" className="info-icon" onClick={toggleInfo} />
                    <label htmlFor="file-upload" className="custom-file-upload">
                        Custom Upload
                    </label>
                    <input id="file-upload" type="file" onChange={addFile} />
                    { show }
                    <button style={{height:40,width:70,backgroundColor:" #7C5CBF",
                border:"none",color:"white",fontSize:18}}  onClick={redirect}>call</button>
                </div>    
            </div>
        </div>
    );
}

export default ChatRoom;