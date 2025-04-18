'use client';
import {useState, useEffect} from 'react';
import styles from './styles.module.css';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { redirect } from 'next/navigation';
import { useSession } from '../../../hooks/useSession';

export default function LogIn(){
    const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [passwordInput, setPasswordInput] = useState<string>('');
    const { session, loading } = useSession();
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
          };
        
          handleResize();
          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
        }, []);

        useEffect(() => {
          if (!loading && session) {
            redirect('/account');
          }
        }, [loading, session]);

    async function handleLogIn(email:string, password:string){
        const { data:logInData, error:logInError } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password,
                    })
        
                    if (logInError){
                        console.log('Login after signup error:', logInError.message)
                        setErrorMessage('Invalid login credentials');
                    }else{
                        redirect('/account');
                    }
    }

    function logInButton(){
        const username = usernameInput + '@frenchcoach.com';
        const password = passwordInput;

        handleLogIn(username, password);
    }

    return(<>   
    <p style={{fontSize:'2.5rem', fontWeight:'500', position:'absolute', left:'0vw', width:'100vw', textAlign:'center', top:'10vh'}}>Log In</p>
    <div style={{background:'#1c1e28', position:'absolute', left:isPortrait?'5vw':'30vw', top:'20vh', width:isPortrait?'90vw':'40vw', height:'50vh', borderRadius:'15px'}}>
        
        <p style={{fontSize:isPortrait?'1.2rem':'1.6rem', position:'absolute', left:isPortrait?'3vw':'2vw', top:isPortrait?'6.5vh':'6vh'}}>Username</p>
        <input value={usernameInput} onChange={e => setUsernameInput(e.target.value)} style={{position:'absolute', left:isPortrait?'23vw':'15vw', top:isPortrait?'5vh':'5vh', width:isPortrait?'55vw':'20vw', height:'8vh'}}/>

        <p style={{fontSize:isPortrait?'1.2rem':'1.6rem', position:'absolute', left:isPortrait?'3vw':'2vw', top:isPortrait?'19.5vh':'19vh'}}>Password</p>
        <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}  style={{position:'absolute', left:isPortrait?'23vw':'15vw', top:isPortrait?'18vh':'18vh', width:isPortrait?'55vw':'20vw', height:'8vh'}}/>
   
        <button onClick={logInButton} style={{position:'absolute', left:isPortrait?'28vw':'13.5vw', top:'40vh', width:isPortrait?'35vw':'13vw', height:'6vh'}}>Confirm</button>
    </div>

    <Link href='/sign-up' className={styles.Link} style={{fontSize:'2rem', position:'absolute', top:'75vh', left:'0vw', width:'100vw', textAlign:'center'}}>Sign Up Instead</Link>
    
    {errorMessage && (
  <p style={{
    position: 'absolute',
    top: '17vh',
    left:isPortrait?'15vw':'30vw',
    width: isPortrait?'70vw':'40vw',
    textAlign: 'center',
    color: 'white',
    backgroundColor: '#ff4d4f',
    padding: '0.8rem',
    borderRadius: '8px',
    fontSize: '1rem'
  }}>
    {errorMessage}
  </p>
)}
    </>);
}