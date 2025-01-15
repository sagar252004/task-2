import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthForm from './components/AuthForm'
import UsersList from './components/UserList'
import ChatWindow from './components/ChatWindow'
import './index.css'

function App() {
  const [session, setSession] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <AuthForm />
  }

  return (
    <div className="flex h-screen">
      <UsersList
        currentUserId={session.user.id}
        onSelectUser={setSelectedUser}
      />
      <div className="flex-1">
        <ChatWindow
          currentUser={session.user}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  )
}

export default App