import { useContext, useEffect, useRef, useState } from "react"
import { WebsocketContext } from "../contexts/WebsocketContext"
import axios from "axios"
import './Chat.css'
import { useNavigate, useParams } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

type MessagePayload = {
    id: number,
    content: string,
    createdAt: Date,
    userId: number,
    user: {
    username: string
    },
    prettyTimestamp: string
}

export const Chat = () => {

    const navigate = useNavigate()
    
    const { socket } = useContext(WebsocketContext);
    const [value, setValue] = useState('')
    const [loading, setLoading] = useState<Boolean>(true)
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState<MessagePayload[]>([])
    const [userColor, setUserColor] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date());
    const scrollableContainerRef = useRef<HTMLDivElement>(null)
    const params = useParams()



    var roomId = params.id
    if(!roomId){
        roomId = import.meta.env.VITE_DEFAULT_ROOM
    }
    
    const roomExists = async () => {
        const _ =  await axios.get(`${import.meta.env.VITE_API_URL}/rooms/${roomId}`, {
            headers: {
                authorization: `Bearer ${sessionStorage.getItem('token')}`
            }
        })
        if(!_.data.id){
            return(<p>Room does not exist</p>)
        }
    }

    const checkJwtExpiry = () => {
        const currentTime = new Date().getTime()
        const decodedToken = jwtDecode(sessionStorage.getItem('token')!)
        const jwtExpiry = decodedToken.exp! * 1000
        
        if(jwtExpiry && jwtExpiry < currentTime){
            alert("Session expired please log in again.");
            navigate('/')
        }
    }
    
    
    roomExists()
    
    useEffect(() => {
        const intervalId = setInterval(() => {
          setCurrentTime(new Date());
        }, 60000); // Update every minute
    
        return () => clearInterval(intervalId); // Cleanup on unmount
      }, [])

    //scrolls down to the bottom and if there are new maessages
    useEffect(() => {
        if (scrollableContainerRef.current) {
          scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
        }
      }, [messages]);

    useEffect(() => {
        const token = sessionStorage.getItem('token')
        if(!token){
            navigate('/')
        }

        checkJwtExpiry()        

        const val = '#' + Math.floor(Math.random()*(256*256*256)).toString(16)
        setUserColor(val)
        
        if(socket){
            socket.on('connect', () => {
                socket.emit('joinRoom', roomId)
            })

            const fetchData = async () => {
                setLoading(true)
                try {
                    const response: any = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${roomId}`, {
                        headers: {
                        authorization: `Bearer ${token}`
                    }});
                setMessages(response.data.reverse());
                
                } catch (err: any) {
                setError(err.message);
                } finally { 
                setLoading(false);
                }
            };
        
            fetchData();

            socket.on('onMessage', (msgPayload: MessagePayload) => {
                setMessages((prev)=> [...prev, msgPayload ])
            })
            
            return () => {
                socket.off('connect')
                socket.off('onMessage')
            }
    }}, [socket])


    const handleKeyDown = (event: React.KeyboardEvent) => {
        
        if (event.key === 'Enter') {
            event.preventDefault(); 
            document.getElementById('submit-button')?.click();
        }};

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error} </p>;

    

    const onSubmit = () => {
        checkJwtExpiry()
        if(value.length !== 0){
            socket!.emit('createMessage', {message: value, roomId: roomId})
            setValue('')
        }
    }



    const getHowLongAgo = (date: Date) => {
        const now = currentTime.getTime()
        const past = new Date(date).getTime()
        const timeDiffMilisec = now - past;

        const diffMinutes = Math.ceil(timeDiffMilisec / (1000 * 60));
        const diffHours = Math.floor(timeDiffMilisec / (1000 * 60 * 60));
        const diffDays = Math.floor(timeDiffMilisec / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(timeDiffMilisec / (1000 * 60 * 60 * 24 * 30));
        var returnStr
        if (diffMinutes < 60) {
            returnStr = `${diffMinutes}m`;
        } 
        else if (diffHours < 24) {
            returnStr = `${diffHours} hr`;
        } 
        else if (diffDays < 30) {
            returnStr = `${diffDays} days`;
        } 
        else {
            returnStr = `${diffMonths} months`;
        }
        return(<p className="time-stamp">{returnStr}</p>)
    }

    const handleCreateRoom = async () => {
        try{
            const response: any = await axios.post(`${import.meta.env.VITE_API_URL}/rooms`, {}, {
                headers:{
                    authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            })
            setValue(value => value + ' #' + response.data.id + ' ')
        }
        catch(error: any){
            setError(error.message)
        }
    }  

    const printContent = (message: string) => {
        var msgBefore: string = ''
        var msgAfter: string = ''
        const index = message.indexOf('#')
        var subIndex
        var roomLink: string = ''
        if(index !== -1){
            msgBefore = message.substring(0, index)
            const substr = message.substring(index)
            subIndex = substr.indexOf(' ')
            if(subIndex !== -1){
                roomLink = substr.substring(0, subIndex)
                msgAfter = substr.substring(subIndex)
            }
            else{
                roomLink = substr.substring(0)
            }
        }
        const len = roomLink.length
        return(len !== 0 ? (<p> {msgBefore} <a href={`http://localhost:5173/chat/${roomLink}`}>{roomLink}</a> {msgAfter}</p>) : (<p> {message} </p>))
    }

    return(
        <div className="container">
            {roomId === import.meta.env.VITE_DEFAULT_ROOM ? <h1>Chat</h1> : <h1><a href={`http://localhost:5173/chat`}>Main</a></h1>}
            <div className="scrollable-container" ref={scrollableContainerRef}>
                {messages.length === 0 ? (<div>No messages yet</div>) : (<div>{messages.map((msg) => (
                    <div key={msg.id} className="message"><p style={{color: userColor, width: "130px"}}>{msg.user.username} :</p>
                    {printContent(msg.content)} 
                    {getHowLongAgo(msg.createdAt)}
                    </div>))}</div>)}
                </div>
            <div className="submit-message">
                <input onKeyDown={handleKeyDown} type="text" maxLength={90} value={value} onChange={(e) => setValue(e.target.value)}></input>
                <button id="submit-button" onClick={onSubmit}>Send</button>
                <button id="create-room-button" onClick={handleCreateRoom}>+</button>
            </div>
        </div>
    )
    
}