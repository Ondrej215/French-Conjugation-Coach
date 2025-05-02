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
  const [requireAccents, setRequireAccents] = useState<boolean>(false);
  const [selectedMaxPoints, setSelectedMaxPoints] = useState<string>('Unlimited');
  const [selectedMinQuestions, setSelectedMinQuestions] = useState<string>('10');

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

        <button style={{position:'absolute', left:isPortrait?'25vw':'27.5vw', width:isPortrait?'40vw':'20vw', height:'7vh', marginTop:'4vh'}}>Save</button>
  
        <p style={{ width: isPortrait ? '90vw' : '75vw', textAlign: 'center', marginTop: '15vh', fontSize: isPortrait ? '2.8vw' : '1.4vw' }}>
          You can manage your class' students here
        </p>
  
        <button
          style={{
            position: 'absolute',
            left: isPortrait ? '5vw' : '15vw',
            width: isPortrait ? '35vw' : '20vw',
            height: '10vh',
            marginTop: '3vh',
          }}
        >
          Start New Leaderboard
        </button>
        <button
          style={{
            position: 'absolute',
            left: isPortrait ? '50vw' : '40vw',
            width: isPortrait ? '35vw' : '20vw',
            height: '10vh',
            marginTop: '3vh',
          }}
        >
          Kick Students
        </button>
      </div>
    </>
  )};