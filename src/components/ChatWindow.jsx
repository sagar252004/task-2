import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export default function ChatWindow({ currentUser, selectedUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!currentUser || !selectedUser) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_id.eq.${currentUser.id},to_id.eq.${selectedUser.id}),and(from_id.eq.${selectedUser.id},to_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
        scrollToBottom()
      }
    }

    fetchMessages()

    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages)
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [currentUser, selectedUser])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase.from('messages').insert([
      {
        content: newMessage,
        from_id: currentUser.id,
        to_id: selectedUser.id,
      },
    ])

    if (!error) {
      setNewMessage('')
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-white p-4">
        <h2 className="text-lg font-semibold">Chat with {selectedUser.email}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.from_id === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.from_id === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <p>{message.content}</p>
              <p className="mt-1 text-xs opacity-75">
                {format(new Date(message.created_at), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}