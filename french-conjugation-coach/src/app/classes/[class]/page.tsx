'use client';
import { useParams, useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useSession } from '../../../../hooks/useSession';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import styles from './styles.module.css';

export default function ClassPage() {
  const params = useParams();
  const classId = params.class as string;
  const { session, loading, role, accountInfo } = useSession();
  const router = useRouter();

  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [validClass, setValidClass] = useState<boolean | null>(null);
  const [className, setClassName] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [teacherID, setTeacherID] = useState<string>('');
  const [codeVisible, setCodeVisible] = useState<boolean>(false);
  const [classMenu, setClassMenu] = useState<string>('leaderboard');

  // Handle window resize for portrait mode
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

  // Fetch class details and students
  useEffect(() => {
    const checkClassExists = async () => {
      const { data, error } = await supabase
        .from('TBLclass')
        .select('*, TBLteacher ( teacher_name )')
        .eq('class_id', classId)
        .single();

      if (!data || error) {
        setValidClass(false);
        return;
      }

      setValidClass(true);
      setClassName(data.class_name);
      setTeacherName(data.TBLteacher.teacher_name);
      setTeacherID(data.teacher_id);
    };

    const getClassStudents = async () => {
      const { data, error } = await supabase
        .from('TBLstudentclass')
        .select('*, TBLstudent (student_name)')
        .eq('class_id', classId);

      if (error) {
        console.error(error);
        return;
      }

      const flatData = data.map(({ TBLstudent, ...rest }) => {
        const {
          present_questions = 0,
          imperfect_questions = 0,
          future_questions = 0,
          past_questions = 0,
          participle_questions = 0,
          imperative_questions = 0,
          subjunctive_questions = 0,
          conditional_questions = 0,
    
          present_corrects = 0,
          imperfect_corrects = 0,
          future_corrects = 0,
          past_corrects = 0,
          participle_corrects = 0,
          imperative_corrects = 0,
          subjunctive_corrects = 0,
          conditional_corrects = 0,
        } = rest;
    
        const totalQuestions =
          present_questions +
          imperfect_questions +
          future_questions +
          past_questions +
          participle_questions +
          imperative_questions +
          subjunctive_questions +
          conditional_questions;
    
        const totalCorrects =
          present_corrects +
          imperfect_corrects +
          future_corrects +
          past_corrects +
          participle_corrects +
          imperative_corrects +
          subjunctive_corrects +
          conditional_corrects;
    
        return {
          ...rest,
          student_name: TBLstudent?.student_name ?? 'Unknown',
          totalQuestions,
          totalCorrects,
        };
      });

      // sort students by their score
      flatData.sort((a, b) => b.score - a.score);
    
      setStudents(flatData);
    };

    if (session) {
      checkClassExists();
      getClassStudents();
    }
  }, [classId, session]);

  useEffect(() => {
    console.log(students)
  }, [students])

  // Check if user is authorized to stay on the page
  useEffect(() => {
    if (!session || validClass === null || loading) return;

    const checkAuthorization = async () => {
      // If class is invalid, redirect
      if (!validClass) {
        router.replace('/classes');
        return;
      }

      const isTeacher = session.user.id === teacherID;

      // If user is the teacher, allow them to stay
      if (isTeacher) {
        return;
      }

      // Check if user is a student in the class
      const { data: studentData, error: studentError } = await supabase
        .from('TBLstudentclass')
        .select('student_id')
        .eq('class_id', classId)
        .eq('student_id', session.user.id);

      // If there's an error or no data (empty result), the user is not a student
      const isStudent = studentData && studentData.length > 0 && !studentError;

      // If user is neither a teacher nor a student, redirect
      if (!isStudent) {
        router.replace('/classes');
      }
    };

    checkAuthorization();
  }, [session, validClass, teacherID, classId, router, loading]);

  if (loading || validClass === null) return null;

  if (!session) {
    redirect('/log-in');
  }

  if (!validClass) return null;

  return (
    <div className={styles.scrollableClass}>
      {/*<p>Students: {students.map((i) => i.student_name).join(', ') || 'No students'}</p>*/}

        <p style={{ fontSize: isPortrait ? '2rem' : '2.5rem', textAlign: 'center', fontWeight: '500', marginTop: '11vh' }}>
            {className}
        </p>
        <p style={{ fontSize: '1.7rem', textAlign: 'center', fontWeight: '300', marginTop: '2vh' }}>
        Teacher - {teacherName}
        </p>
        {classMenu === "leaderboard" && <div style={{ backgroundColor: '#0C0C13', width: '100%', minHeight: '100vh', borderRadius: '15px', marginTop:'5vh'}}>
            {role==='teacher' && (<>
                <button style={{marginTop:'5vh', marginLeft:isPortrait?'25vw':'40vw', width:isPortrait?'50vw':'20vw', height:'6vh'}}>Class Settings</button>
            <div style={{marginLeft:'25vw', width:'50vw', height:'10vh'}}>
                <button style={{marginTop:'5vh', marginLeft:isPortrait?'0vw':'15vw', width:isPortrait?'50vw':'20vw', height:'6vh'}} onClick={() => {setCodeVisible(!codeVisible)}}>{codeVisible?'Hide Join Code':'Show Join Code'}</button>
                {codeVisible && (<p style={{marginTop:'2vh', width:'50vw', fontSize:'1.5rem', fontWeight:'500', textAlign:'center'}}>{classId}</p>)}
            </div>
            </>)}

            <div style={{
  backgroundColor: '#0C0C13',
  borderRadius: '15px',
  marginTop: '5vh',
  padding: '2vh',
  width: '90%',
  marginLeft: 'auto',
  marginRight: 'auto',
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1vh 2vw',
    borderBottom: '0.5vh solid #4E436B',
    fontWeight: '600',
    color: '#fff',
  }}>
    <span style={{ width: '10%' }}>Rank</span>
    <span style={{ width: '30%' }}>Name</span>
    <span style={{ width: '20%' }}>Score</span>
    <span style={{ width: '20%' }}>Accuracy</span>
    <span style={{ width: '20%' }}>Questions</span>
  </div>

  {students.map((student, index) => {
    const accuracy = student.totalQuestions > 0
      ? ((student.totalCorrects / student.totalQuestions) * 100).toFixed(1)
      : '0.0';

    return (
      <div
        key={student.student_id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginLeft:'1.5vw',
          padding: '1vh 1vw',
          borderBottom: '0px solid #222',
          color: '#ccc',
        }}
      >
        <span style={{ width: '10%' }}>{index + 1}</span>
        <span style={{ width: '30%' }}>{student.student_name}</span>
        <span style={{ width: '20%' }}>{student.score}</span>
        <span style={{ width: '20%' }}>{accuracy}%</span>
        <span style={{ width: '20%' }}>{student.totalQuestions}</span>
      </div>
    );
  })}
</div>
        </div>}
    </div>
  );
}