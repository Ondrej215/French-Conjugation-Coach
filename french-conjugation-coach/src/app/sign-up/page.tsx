'use client';
import {useState, useEffect} from 'react';
import styles from './styles.module.css';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { redirect } from 'next/navigation';
import { useSession } from '../../../hooks/useSession';

export default function SignUp(){
    const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
    const [role, setRole] = useState('student');
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [passwordOneInput, setPasswordOneInput] = useState<string>('');
    const [passwordTwoInput, setPasswordTwoInput] = useState<string>('');
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

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
    };

    const handleSignUp = async (email:string, password:string) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
          })

        if (error){
            console.log('Signup error:', error.message)
            setErrorMessage('Something went wrong, try again later.');
        }else{

            if (data.user){

            if (role === "student"){
                const { data:insertData, error:insertError } = await supabase
                .from('TBLstudent')
                .insert([{
                    student_id: data.user.id,
                    student_name: email.replace('@frenchcoach.com', '')
                }])

                if (insertError){
                    console.log('Insert error:', insertError.message);
                    setErrorMessage('Something went wrong, try again later.');
                }
            }else{
                const { data:insertData, error:insertError } = await supabase
                .from('TBLteacher')
                .insert([{
                    teacher_id: data.user.id,
                    teacher_name: email.replace('@frenchcoach.com', '')
                }])

                if (insertError){
                    console.log('Insert error:', insertError.message);
                    setErrorMessage('Something went wrong, try again later.');
                }
            }

            }else{
                setErrorMessage('Something went wrong, try again later.');
            }

            setUsernameInput('');
            setPasswordOneInput('');
            setPasswordTwoInput('');

            const { data:logInData, error:logInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if (logInError){
                console.log('Login after signup error:', logInError.message)
                setErrorMessage('Something went wrong, try again later.');
            }else{
                redirect('/account');
            }
        }
    }

    async function signUpButton(){
        const username = usernameInput + '@frenchcoach.com';

        if (passwordOneInput !== passwordTwoInput){
            console.log('Passwords dont match')
            setErrorMessage('Your passwords do not match.');
            return;
        }

        if (passwordOneInput.length < 6){
            setErrorMessage('Your password must be atleast 6 characters.');
            return;
        }

        if (usernameInput.length < 2){
            setErrorMessage('Your username must be atleast 2 characters.')
            return;
        }

        const { data, error } = await supabase
        .from('TBLstudent')
        .select('student_name')
        .eq('student_name', usernameInput)
        .maybeSingle();

    if (data) {
        setErrorMessage('That username is already taken.');
        return;
    }

    if (error && error.code !== 'PGRST116') {
        setErrorMessage('Something went wrong, try again later.');
        console.error(error.message);
        return;
    }

        const password = passwordOneInput;

        handleSignUp(username, password);
    }

    return(<>   
    <p style={{fontSize:'2.5rem', fontWeight:'500', position:'absolute', left:'0vw', width:'100vw', textAlign:'center', top:'10vh'}}>Sign Up</p>
    <div style={{background:'#1c1e28', position:'absolute', left:isPortrait?'5vw':'30vw', top:'20vh', width:isPortrait?'90vw':'40vw', height:'50vh', borderRadius:'15px'}}>

    <p style={{fontSize:isPortrait?'1.2rem':'1.6rem', position:'absolute', left:isPortrait?'3vw':'2vw', top:isPortrait?'6.5vh':'6vh'}}>Username</p>
    <input value={usernameInput} onChange={e => setUsernameInput(e.target.value)} style={{position:'absolute', left:isPortrait?'23vw':'15vw', top:isPortrait?'5vh':'5vh', width:isPortrait?'55vw':'20vw', height:'8vh'}}/>

    <p style={{fontSize:isPortrait?'1.2rem':'1.6rem', position:'absolute', left:isPortrait?'3vw':'2vw', top:isPortrait?'17.5vh':'17vh'}}>Password</p>
    <input value={passwordOneInput} onChange={e => setPasswordOneInput(e.target.value)}  style={{position:'absolute', left:isPortrait?'23vw':'15vw', top:isPortrait?'16vh':'16vh', width:isPortrait?'55vw':'20vw', height:'8vh'}}/>

    <p style={{fontSize:isPortrait?'1.2rem':'1.6rem', position:'absolute', left:isPortrait?'3vw':'2vw', top:isPortrait?'27vh':'25.5vh', width:isPortrait?'20vw':'13vw'}}>Confirm Password</p>
    <input value={passwordTwoInput} onChange={e => setPasswordTwoInput(e.target.value)}   style={{position:'absolute', left:isPortrait?'23vw':'15vw', top:isPortrait?'27vh':'27vh', width:isPortrait?'55vw':'20vw', height:'8vh'}}/>

        <p style={{fontSize:isPortrait?'1rem':'1.3rem', position:'absolute', top:'39vh', left:'2vw', width:isPortrait?'20vw':'9vw'}}>Account Type</p>
        <select id="role" value={role} onChange={handleChange} style={{position:'absolute', left:isPortrait?'22vw':'11vw', top:isPortrait?'38vh':'38vh', width:isPortrait?'24vw':'10vw'}}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            </select>

        <button onClick={() => {signUpButton()}} style={{position:'absolute', left:isPortrait?'50vw':'23vw', top:'38vh', width:isPortrait?'35vw':'13vw', height:'6vh'}}>Confirm</button>
    </div>

    <Link href='/log-in' className={styles.Link} style={{fontSize:'2rem', position:'absolute', top:'75vh', left:'0vw', width:'100vw', textAlign:'center'}}>Log In Instead</Link>

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