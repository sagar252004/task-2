import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function UsersList({ onSelectUser, currentUserId }) {
  const [users, setUsers] = useState([])
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)

      if (profiles) {
        setUsers(profiles)
      }
    }

    fetchUsers()

    const usersSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe()

    return () => {
      supabase.removeChannel(usersSubscription)
    }
  }, [currentUserId])

  return (
    <div className="w-64 bg-gray-50 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 flex w-full items-center justify-between rounded-lg bg-white p-2 shadow-sm"
      >
        <span className="font-medium">Users</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div className="space-y-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full rounded-lg bg-white p-2 text-left hover:bg-gray-100"
            >
              {user.email}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}