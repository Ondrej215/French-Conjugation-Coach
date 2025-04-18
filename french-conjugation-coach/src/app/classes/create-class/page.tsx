'use client';
import { redirect } from 'next/navigation';
import { useSession } from '../../../../hooks/useSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function CreateClass(){

    const { session, loading, role, accountInfo} = useSession()
    const router = useRouter();
    const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
    const [classnameInput, setClassnameInput] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    function capitalise(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

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

  function generateClassCode(length=6):string{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async function confirmButton() {
    if (!session) return;
  
    if (classnameInput.length < 3) {
      setErrorMessage('Class name must be at least 3 characters');
      return;
    }
  
    let classCode: string;
    let isUnique = false;
  
    while (!isUnique) {
      classCode = generateClassCode();
      const { data, error } = await supabase
        .from('TBLclass')
        .select('class_id')
        .eq('class_id', classCode)
        .limit(1)
        .maybeSingle();
  
      if (error && error.code === 'PGRST116') {
        isUnique = true;
      } else if (!data) {
        isUnique = true;
      }
    }
  
    const { error } = await supabase.from('TBLclass').insert({
      class_id: classCode!,
      teacher_id: session.user.id,
      class_name: capitalise(classnameInput),
    });
  
    if (error) {
      console.log('Error inserting class:', error.message);
      setErrorMessage('Something went wrong, try again later');
    } else {
      setClassnameInput('');
      setErrorMessage('');
      router.replace(`/classes/${classCode!}`);
    }
  }

    if (loading) return null
  
    if (!session) {
      redirect('/log-in');
    }

    if (role === 'student'){
        redirect('/classes');
    }

    return(<>
    <div style={{position:'absolute', left:isPortrait?'10vw':'20vw', top:'15vh', height:'70vh', width:isPortrait?'80vw':'60vw', backgroundColor:'#1c1e28', borderRadius:'15px'}}></div>
    <p style={{textAlign:'center', fontSize:'1.8rem', position:'absolute', top:'20vh', width:'100vw'}}>Pick a Class Name</p>
    <input value={classnameInput} onChange={e => {setClassnameInput(e.target.value)}} type='text' style={{position:'absolute', left:isPortrait?'20vw':'35vw', width:isPortrait?'60vw':'30vw', top:'35vh', height:'8vh'}}></input>

    <p style={{textAlign:'center', fontSize:'1.2rem', position:'absolute', top:'48vh', width:'70vw', left:'15vw'}}>After creating your class, a unique class code will appear in your class dashboard. <br/> Share this code with your students so they can join.</p>
    
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