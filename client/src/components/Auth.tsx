import { useState } from 'react';
import './Auth.css'
import { FaEnvelope, FaUserAlt } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


export default function LoginForm() {
    sessionStorage.clear()
    const [isLogin, setIsLogin] = useState<Boolean>(true);
    const [enteredInvalidCred, setEnteredInvalidCred] = useState<Boolean>(false)  
    const [serverError, setServerError] = useState<Boolean>(false)  
    const [emailExists, setEmailExists] = useState<Boolean>(false)
    const [passwordMatch, setPasswordMatch] = useState<Boolean>(true)
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [user, setUser] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<null | string>(null)
    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setEmailExists(false)
        setPasswordMatch(true)
        setEnteredInvalidCred(false)
    };

    const navigate = useNavigate();

    const handleSubmit = (e: any) => {
        setPasswordMatch(true)
        setEmailExists(false)
        setEnteredInvalidCred(false)
        setServerError(false)

        e.preventDefault();
        if(!isLogin){
          if (!user || !email || !password) {
            alert('Please fill out all fields correctly.');
            return;
          }
          else if(!isLogin && password !== confirmPassword){
            setPasswordMatch(false)
            return
          }
        }
        else{
          if(!user || !password){
            alert('Please fill out all fields correctly.');
            return;
          }
        }
    
        if(isLogin)
            handleLogin(email, password)
        else
            handleSignup(user, email, password)
    };

    const handleLogin = async (username: string, password: string) => {
        
        var res
        try{
            res = await axios.post('http://localhost:3000/api/v1/auth/login', {
                username: username,
                password: password
            })
        }
        catch(error: any){
            if(error.response){
                if(error.response.status === 401){
                    setEnteredInvalidCred(true)    
                    setError('Wrong email or password')
                }
            }
            else{
                setServerError(true)
                setError('There has been a problem, please try again later (could not reach backend)')
            }
        }

        
        if(res?.status === 201) {
            sessionStorage.setItem('token', res.data.access_token)
            const decodedToken:  { sub:number, username: string, iat: number, exp: number } = jwtDecode(res.data.access_token) 
            sessionStorage.setItem('username', decodedToken.username)
            navigate('/chat')
        }}

      const handleSignup = async (user: string, email: string, password: string) => {
        try{
          const res = await axios.post('http://localhost:3000/api/v1/auth/register', {
              username: user,
              email: email,
              password: password
          })
          sessionStorage.setItem('token', res.data.token)
          sessionStorage.setItem('user', res.data.user.username)
          navigate('/chat')
          setEmailExists(false)
      }
      catch(error){
          setEmailExists(true)
      }   
      }




    return (
        <div className='wrapper'>
            <form action="" onSubmit={handleSubmit}>
                {isLogin ? <h1>Login</h1> : <h1>Sign Up</h1>}
                <div style={{marginBottom:"15%"}}>

                {!isLogin &&
                    <div className="input-box">
                        <input value={email} type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="Email" maxLength={48} required/>
                        <FaEnvelope className='icon'/>
                    </div>
                }
                <div className="input-box">
                    <input value={user} type="text" onChange={(e)=>setUser(e.target.value)}placeholder="Username" maxLength={20} required/>
                    <FaUserAlt className='icon'/>
                </div>
                <div className="input-box">
                    <input value={password} type="password" onChange={(e)=>setPassword(e.target.value)} placeholder="Password" maxLength={48} required/>
                    <FaLock className='icon'/>
                </div>

                {isLogin && (enteredInvalidCred || serverError) && (
                    <p className='invalid-cred'>{error}</p>
                )}

                {!isLogin &&
                    <div className="input-box">
                        <input value={confirmPassword} type="password" onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm Password" maxLength={48} required/>
                        <FaLock className='icon'/>
                    </div>
                }

                {!isLogin && emailExists && (
                    <p className='invalid-cred'>An account with this email already exists</p>
                )}

                {!isLogin && !emailExists && !passwordMatch && (
                <p className='invalid-cred'>Passwords don't match</p>
                )}

                </div>
                {isLogin &&
                    <div className="remember-forgot">
                        <label><input type="checkbox" />Remember me</label>
                        <a onClick={()=>handleLogin("guest", "123456")}>Login as guest</a>
                    </div>
                }   
                {isLogin ? 
                <div>
                    <button type='submit'>Login</button>
                    <div className="register-link">
                        <p>Don't have an account?<a onClick={toggleAuthMode}> Register</a></p>
                    </div>
                </div> :
                <div>
                    <button type='submit'>Sign up</button>
                    <div className="register-link">
                        <p>Already have an account?<a onClick={toggleAuthMode}> Login</a></p>
                    </div>
                </div>}
            </form>
        </div>
    )
    }

