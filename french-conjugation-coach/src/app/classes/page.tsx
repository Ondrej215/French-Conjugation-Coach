'use client';
import { redirect } from 'next/navigation';
import { useSession } from '../../../hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function Classes() {
  const { session, loading, role } = useSession();
  const router = useRouter();
  const [studentClasses, setStudentClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!session?.user?.id) return;

      if (role === 'student') {
        const { data, error } = await supabase
          .from('TBLstudentclass')
          .select('*, TBLclass(class_name)')
          .eq('student_id', session.user.id);

        if (error) {
          console.error('Failed to fetch class data:', error.message);
        } else {
          setStudentClasses(data);
        }
      } else if (role === 'teacher') {
        const { data, error } = await supabase
          .from('TBLclass')
          .select('*')
          .eq('teacher_id', session.user.id);

        if (error) {
          console.error('Failed to fetch class data:', error.message);
        } else {
          setStudentClasses(data);
        }
      }
    };

    if (session && role) {
      fetchClasses();
    }
  }, [session, role]);

  useEffect(() => {
    console.log('Classes:', studentClasses);
  }, [studentClasses]);

  if (loading) return null;

  if (!session) {
    redirect('/log-in');
  }

  

  return (
    <>
      {role === 'teacher' ? (
        <button
          onClick={() => router.push('/classes/create-class')}
          style={{
            position: 'absolute',
            left: '35vw',
            top: '15vh',
            width: '30vw',
            height: '8vh',
            alignContent: 'center',
          }}
        >
          Create Class
        </button>
      ) : (
        <button
          onClick={() => router.push('/classes/join-class')}
          style={{
            position: 'absolute',
            left: '35vw',
            top: '15vh',
            width: '30vw',
            height: '8vh',
            alignContent: 'center',
          }}
        >
          Join Class
        </button>
      )}

<div
  className='classLinksDiv'
  style={{
    marginTop: '30vh',
    marginLeft: '10vw',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '80vw',
    alignItems: 'center'
  }}
>
  {studentClasses.length === 0 ? (
    <p>No classes found.</p>
  ) : (
    studentClasses.map((cls) => (
      <div
        key={cls.class_id}
        onClick={() => router.push(`/classes/${cls.class_id}`)}
        className='classLinks'
      >
        <p style={{ margin: 0 }}>
          {role === 'student'
            ? cls.TBLclass?.class_name || 'Unknown class'
            : cls.class_name}
        </p>
      </div>
    ))
  )}
</div>
    </>
  );
}