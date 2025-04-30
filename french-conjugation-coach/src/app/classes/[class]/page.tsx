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

  const [overallClassAccuracy, setOverallClassAccuracy] = useState(0);
const [presentClassAccuracy, setPresentClassAccuracy] = useState(0);
const [imperfectClassAccuracy, setImperfectClassAccuracy] = useState(0);
const [futureClassAccuracy, setFutureClassAccuracy] = useState(0);
const [pastClassAccuracy, setPastClassAccuracy] = useState(0);
const [participleClassAccuracy, setParticipleClassAccuracy] = useState(0);
const [imperativeClassAccuracy, setImperativeClassAccuracy] = useState(0);
const [subjunctiveClassAccuracy, setSubjunctiveClassAccuracy] = useState(0);
const [conditionalClassAccuracy, setConditionalClassAccuracy] = useState(0);
const [sortedAccuracies, setSortedAccuracies] = useState<any>([]);
const [pointsToday, setPointsToday] = useState<number>(0);
const [lastUpdated, setLastUpdated] = useState<string | null>(null);
const [prevRank, setPrevRank] = useState<number | null>(null);

const today = new Date().toISOString().split('T')[0];

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
          numWins: rest.num_wins?? null,
        };
      });

      // sort students by their score
      flatData.sort((a, b) => b.score - a.score);

      let totalQuestions = 0;
let totalCorrects = 0;

let presentQuestions = 0, presentCorrects = 0;
let imperfectQuestions = 0, imperfectCorrects = 0;
let futureQuestions = 0, futureCorrects = 0;
let pastQuestions = 0, pastCorrects = 0;
let participleQuestions = 0, participleCorrects = 0;
let imperativeQuestions = 0, imperativeCorrects = 0;
let subjunctiveQuestions = 0, subjunctiveCorrects = 0;
let conditionalQuestions = 0, conditionalCorrects = 0;

flatData.forEach(student => {
  totalQuestions += student.totalQuestions;
  totalCorrects += student.totalCorrects;

  presentQuestions += student.present_questions || 0;
  presentCorrects += student.present_corrects || 0;
  imperfectQuestions += student.imperfect_questions || 0;
  imperfectCorrects += student.imperfect_corrects || 0;
  futureQuestions += student.future_questions || 0;
  futureCorrects += student.future_corrects || 0;
  pastQuestions += student.past_questions || 0;
  pastCorrects += student.past_corrects || 0;
  participleQuestions += student.participle_questions || 0;
  participleCorrects += student.participle_corrects || 0;
  imperativeQuestions += student.imperative_questions || 0;
  imperativeCorrects += student.imperative_corrects || 0;
  subjunctiveQuestions += student.subjunctive_questions || 0;
  subjunctiveCorrects += student.subjunctive_corrects || 0;
  conditionalQuestions += student.conditional_questions || 0;
  conditionalCorrects += student.conditional_corrects || 0;
});

// Set accuracies, preventing division by zero
setOverallClassAccuracy(totalQuestions ? parseFloat(((totalCorrects / totalQuestions) * 100).toFixed(1)) : 0);

