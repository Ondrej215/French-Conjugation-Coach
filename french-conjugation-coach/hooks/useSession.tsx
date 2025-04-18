'use client';
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'teacher' | 'student' | null>(null)
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user) {
        const userId = session.user.id

        const { data: teachers } = await supabase
          .from('TBLteacher')
          .select('*')
          .eq('teacher_id', userId)
          .maybeSingle()

        if (teachers) {
          setRole('teacher');
          setAccountInfo(teachers);
        } else {
          const { data: students } = await supabase
            .from('TBLstudent')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle()

          if (students){
            setRole('student');
            setAccountInfo(students);
          }
        }
      }

      setLoading(false)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // you may want to re-check role here too if needed
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return { session, loading, role, accountInfo}
}