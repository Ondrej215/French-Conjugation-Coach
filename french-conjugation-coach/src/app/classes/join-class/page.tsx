'use client';
import { redirect } from 'next/navigation';
import { useSession } from '../../../../hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function JoinClass(){

    const { session, loading, role, accountInfo} = useSession()
    const router = useRouter();
    const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
    const [classcodeInput, setClasscodeInput] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

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

    if (loading) return null
  
    if (!session) {
      redirect('/log-in');
    }

    if (role === 'teacher'){
        redirect('/classes');
    }

    const checkStudentInClass = async (): Promise<boolean> => {
      
        if (!session?.user?.id) {
          console.log('Failed to get user ID');
          setErrorMessage('Session error, log back into your account and try again.')
          return false;
        }
      
        const { data, error } = await supabase
          .from('TBLstudentclass')
          .select('student_id') // just selecting 1 column to keep it light
          .eq('student_id', session.user.id)
          .eq('class_id', classcodeInput.toUpperCase())
          .maybeSingle(); // prevents error if no row found
      
        if (error) {
          console.log('Supabase query error:', error.message);
          setErrorMessage('Something went wrong, try again later.')
          return false;
        }
      
        return !!data;
      };

    const checkClassCodeExists = async (classCode: string): Promise<boolean> => {
        const { data, error } = await supabase
          .from('TBLclass')
          .select('allow_joins') // make sure this column exists and is selectable
          .eq('class_id', classCode)
          .maybeSingle(); // optional: avoids throwing an error if no match
      
        if (error) {
          console.log('Supabase error:', error.message);
          setErrorMessage('Something went wrong, try again later.')
          return false;
        }

        if (!data){
            setErrorMessage('Invalid class code.')
        }else if (data.allow_joins === 'false'){
            setErrorMessage('This class currently is not accepting new students.')
            return false
        }
      
        return !!data;
      };

    async function confirmButton(){
        const classCode = classcodeInput.toUpperCase();

        // checks class exists and student not already in class before joining class
        if (await checkClassCodeExists(classCode)){
            if (!(await checkStudentInClass())){
            if (!session?.user?.id) {
                console.log('Failed to get user ID');
                setErrorMessage('Session error, log back into your account and try again.')
                return;
              }
            
              const { error } = await supabase.from('TBLstudentclass').insert([
                {
                  class_id: classCode,
                  student_id: session.user.id
                }
              ]);
            
              if (error) {
                console.log('Insert error:', error.message);
                setErrorMessage('Something went wrong, try again later')
              } else {
                setClasscodeInput('');
                router.replace(`/classes/${classCode}`)
              }
            }else{
                console.log('already in class');
                setErrorMessage('You are already in this class.')
            }
        }else{
            console.log('doesnt exist')
        }
    }

    return(<>
    <div style={{position:'absolute', left:isPortrait?'10vw':'20vw', top:'15vh', height:'70vh', width:isPortrait?'80vw':'60vw', backgroundColor:'#1c1e28', borderRadius:'15px'}}></div>
    <p style={{textAlign:'center', fontSize:'1.8rem', position:'absolute', top:'20vh', width:'100vw'}}>Enter Class Code</p>
    <input value={classcodeInput} onChange={e => {setClasscodeInput(e.target.value)}} type='text' style={{position:'absolute', left:isPortrait?'20vw':'35vw', width:isPortrait?'60vw':'30vw', top:'35vh', height:'8vh'}}></input>
    
    <p style={{textAlign:'center', fontSize:'1.2rem', position:'absolute', top:'45vh', width:'70vw', left:'15vw'}}>Your class code should be provided to you by your teacher.<br/>If you have not receved a code, request it from your teacher.<br/> It should consist of 6 letters.</p>

    <button onClick={() => confirmButton()} style={{position:'absolute', left:isPortrait?'30vw':'40vw', width:isPortrait?'40vw':'20vw', top:'70vh', height:'8vh'}}>Confirm</button>
    
    {errorMessage && (
  <p style={{
    position: 'absolute',
    top: '26vh',
    left:isPortrait?'15vw':'30vw',
    width: isPortrait?'70vw':'40vw',
    textAlign: 'center',
    color: 'white',
    backgroundColor: '#ff4d4f',
    padding: '0.8rem',
    borderRadius: '8px',
    fontSize: '1rem'
  }}>
    {errorMessage}
  </p>
)}
    </>);
}