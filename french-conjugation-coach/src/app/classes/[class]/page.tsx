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

      const flatData = data.map(({ TBLstudent, ...rest }) => ({
        ...rest,
        student_name: TBLstudent?.student_name ?? 'Unknown',
      }));
      setStudents(flatData);
    };

    if (session) {
      checkClassExists();
      getClassStudents();
    }
  }, [classId, session]);

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
        <div style={{height:'10vh', backgroundColor:'#161623', marginTop:'5vh', justifyContent:'center', alignItems:'center', gap:'5vw', display:'flex'}}>
            <p className={styles.linkText} role="button" onClick={() => {setClassMenu('leaderboard')}} style={{fontSize:(classMenu==="leaderboard")?'1.8rem':'1.6rem', color:(classMenu==="leaderboard")?'#9776D0':'white', fontWeight:(classMenu==="leaderboard")?'500':'400'}}>Leaderboard</p>
            <p className={styles.linkText} role="button" onClick={() => {setClassMenu('students')}} style={{fontSize:(classMenu==="students")?'1.8rem':'1.6rem', color:(classMenu==="students")?'#9776D0':'white', fontWeight:(classMenu==="students")?'500':'400'}}>Students</p>
            {role==="teacher" && <p className={styles.linkText} role="button" onClick={() => {setClassMenu('settings')}} style={{fontSize:(classMenu==="settings")?'1.8rem':'1.6rem', color:(classMenu==="settings")?'#9776D0':'white', fontWeight:(classMenu==="settings")?'500':'400'}}>Settings</p>}
        </div>
        <div style={{ backgroundColor: '#0C0C13', width: '100%', height: '1000px', borderRadius: '15px' }}>
            {role==='teacher' && <div style={{marginLeft:'30vw', width:'40vw', height:'10vh'}}>
                <button style={{marginTop:'5vh', marginLeft:isPortrait?'0vw':'10vw', width:isPortrait?'40vw':'20vw', height:'6vh'}} onClick={() => {setCodeVisible(!codeVisible)}}>{codeVisible?'Hide Join Code':'Show Join Code'}</button>
                {codeVisible && (<p style={{marginTop:'2vh', width:'40vw', fontSize:'1.5rem', fontWeight:'500', textAlign:'center'}}>{classId}</p>)}
            </div>}
        </div>
    </div>
  );
}