'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function WidgetPage() {
  const params = useParams()
  const businessId = params.businessId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [started, setStarted] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [aiName, setAiName] = useState('Alex')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch basic business info for display
    fetch(`/api/business-info?id=${businessId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setBusinessName(data.name)
        if (data.ai_name) setAiName(data.ai_name)
      })
      .catch(() => {})
  }, [businessId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startChat() {
    setStarted(true)
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm ${aiName}${businessName ? `, the AI assistant for ${businessName}` : ''}. How can I help you today?`,
      },
    ])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, conversationId, message: userMessage }),
      })

      const data = await res.json()

      if (data.limitReached) {
        setLimitReached(true)
        return
      }

      if (data.conversationId) setConversationId(data.conversationId)
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          {businessName && <p className="text-sm text-gray-500 mb-1">{businessName}</p>}
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chat with {aiName}</h2>
          <p className="text-gray-500 text-sm mb-6">Get instant answers about our services, pricing, and availability.</p>
          <button
            onClick={startChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Start Chat
          </button>
        </div>
      </div>
    )
  }

  if (limitReached) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h3 className="font-bold text-gray-900 mb-2">Leave us a message</h3>
        <p className="text-gray-500 text-sm mb-4">Our chat is at capacity right now. Leave your name and number and we'll call you back.</p>
        <LeadForm businessId={businessId} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white text-sm font-bold">{aiName[0]}</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{aiName}</p>
          {businessName && <p className="text-blue-100 text-xs">{businessName}</p>}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span className="text-blue-100 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-gray-300 text-[10px] mt-2">Powered by Axon</p>
      </div>
    </div>
  )
}

function LeadForm({ businessId }: { businessId: string }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        conversationId: null,
        message: `[Leave a message] Name: ${name}, Phone: ${phone}`,
      }),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return <p className="text-green-600 font-semibold">Got it! We'll be in touch soon.</p>
  }

  return (
    <form onSubmit={submit} className="w-full max-w-xs space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your phone number"
        required
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold">
        Send Message
      </button>
    </form>
  )
}
