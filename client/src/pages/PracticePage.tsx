import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapter, sendChatMessage, completeScenario } from '../lib/api';
import { Chapter, Scenario, ChatMessage as ChatMessageType } from '../types';
import { useUserId } from '../hooks/useUserId';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChatMessage } from '../components/chat/ChatMessage';
import { VoiceRecorder } from '../components/chat/VoiceRecorder';
import { RedemittelPanel } from '../components/chat/RedemittelPanel';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const { level, chapterId, scenarioId } = useParams<{ level: string, chapterId: string, scenarioId: string }>();
  const userId = useUserId();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showRedemittel, setShowRedemittel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        if (level && chapterId) {
          const response = await getChapter(level, chapterId);
          setChapter(response.data);
          const foundScenario = response.data.scenarios.find(s => s.scenario_id === scenarioId);
          if (foundScenario) {
            setScenario(foundScenario);
            // Initial AI message based on scenario could be fetched here or set locally
            setMessages([{
              id: 'init',
              role: 'ai',
              content: `Lass uns anfangen! ${foundScenario.situation}. Deine Aufgabe: ${foundScenario.task}`,
              timestamp: new Date()
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      } finally {
        setLoading(false);
      }
    };
    if (level && chapterId) fetchChapter();
  }, [level, chapterId, scenarioId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      if (level && chapterId && scenarioId && userId) {
        const response = await sendChatMessage({
          user_id: userId,
          level,
          chapter_id: chapterId,
          scenario_id: scenarioId,
          user_message: userMsg.content,
          conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
        });

        const aiMsg: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: response.data.german_reply,
          aiResponse: response.data,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optional: Add error message to chat
    } finally {
      setIsSending(false);
    }
  };

  const handleEndPractice = async () => {
    if (userId && scenarioId) {
      try {
        await completeScenario(userId, scenarioId, 85); // Dummy score for now
        navigate('/roadmap');
      } catch (error) {
        console.error('Error completing scenario:', error);
      }
    }
  };

  if (loading || !chapter || !scenario) {
    return <div className="h-screen flex items-center justify-center"><LoadingSpinner className="w-12 h-12" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-dark-950 overflow-hidden">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 py-3 px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/roadmap')} className="p-2 hover:bg-dark-800 rounded-full text-dark-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-white text-sm md:text-base">{chapter.title}</h1>
            <p className="text-xs text-dark-400 line-clamp-1">{scenario.situation}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleEndPractice} className="btn-secondary py-1.5 px-4 text-xs">End</button>
          <button onClick={() => setShowRedemittel(!showRedemittel)} className="p-2 hover:bg-dark-800 rounded-full md:hidden text-dark-300">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full bg-dark-950 relative">
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-2">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isSending && (
                <div className="flex justify-start mb-6">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white mr-3 shrink-0 mt-1">AI</div>
                  <div className="bg-dark-800 text-dark-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-dark-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-dark-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-dark-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-dark-900/80 backdrop-blur-md border-t border-dark-800">
            <div className="max-w-3xl mx-auto flex items-end gap-2">
              <VoiceRecorder 
                onResult={(text) => setInputText(prev => prev + (prev ? ' ' : '') + text)} 
                isProcessing={isSending} 
              />
              <form onSubmit={handleSend} className="flex-1 flex items-end bg-dark-800 rounded-2xl border border-dark-700/50 focus-within:border-brand-500/50 overflow-hidden transition-colors">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Schreibe deine Antwort..."
                  className="w-full max-h-32 min-h-[44px] bg-transparent text-white placeholder-dark-500 p-3 outline-none resize-none scrollbar-thin"
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-3 text-brand-500 hover:text-brand-400 disabled:text-dark-600 disabled:hover:text-dark-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Side Panel for Redemittel (Desktop) */}
        <aside className={`hidden md:block w-80 border-l border-dark-800 bg-dark-950 p-4 shrink-0 transition-transform`}>
          <RedemittelPanel phrases={chapter.key_redemittel} />
        </aside>

        {/* Mobile overlay for Redemittel */}
        {showRedemittel && (
          <div className="md:hidden absolute inset-0 z-20 bg-dark-950/95 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-full flex flex-col pt-12">
              <RedemittelPanel phrases={chapter.key_redemittel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