setPresentClassAccuracy(presentQuestions ? parseFloat(((presentCorrects / presentQuestions) * 100).toFixed(1)) : 0);
setImperfectClassAccuracy(imperfectQuestions ? parseFloat(((imperfectCorrects / imperfectQuestions) * 100).toFixed(1)) : 0);
setFutureClassAccuracy(futureQuestions ? parseFloat(((futureCorrects / futureQuestions) * 100).toFixed(1)) : 0);
setPastClassAccuracy(pastQuestions ? parseFloat(((pastCorrects / pastQuestions) * 100).toFixed(1)) : 0);
setParticipleClassAccuracy(participleQuestions ? parseFloat(((participleCorrects / participleQuestions) * 100).toFixed(1)) : 0);
setImperativeClassAccuracy(imperativeQuestions ? parseFloat(((imperativeCorrects / imperativeQuestions) * 100).toFixed(1)) : 0);
setSubjunctiveClassAccuracy(subjunctiveQuestions ? parseFloat(((subjunctiveCorrects / subjunctiveQuestions) * 100).toFixed(1)) : 0);
setConditionalClassAccuracy(conditionalQuestions ? parseFloat(((conditionalCorrects / conditionalQuestions) * 100).toFixed(1)) : 0);
const freshTenseAccuracies = [
    { name: 'Present', accuracy: presentQuestions ? parseFloat(((presentCorrects / presentQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Imperfect', accuracy: imperfectQuestions ? parseFloat(((imperfectCorrects / imperfectQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Future', accuracy: futureQuestions ? parseFloat(((futureCorrects / futureQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Past', accuracy: pastQuestions ? parseFloat(((pastCorrects / pastQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Participle', accuracy: participleQuestions ? parseFloat(((participleCorrects / participleQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Imperative', accuracy: imperativeQuestions ? parseFloat(((imperativeCorrects / imperativeQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Subjunctive', accuracy: subjunctiveQuestions ? parseFloat(((subjunctiveCorrects / subjunctiveQuestions) * 100).toFixed(1)) : 0 },
    { name: 'Conditional', accuracy: conditionalQuestions ? parseFloat(((conditionalCorrects / conditionalQuestions) * 100).toFixed(1)) : 0 },
  ];
  
  setSortedAccuracies([...freshTenseAccuracies].sort((a, b) => b.accuracy - a.accuracy));
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
        .select('*')
        .eq('class_id', classId)
        .eq('student_id', session.user.id)
        .single();

      // If there's an error or no data (empty result), the user is not a student
      const isStudent = studentData && !studentError;

      // If user is neither a teacher nor a student, redirect
      if (!isStudent) {
        router.replace('/classes');
      }else{
        setPointsToday(studentData.points_today)
        setLastUpdated(studentData.last_updated);
        setPrevRank(studentData.previous_rank)
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
    <p style={{ fontSize: isPortrait ? '4vw' : '2.5vw', textAlign: 'center', fontWeight: '500', marginTop: '11vh' }}>
        {className}
    </p>
    <p style={{ fontSize: isPortrait ? '3.4vw' : '1.7vw', textAlign: 'center', fontWeight: '300', marginTop: '2vh' }}>
        Teacher - {teacherName}
    </p>
    {classMenu === "leaderboard" && <div style={{ backgroundColor: '#0C0C13', width: '100%', minHeight: '100vh', borderRadius: '15px', marginTop:'5vh', justifyItems:'center'}}>
        {role==='teacher' && (<div style={{justifyItems:'center'}}>
            <button
      style={{
        marginTop: '5vh',
        width: isPortrait ? '50vw' : '20vw',
        height: '6vh',
        fontSize: isPortrait ? '3.2vw' : '1.6vw',
      }}
      onClick={() => {
        router.push(`/classes/${classId}/settings`)
      }}
    >
      Class Settings
    </button>
            <div style={{width:'50vw', height:'10vh', alignItems:'center', display:'flex', flexDirection:'column'}}>
                <button style={{marginTop:'5vh', width:isPortrait?'50vw':'20vw', height:'6vh', fontSize:isPortrait?'3.2vw':'1.6vw'}} onClick={() => {setCodeVisible(!codeVisible)}}>{codeVisible?'Hide Join Code':'Show Join Code'}</button>
                {codeVisible && (<p style={{marginTop:'2vh', width:'50vw', fontSize:isPortrait?'3.2vw':'1.6vw', fontWeight:'500', textAlign:'center'}}>{classId}</p>)}
            </div>
        </div>)}

        <div style={{display:isPortrait?'block':'flex', width:'100vw', justifyContent:'center', marginTop:'10vh', justifyItems:'center'}}>
            <div style={{backgroundColor:'#2b2c3c', width:isPortrait?'85vw':'40vw', height:isPortrait?'30vh':'45vh', marginTop:'4vh', borderRadius:'15px', boxShadow:'10px 10px 10px rgba(0, 0, 0, 0.5)', textAlign:'center'}}>
                <p style={{fontSize:isPortrait?'3.6vw':'1.8vw', marginTop:'3vh'}}>{students.reduce((sum, student) => sum + (student.score || 0), 0)} Total Class Points</p>
                <p style={{fontSize:isPortrait?'3.6vw':'1.8vw', marginTop:'3vh'}}>{overallClassAccuracy}% Total Class Accuracy</p>
                {role === 'student' && <><p  style={{fontSize:isPortrait?'3.6vw':'1.8vw', marginTop:'3vh'}}>You have earned {lastUpdated === today?pointsToday:0} points today in this class</p>
                <p style={{fontSize:isPortrait?'3.6vw':'1.8vw', marginTop:'3vh'}}>Your previous leaderboard rank was {prevRank?prevRank:'N/A'}</p>
                </>}
            </div>
            <div style={{backgroundColor:'#2b2c3c', width:isPortrait?'85vw':'40vw', height:isPortrait?'30vh':'45vh', marginTop:'4vh', marginLeft:isPortrait?'0vw':'5vw', borderRadius:'15px', boxShadow:'10px 10px 10px rgba(0, 0, 0, 0.5)', textAlign:'center'}}>
                <p style={{fontWeight:'500', fontSize:isPortrait?'4vw':'2vw'}}>Class Rules</p>
                {!isPortrait && <br></br>}
                {classData.accents_required === 'true' && <p style={{fontSize:isPortrait?'3vw':'1.5vw'}}>Strict accents must be turned on.</p>}
                {classData.max_points !== null && <p style={{fontSize:isPortrait?'3vw':'1.5vw'}}>Maximum of {classData.max_points} points per day.</p>}
                {classData.min_questions !== null && <p style={{fontSize:isPortrait?'3vw':'1.5vw'}}>Minimum of {classData.min_questions} questions per drill.</p>}
                <br></br>
                <p style={{fontSize:isPortrait?'3vw':'1.5vw', fontWeight:'300'}}>{"Only drills that meet these rules will count towards this class's leaderboard and stats."}</p>
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
                <span style={{ width: '10%', marginLeft:isPortrait?'-2vw':'-0.5vw', fontSize:isPortrait?'1.6vw':'1.4vw' }}>Rank</span>
                <span style={{ width: '30%', marginLeft:isPortrait?'3vw':'1vw', fontSize:isPortrait?'1.6vw':'1.4vw' }}>Name</span>
                <span style={{ width: '20%', marginLeft:isPortrait?'-2vw':'0vw', fontSize:isPortrait?'1.6vw':'1.4vw' }}>Points</span>
                <span style={{ width: '20%', marginLeft:isPortrait?'0vw':'0vw' , fontSize:isPortrait?'1.6vw':'1.4vw' }}>Accuracy</span>
                <span style={{ width: '20%', marginLeft:isPortrait?'0vw':'0vw' , fontSize:isPortrait?'1.6vw':'1.4vw' }}>Questions</span>
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

        <div style={{display:isPortrait?'block':'flex', width:'100vw', justifyContent:'center', marginTop:'10vh', justifyItems:'center'}}>
        <div style={{backgroundColor:'#2b2c3c', width:isPortrait?'85vw':'40vw', height:isPortrait?'30vh':'50vh', marginTop:'4vh', borderRadius:'15px', boxShadow:'10px 10px 10px rgba(0, 0, 0, 0.5)', textAlign:'center', overflowY:'auto'}}>
  <p style={{fontSize:isPortrait?'4vw':'2vw', marginTop: '2vh'}}>Most Leaderboard Wins</p>
  <div style={{marginTop: '2vh'}}>
    {students
      .filter(student => student.numWins > 0)  // only students who have at least 1 win
      .sort((a, b) => b.numWins - a.numWins)   // highest wins first
      .slice(0, 5)                             // top 5 only
      .map((student, index) => (
        <div key={student.id || index} style={{marginBottom:'1vh'}}>
          <span style={{fontSize:isPortrait?'3.5vw':'1.5vw', color:'white'}}>
            {index + 1}. {student.student_name} - {student.numWins} wins
          </span>
        </div>
      ))}
    {students.filter(student => student.numWins > 0).length === 0 && (
      <p style={{fontSize:isPortrait?'3vw':'1.5vw', color:'white'}}>No wins yet.</p>
    )}
  </div>
</div>

            <div style={{backgroundColor:'#2b2c3c', width:isPortrait?'85vw':'40vw', height:isPortrait?'45vh':'50vh', marginTop:'4vh', borderRadius:'15px', boxShadow:'10px 10px 10px rgba(0, 0, 0, 0.5)', textAlign:'center', marginLeft:isPortrait?'0vw':'5vw'}}>
                <p style={{fontSize:isPortrait?'4vw':'2vw'}}>Class Tense Overview</p>
                <div style={{ fontSize: isPortrait ? '2.8vw' : '1.4vw', lineHeight: '1.8' }}>
    {sortedAccuracies.map((tense:any, index:any) => (
      <p key={index} style={{color:index < 2 && tense.accuracy > 0? 'green': index > 5 && tense.accuracy < 100? 'red':'white'}}>{tense.accuracy}% {tense.name}</p>
    ))}
  </div>
            </div>
        </div>

        <button className={styles.endButton} style={{width:isPortrait?'50vw':'20vw', backgroundColor:'red', height:'7vh', marginTop:'5vh', marginBottom:'15vh', fontSize:isPortrait?'3.2vw':'1.6vw'}}>{role==="student"?'Leave Class':'Delete Class'}</button>

    </div>}
</div>
  );
}