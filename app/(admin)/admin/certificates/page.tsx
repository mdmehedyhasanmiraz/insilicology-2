'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type IdTitle = { id: string; title: string }
type SupabaseUserCourseData = { user_id: string; users: { id: string; name: string | null; email: string } }
type SupabaseUserWorkshopData = { user_id: string; users: { id: string; name: string | null; email: string } }

export default function AdminCertificatesPage() {
  const supabase = createClientComponentClient()
  const [entityType, setEntityType] = useState<'course' | 'workshop'>('course')
  const [entities, setEntities] = useState<IdTitle[]>([])
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [certificateType, setCertificateType] = useState<'achievement' | 'completion' | 'participation'>('completion')
  const [loading, setLoading] = useState(false)
  const [usersWithCertificates, setUsersWithCertificates] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadEntities = async () => {
      const table = entityType === 'course' ? 'courses' : 'workshops'
      const { data } = await supabase.from(table).select('id, title').order('created_at', { ascending: false })
      setEntities((data as IdTitle[] | null) || [])
    }
    loadEntities()
  }, [entityType, supabase])

  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedEntityId) { 
        setUsers([])
        setUsersWithCertificates(new Set())
        return 
      }
      
      if (entityType === 'course') {
        const { data, error } = await supabase
          .from('user_courses')
          .select('user_id, users:users!inner(id, name, email)')
          .eq('course_id', selectedEntityId)
        if (!error) {
          const userList = ((data as unknown as SupabaseUserCourseData[]) || []).map((r) => ({
            id: r.users.id,
            name: r.users.name,
            email: r.users.email
          }))
          setUsers(userList)
          
          // Load existing certificates for these users
          const userIds = userList.map(u => u.id)
          if (userIds.length > 0) {
            const { data: certs } = await supabase
              .from('certificates')
              .select('user_id')
              .in('user_id', userIds)
              .eq('entity_type', 'course')
              .eq('entity_id', selectedEntityId)
            
            const usersWithCerts = new Set(certs?.map(c => c.user_id) || [])
            setUsersWithCertificates(usersWithCerts)
          }
        }
      } else {
        const { data, error } = await supabase
          .from('user_workshops')
          .select('user_id, users:users!inner(id, name, email)')
          .eq('workshop_id', selectedEntityId)
        if (!error) {
          const userList = ((data as unknown as SupabaseUserWorkshopData[]) || []).map((r) => ({
            id: r.users.id,
            name: r.users.name,
            email: r.users.email
          }))
          setUsers(userList)
          
          // Load existing certificates for these users
          const userIds = userList.map(u => u.id)
          if (userIds.length > 0) {
            const { data: certs } = await supabase
              .from('certificates')
              .select('user_id')
              .in('user_id', userIds)
              .eq('entity_type', 'workshop')
              .eq('entity_id', selectedEntityId)
            
            const usersWithCerts = new Set(certs?.map(c => c.user_id) || [])
            setUsersWithCertificates(usersWithCerts)
          }
        }
      }
    }
    loadUsers()
  }, [entityType, selectedEntityId, supabase])

  const allSelected = useMemo(() => users.length > 0 && selectedUserIds.length === users.length, [users, selectedUserIds])

  const toggleSelectAll = () => {
    if (allSelected) setSelectedUserIds([])
    else {
      // Only select users who don't already have certificates
      const eligibleUsers = users.filter(u => !usersWithCertificates.has(u.id))
      setSelectedUserIds(eligibleUsers.map(u => u.id))
    }
  }

  const issue = async () => {
    if (!selectedEntityId || selectedUserIds.length === 0) return
    setLoading(true)
    try {
      for (const userId of selectedUserIds) {
        await fetch('/api/certificates/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            entityType,
            entityId: selectedEntityId,
            certificateType,
            title: entities.find(e => e.id === selectedEntityId)?.title || 'Certificate'
          })
        })
      }
             setSelectedUserIds([])
       // Refresh the users with certificates list
       const userIds = users.map(u => u.id)
       if (userIds.length > 0) {
         const { data: certs } = await supabase
           .from('certificates')
           .select('user_id')
           .in('user_id', userIds)
           .eq('entity_type', entityType)
           .eq('entity_id', selectedEntityId)
         
         const usersWithCerts = new Set(certs?.map(c => c.user_id) || [])
         setUsersWithCertificates(usersWithCerts)
       }
       alert('Certificates issued')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl font-bold">Issue Certificates</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Entity Type</label>
          <select value={entityType} onChange={e => setEntityType(e.target.value as 'course' | 'workshop')} className="w-full border rounded p-2">
            <option value="course">Course</option>
            <option value="workshop">Workshop</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select {entityType}</label>
          <select value={selectedEntityId} onChange={e => setSelectedEntityId(e.target.value)} className="w-full border rounded p-2">
            <option value="">-- Select --</option>
            {entities.map(ent => (
              <option key={ent.id} value={ent.id}>{ent.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Certificate Type</label>
          <select value={certificateType} onChange={e => setCertificateType(e.target.value as 'achievement' | 'completion' | 'participation')} className="w-full border rounded p-2">
            <option value="achievement">Achievement</option>
            <option value="completion">Completion</option>
            <option value="participation">Participation</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Eligible Users</h2>
                     <button className="text-sm underline" onClick={toggleSelectAll}>
             {allSelected ? 'Unselect all' : 'Select all eligible'}
           </button>
        </div>
                 {users.length === 0 ? (
           <p className="text-sm text-gray-600">No users found.</p>
         ) : (
           <ul className="divide-y">
             {users.map(u => {
               const hasCertificate = usersWithCertificates.has(u.id)
               return (
                 <li key={u.id} className={`flex items-center gap-3 py-2 ${hasCertificate ? 'opacity-60' : ''}`}>
                   <input 
                     type="checkbox" 
                     checked={selectedUserIds.includes(u.id)} 
                     disabled={hasCertificate}
                     onChange={(e) => {
                       if (e.target.checked) setSelectedUserIds(prev => [...prev, u.id])
                       else setSelectedUserIds(prev => prev.filter(id => id !== u.id))
                     }} 
                     className={hasCertificate ? 'cursor-not-allowed' : ''}
                   />
                   <div className="flex-1">
                     <div className="font-medium flex items-center gap-2">
                       {u.name || 'Unnamed'}
                       {hasCertificate && (
                         <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                           Certificate Issued
                         </span>
                       )}
                     </div>
                     <div className="text-xs text-gray-600">{u.email}</div>
                   </div>
                 </li>
               )
             })}
           </ul>
         )}
      </div>

      <div className="flex gap-3">
        <button disabled={loading} onClick={issue} className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-60">Issue Certificates</button>
      </div>
    </div>
  )
}


