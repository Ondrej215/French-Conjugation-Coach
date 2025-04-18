'use client';
import { redirect } from 'next/navigation';
import { useSession } from '../../../hooks/useSession';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Account(){

    const { session, loading, role, accountInfo} = useSession();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !session) {
        redirect('/log-in');
      }
    }, [loading, session]);

    function capitalise(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    if (loading || !session) return null;

    const handleLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }else{
        router.push('/log-in');
      }
    }

    let username:string = '';

    if (typeof session.user.email === 'string'){
      username = capitalise(session.user.email).replace('@frenchcoach.com', '')
    }

    let account_role:string = '';
    if (typeof role === 'string'){
      account_role = capitalise(role);
    }

    let totalScore:string = '';
    let streak:string = '';
    if (accountInfo && role === "student"){
      const info = accountInfo as { total_score: string, streak: string};
      totalScore = info.total_score;
      streak = info.streak;
    }else{
      totalScore = '0';
    }

    return(<>
    <p style={{position:'absolute', width:'100vw', top:'10vh', textAlign:'center', fontSize:'3.5rem', fontWeight:'500'}}>{username}</p>
    <p style={{position:'absolute', width:'100vw', top:'22vh', textAlign:'center', fontSize:'1.5rem', fontWeight:'300'}}>{account_role}</p>
    
    <div style={{backgroundColor:'#0C0C13', position:'absolute', width:'100vw', height:'70vh', top:'30vh'}}>
      {role === 'student'?
      <><p style={{position:'absolute', left:'0vw', top:'5vh', width:'50vw', textAlign:'center', fontSize:'1.8rem', fontWeight:'500'}}>All Time Stats</p>
      <p style={{position:'absolute', left:'0vw', top:'15vh', width:'50vw', textAlign:'center', fontSize:'1.4rem', fontWeight:'300'}}>{totalScore} Total Points</p>
      <p style={{position:'absolute', left:'0vw', top:'23vh', width:'50vw', textAlign:'center', fontSize:'1.4rem', fontWeight:'300'}}>{streak} Day Streak</p>
      <p style={{position:'absolute', left:'0vw', top:'31vh', width:'50vw', textAlign:'center', fontSize:'1.4rem', fontWeight:'300'}}> 100% All time accuracy</p>

      <p style={{position:'absolute', left:'50vw', top:'5vh', width:'50vw', textAlign:'center', fontSize:'1.8rem', fontWeight:'500'}}>Tense Accuracies</p>
      </>:<></>}

      <button onClick={() => {handleLogout()}}style={{position:'absolute', left:'38vw', top:'46vh', width:'24vw', height:'8vh'}}>Log Out</button>
    </div>
    </>);
}