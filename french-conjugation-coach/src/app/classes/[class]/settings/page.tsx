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
    <div>
      {/* Your settings UI here */}
      <h1>Class Settings</h1>
    </div>
  );
}