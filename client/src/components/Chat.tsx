import { useContext, useEffect, useRef, useState } from "react"
import { WebsocketContext } from "../contexts/WebsocketContext"
import axios from "axios"
import './Chat.css'

type MessagePayload = {
    id: number,
    content: string,
    createdAt: Date,
    userId: number,
    user: {
    username: string
    },
}

export const Chat = () => {

  
    const socket = useContext(WebsocketContext)
    const [value, setValue] = useState('')
    const [loading, setLoading] = useState<Boolean>(true)
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState<MessagePayload[]>([])
    const scrollableContainerRef = useRef<HTMLDivElement>(null);

    //Scrolls down at start and if there are new maessages
    useEffect(() => {
        if (scrollableContainerRef.current) {
          scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
        }
      }, [messages]);
    

    useEffect(() => {
        socket.on('connect', () => {
        })

        const fetchData = async () => {
            setLoading(true)
            try {
                const response: any = await axios.get('http://localhost:3000/api/v1/messages', {
                    headers: {
                    authorization: `Bearer ${sessionStorage.getItem('token')}`
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
            console.log(msgPayload)
            setMessages((prev)=> [...prev, msgPayload ])
        })
        

        return () => {
            console.log('Unregistering events')
            socket.off('connect')
            socket.off('onMessage')
        }
    }, [])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error} </p>;

    const onSubmit = () => {
        socket.emit('createMessage', value)
        setValue('')
    }

    return(
        <div className="container">
            <h1>Chat</h1>
            <div className="scrollable-container" ref={scrollableContainerRef}>
                {messages.length === 0 ? (<div>No messages yet</div>) : (<div>{messages.map((msg) => (<div key={msg.id}><p>{msg.user.username} : {msg.content}</p></div>))}</div>)}
            </div>
            <div className="submit-message">
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)}></input>
                <button onClick={onSubmit}>Submit</button>
            </div>
        </div>
      
    )
}