import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDisplayName } from '../utils/user';
import BackButton from '../components/BackButton';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [to, setTo] = useState('All');
  const location = useLocation();
  const endRef = useRef(null);

  useEffect(() => {
    // Load messages either from passed state or from localStorage
    try {
      if (location && location.state && Array.isArray(location.state.messages)) {
        setMessages(location.state.messages);
      } else {
        const raw = localStorage.getItem('messages');
        setMessages(raw ? JSON.parse(raw) : []);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
      setMessages([]);
    }
  }, [location]);

  useEffect(() => {
    // scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  function persist(msgs) {
    setMessages(msgs);
    try {
      localStorage.setItem('messages', JSON.stringify(msgs));
      // Notify other parts of app (and other windows) that messages changed
      try { window.dispatchEvent(new Event('messagesUpdated')); } catch (_e) { /* ignore */ }
    } catch (e) {
      console.error('Failed to persist messages', e);
    }
  }

  function openMessage(m) {
    alert(`From: ${m.from}\n\n${m.content}`);
  }

  function markRead(id) {
    const next = messages.filter(m => m.id !== id);
    persist(next);
  }

  function scrollToBottom() {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  function sendMessage() {
    if (!input || input.trim() === '') return;
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const display = getDisplayName(user) || user.name || 'Anonymous';
    const newMsg = {
      id: Date.now().toString(),
      from: display,
      role: user.role || 'user',
      to: to || 'All',
      content: input.trim(),
      time: new Date().toLocaleString(),
    };
    const next = [...messages, newMsg];
    persist(next);
    setInput('');
  }

  const participants = Array.from(new Set(messages.map(m => m.from).concat(['All'])));

  return (
    <Layout>
      <div className="p-3 sm:p-6 max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <BackButton className="mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Messages</h2>
        </div>

        <div className="border rounded-lg overflow-hidden bg-slate-800">
          <div className="p-3 sm:p-4 max-h-96 overflow-y-auto space-y-3 text-sm" style={{ color: '#e6eef8' }}>
            {messages.length === 0 && (
              <div className="p-4 rounded bg-white/5 text-white/70">No messages. Use the form below to start a conversation.</div>
            )}

            {messages.map(m => {
              const isMe = (() => {
                try {
                  const user = JSON.parse(localStorage.getItem('user')) || {};
                  const display = getDisplayName(user) || user.name || '';
                  return display === m.from;
                } catch (e) { return false; }
              })();
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${isMe ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/90'} p-3 rounded-lg max-w-[80%]`}>
                    <div className="text-xs opacity-80 font-medium">{isMe ? 'You' : m.from} <span className="text-[10px] text-slate-300">{m.role}</span></div>
                    <div className="mt-1">{m.content}</div>
                    <div className="text-[10px] text-slate-400 mt-2">{m.time} {m.to ? `· to ${m.to}` : ''}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t bg-slate-900/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select className="bg-slate-800 text-white px-3 py-2 rounded min-h-[44px]" value={to} onChange={e => setTo(e.target.value)}>
              {participants.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
              className="flex-1 px-3 py-2 rounded bg-slate-800 text-white min-h-[44px]"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded min-h-[44px]">Send</button>
          </div>
        </div>

        <div className="mt-4 text-sm text-white/60">
          Tip: messages are persisted to localStorage for this demo. Other users/tabs will see updates when the storage is updated.
        </div>
      </div>
    </Layout>
  );
}
