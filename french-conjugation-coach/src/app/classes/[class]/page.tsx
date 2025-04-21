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
  const [classData, setClassData] = useState<any>();

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
      setClassData(data);
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

            {/* Class stats and rules, alongside on landscape, vertically on portrait */}
            <div style={{display:isPortrait?'block':'flex', width:'100vw', justifyContent:'center', marginTop:'10vh', justifyItems:'center'}}>
                <div style={{backgroundColor:'#1c1e28', width:isPortrait?'85vw':'40vw', height:isPortrait?'30vh':'45vh', marginTop:'4vh', borderRadius:'15px', boxShadow:'10px 10px 10px rgba(0, 0, 0, 0.5)'}}>

                </div>
                <div style={{backgroundColor:'#1c1e28', width:isPortrait?'85vw':'40vw', height:isPortrait?'30vh':'45vh', marginTop:'4vh', marginLeft:isPortrait?'0vw':'5vw', borderRadius:'15px', boxShadow:'10px 10px 10px rgba(0, 0, 0, 0.5)', textAlign:'center'}}>
                    <p style={{fontWeight:'500', fontSize:'2rem'}}>Class Rules</p>
                    {!isPortrait && <br></br>}
                    {classData.accents_required === 'true' && <p style={{fontSize:isPortrait?'1.1rem':'1.5rem'}}>Strict accents must be turned on.</p>}
                    {classData.max_points !== null && <p style={{fontSize:isPortrait?'1.1rem':'1.5rem'}}>Maximum of {classData.max_points} points per day.</p>}
                    {classData.min_questions !== null && <p style={{fontSize:isPortrait?'1.1rem':'1.5rem'}}>Minimum of {classData.min_questions} questions per drill.</p>}
                    <br></br>
                    <p style={{fontSize:isPortrait?'1.1rem':'1.5rem', fontWeight:'300'}}>{"Only drills that meet these rules will count towards this class's leaderboard and stats."}</p>
                </div>
            </div>

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
    borderBottom: '0.5vh solid rgb(52, 47, 72)',
    fontWeight: '600',
    color: '#fff',
  }}>
    <span style={{ width: '10%', marginLeft:isPortrait?'-2vw':'-0.5vw', fontSize:isPortrait?'0.8rem':'1.4rem' }}>Rank</span>
    <span style={{ width: '30%', marginLeft:isPortrait?'3vw':'1vw', fontSize:isPortrait?'0.8rem':'1.4rem' }}>Name</span>
    <span style={{ width: '20%', marginLeft:isPortrait?'-2vw':'0vw', fontSize:isPortrait?'0.8rem':'1.4rem' }}>Score</span>
    <span style={{ width: '20%', marginLeft:isPortrait?'0vw':'0vw' , fontSize:isPortrait?'0.8rem':'1.4rem' }}>Accuracy</span>
    <span style={{ width: '20%', marginLeft:isPortrait?'0vw':'0vw' , fontSize:isPortrait?'0.8rem':'1.4rem' }}>Questions</span>
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