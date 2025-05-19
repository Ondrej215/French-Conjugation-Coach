'use client';
import styles from'./styles.module.css';
import { useSession } from '../../../hooks/useSession';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FAQAbout(){
    const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
          };
        
          if (typeof window !== "undefined") {
            handleResize();
            window.addEventListener('resize', handleResize);
          }
          
          return () => {
            if (typeof window !== "undefined") {
              window.removeEventListener('resize', handleResize);
            }
          };
  }, []);

  if (isPortrait === null) {
    return null;
  }

    return(<>
        <div className={styles.scrollDiv}>
            <p style={{fontSize:isPortrait?'10vw':'5vw', width:'100vw', textAlign:'center', marginTop:'6vh'}}>Help</p>
            <div style={{minHeight:'100vh', backgroundColor:'#0C0C13', marginTop:'4vh', textAlign:'center'}}>
                <Link className={styles.helpLink} href='#verbDrills' style={{color:'#3B6FBF', fontSize:isPortrait?'4vw':'2vw', marginTop:'3vh'}}>Verb Drills</Link>
                <br></br>
                <Link className={styles.helpLink} href='#classes' style={{color:'#3B6FBF', fontSize:isPortrait?'4vw':'2vw', marginTop:'3vh'}}>Classes</Link>
                <br></br>

                <p id="verbDrills" style={{fontSize:isPortrait?'6vw':'3vw', marginTop:'6vh', fontWeight:'500'}}>Verb Drills</p>
                <p>Before starting a drill, you will be shown a few options to set up how your drill will work.</p>
<p>You can either choose a maximum number of questions by picking from the total questions dropdown, or select unlimited practice, which will continue until you decide to end the drill.</p>
<p>You can also adjust the strict accents setting to decide whether incorrect accents will be marked wrong or ignored. If youre in a class that requires strict accents, disabling it will mean your drill stats will not be saved for that class. You can find more details in the Classes help section.</p>
<p>You can also turn off leaderboard mode if you do not want the drill to count towards class stats. However, it will still count towards your personal account stats if you are signed in.</p>

<br></br>

<p>During drills, you will be given a French verb in its infinitive form. (This is the equivalent of &quot;to __&quot; in English, for example, &quot;to play&quot; is an infinitive.)</p>
<p>Your task is to conjugate the verb into the correct tense and pronoun given. You do not need to type the pronoun alongside the conjugated form.</p>

<br></br>

<p>After submitting your answer, you will be told whether you were correct, and the correct form will be shown as feedback. For the first 10 questions, you will earn 10 points per correct answer; after that, 5 points. Incorrect answers earn 0 points.</p>
<p>After each question, you can either move to the next one or end the drill early. If you selected a fixed number of questions, you will finish automatically once you reach it, but you can still choose to stop earlier if you want.</p>

<br></br>

<p>At the end of the drill, you will see your stats, including your overall accuracy and accuracy by tense. If you are signed in, your stats will also be saved to your personal account and any classes you are part of, as long as your drill meets the class rules. More info is available in the Classes help section.</p>

                <p id="classes" style={{fontSize:isPortrait?'6vw':'3vw', marginTop:'6vh', fontWeight:'500'}}>Classes</p>

                <p>Classes allow teachers and students to view group performance in verb drills. Each class also has a leaderboard where students can compete by earning points in drills.</p>

<p>Only teacher accounts can create classes. After creating a class, teachers can view and share the join code from the class dashboard. Students can join by entering this code after clicking the &quot;Join Class&quot; button in the classes menu. Each class can only have one teacher. Both teachers and students can create or join as many classes as they want.</p>

<br></br>

<p>Teachers can manage class rules to set standards for drills that count towards class stats. They can require strict accents to be turned on, set a daily maximum number of points students can earn, and set a minimum number of questions per drill.</p>

<p>Students can still complete drills however they would like, all drills count toward their personal stats. However, a drill will only count towards a class if it follows the rules of that class. Students do not need to do separate drills for each class; one drill can apply to all classes they are part of, as long as it meets the rules.</p>

<br></br>

<p>In the class settings, teachers can also reset class stats and start a new leaderboard. When this happens, the student who is top of the leaderboard will be marked as the champion, and all stats will reset. This is useful for tracking new trends in tense accuracy or starting fresh at the beginning of a new term if the class is for a school.</p>

<br></br><br></br><br></br><br></br>
            </div>
        </div>
    </>);
}