'use client';
import { redirect } from 'next/navigation';
import { useSession } from '../../../hooks/useSession';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function Account(){

    const { session, loading, role, accountInfo} = useSession();
    const router = useRouter();
    const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

    useEffect(() => {
      const handleResize = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      };
  
      if (typeof window !== 'undefined') {
        handleResize();
        window.addEventListener('resize', handleResize);
      }
  
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize);
        }
      };
    }, []);

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
      await supabase.auth.refreshSession();
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
    let present_score:number = 0;
    let imperfect_score:number = 0;
    let past_score:number = 0;
    let future_score:number = 0;
    let participle_score:number = 0;
    let imperative_score:number = 0;
    let subjunctive_score:number = 0;
    let conditional_score:number = 0;
    let info: {
      total_score: string;
      streak: string;
      last_updated_local_time: string;
      present_questions: number;
      present_corrects: number;
      imperfect_questions: number;
      imperfect_corrects: number;
      past_questions: number;
      past_corrects: number;
      future_questions: number;
      future_corrects: number;
      participle_questions: number;
      participle_corrects: number;
      imperative_questions: number;
      imperative_corrects: number;
      subjunctive_questions: number;
      subjunctive_corrects: number;
      conditional_questions: number;
      conditional_corrects: number;
    } | null = null;
    let sortedScores:any = [];

    if (accountInfo && role === "student"){
       info = accountInfo as typeof info;
            
        totalScore = info!.total_score;
        streak = info!.streak;
        present_score = Math.round((info!.present_corrects / info!.present_questions)*100);
        imperfect_score = Math.round((info!.imperfect_corrects / info!.imperfect_questions)*100);
        past_score = Math.round((info!.past_corrects / info!.past_questions)*100);
        future_score = Math.round((info!.future_corrects / info!.future_questions)*100);
        participle_score = Math.round((info!.participle_corrects / info!.participle_questions)*100);
        imperative_score = Math.round((info!.imperative_corrects / info!.imperative_questions)*100);
        subjunctive_score = Math.round((info!.subjunctive_corrects / info!.subjunctive_questions)*100);
        conditional_score = Math.round((info!.conditional_corrects / info!.conditional_questions)*100);

        const scores = [
          { tense: "Present", score: present_score },
          { tense: "Imperfect", score: imperfect_score },
          { tense: "Past Participle", score: past_score },
          { tense: "Future Simple", score: future_score },
          { tense: "Present Participle", score: participle_score },
          { tense: "Imperative", score: imperative_score },
          { tense: "Subjunctive", score: subjunctive_score },
          { tense: "Conditional", score: conditional_score }
        ];

        sortedScores = [...scores].sort((a, b) => a.score - b.score);

    }else{
      totalScore = '0';
    }

    type ScoreEntry = {
      score: number;
      tense: string;
    };

    function getColorForTense(tenseName: string) {
      const entry = sortedScores.find((e: ScoreEntry) => e.tense === tenseName);
      if (!entry) return "white";
    
      const index = sortedScores.indexOf(entry);
      if (index <= 1 && sortedScores[index].score !== 100) return "red";
      if (index >= sortedScores.length - 2) return "green";
      return "white";
    }

    return(<>
    <p style={{position:'absolute', width:'100vw', top:'10vh', textAlign:'center', fontSize: isPortrait ? '7vw' : '3.5vw', fontWeight:'500'}}>{username}</p>
<p style={{position:'absolute', width:'100vw', top:'22vh', textAlign:'center', fontSize: isPortrait ? '3vw' : '1.5vw', fontWeight:'300'}}>{account_role}</p>

<div style={{backgroundColor:'#0C0C13', position:'absolute', width:'100vw', height:'70vh', top:'30vh'}}>
  {role === 'student' ?
  <>
    <p style={{position:'absolute', left:'0vw', top:'5vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '3.6vw' : '1.8vw', fontWeight:'500'}}>All Time Stats</p>
    <p style={{position:'absolute', left:'0vw', top:'15vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.8vw' : '1.4vw', fontWeight:'300'}}>{totalScore} Total Points</p>
    <p style={{position:'absolute', left:'0vw', top:'23vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.8vw' : '1.4vw', fontWeight:'300'}}>{streak} Day Streak</p>
    <p style={{position:'absolute', left:'0vw', top:'31vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.8vw' : '1.4vw', fontWeight:'300'}}>100% All time accuracy</p>

    <p style={{position:'absolute', left:'50vw', top:'5vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '3.6vw' : '1.8vw', fontWeight:'500'}}>Tense Accuracies</p>
    <p style={{position:'absolute', left:'50vw', top:'12vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Present")}}>{present_score}% Present</p>
    <p style={{position:'absolute', left:'50vw', top:'17vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Imperfect")}}>{imperfect_score}% Imperfect</p>
    <p style={{position:'absolute', left:'50vw', top:'22vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Past Participle")}}>{past_score}% Past Participle</p>
    <p style={{position:'absolute', left:'50vw', top:'27vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Future Simple")}}>{future_score}% Future Simple</p>
    <p style={{position:'absolute', left:'50vw', top:'32vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Present Participle")}}>{participle_score}% Present Participle</p>
    <p style={{position:'absolute', left:'50vw', top:'37vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Imperative")}}>{imperative_score}% Imperative</p>
    <p style={{position:'absolute', left:'50vw', top:'42vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Subjunctive")}}>{subjunctive_score}% Subjunctive</p>
    <p style={{position:'absolute', left:'50vw', top:'47vh', width:'50vw', textAlign:'center', fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight:'300', color: getColorForTense("Conditional")}}>{conditional_score}% Conditional</p>
  </> : <></>}

  <button onClick={() => {handleLogout()}} style={{position:'absolute', left:'38vw', top:'46vh', width:'24vw', height:'8vh', fontSize: isPortrait ? '3vw' : '1.5vw'}}>Log Out</button>
</div>
    </>);
}