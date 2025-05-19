'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useSession } from '../../../../../hooks/useSession';
import { supabase } from '../../../../../lib/supabaseClient';

export default function ClassSettings() {
  const { session, loading } = useSession();
  const { class: classId } = useParams();
  const router = useRouter();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [requireAccents, setRequireAccents] = useState<boolean>(true);
  const [selectedMaxPoints, setSelectedMaxPoints] = useState<string>('Unlimited');
  const [selectedMinQuestions, setSelectedMinQuestions] = useState<string>('10');
  const [allowJoins, setAllowJoins] = useState<boolean>(true);
  const [resetStatsWarning, setResetStatsWarning] = useState<boolean>(false);

  const maxPointsOptions = ['100', '200', '300', '400', '500', '750', '1000', '2000', 'Unlimited'];
  const minQuestionsOptions = ['0', '10', '20', '30', '40', '50'];

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

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('TBLclass')
        .select('min_questions, max_points, accents_required, allow_joins')
        .eq('class_id', classId)
        .single(); // only expect one class

      if (error) {
        console.error('Error fetching class settings:', error);
        return;
      }

      if (data) {
        setSelectedMinQuestions(data.min_questions);
        setSelectedMaxPoints(data.max_points === null ? "Unlimited" : data.max_points);
        setRequireAccents(data.accents_required === 'true');
        setAllowJoins(data.allow_joins === 'true');
      }
    }

    fetchSettings();
  }, [classId]); // runs when page loads or classId changes

  useEffect(() => {
    const verifyAccess = async () => {
      if (!session || loading) return;

      // Check if class exists and get its teacher_id
      const { data, error } = await supabase
        .from('TBLclass')
        .select('teacher_id')
        .eq('class_id', classId)
        .single();

      // If the class doesn't exist or there's an error, redirect
      if (error || !data) {
        router.replace('/classes');
        return;
      }

      // If current user is the teacher, grant access
      if (data.teacher_id === session.user.id) {
        setAuthorized(true);
      } else {
        // Otherwise, redirect
        router.replace('/classes');
      }
    };

    verifyAccess();
  }, [session, loading, classId, router]);

  async function saveSettings() {
    try {
        

      const maxPoints = selectedMaxPoints === 'Unlimited' ? null : selectedMaxPoints;
  
      const { error } = await supabase
        .from('TBLclass')
        .update({
          min_questions: selectedMinQuestions,
          max_points: maxPoints,
          accents_required: requireAccents,
          allow_joins: allowJoins
        })
        .eq('class_id', classId);
  
      if (error) {
        console.error('Error updating settings:', error);
      } else {
        router.push(`/classes/${classId}`)
      }

    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }

  async function resetClassStats() {
    const { data, error } = await supabase
      .from('TBLstudentclass')
      .select('student_id, score, num_wins')
      .eq('class_id', classId);
  
    if (error) {
      console.error('Error fetching students:', error);
      return;
    }
  
    if (!data || data.length === 0) {
      console.log('No students found in this class.');
      return;
    }
  
    const sortedStudents = data.sort((a, b) => b.score - a.score);
    const topStudent = sortedStudents[0];
  
    const updateTop = await supabase
      .from('TBLstudentclass')
      .update({ num_wins: topStudent.num_wins + 1 })
      .eq('student_id', topStudent.student_id)
      .eq('class_id', classId)
      .select();
  
    if (updateTop.error) {
      console.error('Error updating top student win count:', updateTop.error.message || updateTop.error);
    }
  
    for (let i = 0; i < sortedStudents.length; i++) {
      const student = sortedStudents[i];
      const updateRank = await supabase
        .from('TBLstudentclass')
        .update({ previous_rank: i + 1 })
        .eq('student_id', student.student_id)
        .eq('class_id', classId)
        .select();
  
      if (updateRank.error) {
        console.error(`Error updating rank for student ${student.student_id}:`, updateRank.error.message || updateRank.error);
      } else if (updateRank.data.length === 0) {
        console.warn(`No row found for student ${student.student_id} in class ${classId} — maybe the filter doesn't match?`);
      }
    }
  
    const resetStats = await supabase
      .from('TBLstudentclass')
      .update({
        score: 0,
        present_corrects: 0,
        present_questions: 0,
        imperfect_questions: 0,
        imperfect_corrects: 0,
        future_questions: 0,
        future_corrects: 0,
        past_questions: 0,
        past_corrects: 0,
        participle_questions: 0,
        participle_corrects: 0,
        imperative_questions: 0,
        imperative_corrects: 0,
        subjunctive_questions: 0,
        subjunctive_corrects: 0,
        conditional_questions: 0,
        conditional_corrects: 0,
        points_today: 0
      })
      .eq('class_id', classId);
  
    if (resetStats.error) {
      console.error('Error resetting stats:', resetStats.error.message || resetStats.error);
    }
  
    router.push(`/classes/${classId}`);
  }

  if (loading || authorized === null) return null;

  if (!session) {
    redirect('/log-in');
  }

  return (
    <>
      <p style={{ position: 'absolute', top: '12vh', width: '100vw', fontSize: isPortrait ? '6vw' : '3vw', textAlign: 'center' }}>
        Class Settings
      </p>
  
      <div
        style={{
          backgroundColor: '#272832',
          position: 'absolute',
          left: isPortrait ? '5vw' : '12.5vw',
          width: isPortrait ? '90vw' : '75vw',
          height: '70vh',
          top: '22vh',
          borderRadius: '15px',
          zIndex:'-2',
        }}
      >
        <p style={{ width: isPortrait ? '90vw' : '75vw', textAlign: 'center', marginTop: '3vh', fontSize: isPortrait ? '2.8vw' : '1.4vw' }}>
          For student drills to count towards the class leaderboard and stats, the drills will need to meet these criteria
        </p>
  
        <label
          style={{ fontSize: isPortrait ? '3.8vw' : '1.8vw', marginTop: '5vh' }}
          className="flex items-center justify-center text-white cursor-pointer"
        >
          <input
            type="checkbox"
            checked={requireAccents}
            onChange={(e) => setRequireAccents(e.target.checked)}
            className="peer hidden"
          />
          <span className="w-5 h-5 mr-2 border-2 border-white rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></span>
          Strict Accents Required
        </label>
  
        <br />
  
        <div className="flex justify-center items-center gap-8 mt-4">
          <div className="flex flex-col items-center">
            <p style={{ fontSize: isPortrait ? '2.4vw' : '1.2vw', textAlign: 'center' }}>
              Maximum Points Per Day
            </p>
            <select
              value={selectedMaxPoints}
              onChange={(e) => setSelectedMaxPoints(e.target.value)}
              className="mt-2"
            >
              {maxPointsOptions.map((option: any) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
  
          <div className="flex flex-col items-center">
            <p style={{ fontSize: isPortrait ? '2.4vw' : '1.2vw', textAlign: 'center' }}>
              Minimum Questions Per Drill
            </p>
            <select
              value={selectedMinQuestions}
              onChange={(e) => setSelectedMinQuestions(e.target.value)}
              className="mt-2"
            >
              {minQuestionsOptions.map((option: any) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          style={{ fontSize: isPortrait ? '3.8vw' : '1.8vw', marginTop: '5vh' }}
          className="flex items-center justify-center text-white cursor-pointer"
        >
          <input
            type="checkbox"
            checked={allowJoins}
            onChange={(e) => setAllowJoins(e.target.checked)}
            className="peer hidden"
          />
          <span className="w-5 h-5 mr-2 border-2 border-white rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></span>
            Allow New Students to Join
        </label>

        <button style={{position:'absolute', left:isPortrait?'25vw':'27.5vw', width:isPortrait?'40vw':'20vw', height:'8vh', marginTop:'3vh'}} onClick={async () => {
        await saveSettings();
      }}>Save</button>
  
        <button
          style={{
            position: 'absolute',
            left: isPortrait ? '27.5vw' : '27.5vw',
            width: isPortrait ? '35vw' : '20vw',
            height: '8vh',
            marginTop: '14vh'
          }}
          onClick={() => {setResetStatsWarning(true)}}
        >
          Start New Leaderboard
        </button>

        {resetStatsWarning && (<>
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backdropFilter: 'blur(5px)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 10
    }}></div>
    
    <div style={{
      position: 'fixed',
      background: 'white',
      left: isPortrait ? '10vw' : '25vw',
      top: '25vh',
      width: isPortrait ? '80vw' : '50vw',
      height: '50vh',
      zIndex: 11,
      borderRadius: '15px',
      backgroundColor:'#31324B'
    }}>
        <p style={{fontSize:isPortrait?'3.8vw':'1.6vw', width:isPortrait?'80vw':'50vw', textAlign:'center', marginTop:'6vh'}}>Are you sure you want to start a new leaderboard?<br></br>This will reset all class stats, and the current 1st place will be recorded as the winner on the class leaderboard wins table.</p>
      <button  onClick={async () => { resetClassStats() }} style={{position:'absolute', left:isPortrait?'10vw':'5vw', width:isPortrait?'28vw':'18vw', top:'35vh', height:'7vh', fontSize:isPortrait?'4vw':'2vw'}}>Yes</button>
      <button onClick={() => { setResetStatsWarning(false) }} style={{position:'absolute', left:isPortrait?'45vw':'27vw', width:isPortrait?'28vw':'18vw', top:'35vh', height:'7vh', fontSize:isPortrait?'4vw':'2vw'}}>No</button>
    </div>
  </>)}
      </div>
    </>
  )};