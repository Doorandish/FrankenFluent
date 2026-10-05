import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapter, sendChatMessage, completeScenario, getProgress } from '../lib/api';
import { Chapter, Scenario, ChatMessage as ChatMessageType, UserProgress } from '../types';
import { useUserId } from '../hooks/useUserId';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChatMessage } from '../components/chat/ChatMessage';
import { VoiceRecorder } from '../components/chat/VoiceRecorder';
import { Icon } from '../components/common/Icon';
import { speak, cancelSpeech } from '../lib/speech';

export const PracticePage: React.FC = () => {
  const { level, chapterId, scenarioId } = useParams<{ level: string; chapterId: string; scenarioId: string }>();
  const userId = useUserId();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true); // Default to seamless Live Voice Mode
  const [showKeyboard, setShowKeyboard] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state refs for callbacks
  const inputTextRef = useRef(inputText);
  const isSendingRef = useRef(isSending);
  useEffect(() => { inputTextRef.current = inputText; }, [inputText]);
  useEffect(() => { isSendingRef.current = isSending; }, [isSending]);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        if (level && chapterId) {
          const [chapterRes, progRes] = await Promise.all([
            getChapter(level, chapterId),
            userId ? getProgress(userId).catch(() => ({ data: null })) : Promise.resolve({ data: null })
          ]);

          setChapter(chapterRes.data);
          if (progRes.data) setUserProgress(progRes.data);

          const foundScenario = chapterRes.data.scenarios.find((s) => s.scenario_id === scenarioId);
          if (foundScenario) {
            setScenario(foundScenario);
            setMessages([
              {
                id: 'init',
                role: 'ai',
                content: `Hallo! ${foundScenario.situation}. Deine Aufgabe: ${foundScenario.task}`,
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching chapter for practice:', error);
      } finally {
        setLoading(false);
      }
    };

    if (level && chapterId) fetchChapterData();
  }, [level, chapterId, scenarioId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const stopAudioPlayback = () => {
    cancelSpeech();
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputTextRef.current.trim() || isSendingRef.current) return;

    const currentText = inputTextRef.current.trim();
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: currentText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);
    stopAudioPlayback();

    try {
      if (level && chapterId && scenarioId && userId) {
        const response = await sendChatMessage({
          user_id: userId,
          level,
          chapter_id: chapterId,
          scenario_id: scenarioId,
          user_message: userMsg.content,
          conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        const aiMsg: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: response.data.german_reply,
          aiResponse: response.data,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Auto-play TTS for AI reply
        if (response.data.german_reply) {
          speak(response.data.german_reply);
        }

        // Refresh progress
        if (userId) {
          getProgress(userId).then(res => setUserProgress(res.data)).catch(() => {});
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const serverError = error.response?.data?.error;
      const serverDetails = error.response?.data?.details;
      const errorMessage = serverDetails ? `${serverError} - Details: ${serverDetails}` : serverError || error.message;

      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `⚠️ Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleBargeIn = () => {
    stopAudioPlayback();
  };

  const handleEndPractice = async () => {
    stopAudioPlayback();
    if (userId && scenarioId) {
      try {
        await completeScenario(userId, scenarioId, 100);
      } catch (err) {
        console.error('Failed to record completion:', err);
      }
    }
    navigate('/roadmap');
  };

  if (loading || !chapter || !scenario) {
    return (
      <div className="screen flex items-center justify-center">
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  const masteredRedemittel = userProgress?.mastered_redemittel || [];
  const keyPhrases = chapter.key_redemittel || [];
  const usedCount = keyPhrases.filter((p) => masteredRedemittel.includes(p)).length;
  const currentScenarioIndex = chapter.scenarios.findIndex((s) => s.scenario_id === scenarioId) + 1;
  const totalScenarios = chapter.scenarios.length;
  const stepPercent = totalScenarios > 0 ? (currentScenarioIndex / totalScenarios) * 100 : 50;

  return (
    <div className="voice-screen">
      {/* Voice Header */}
      <header className="voice-header">
        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="icon-control pressable"
          aria-label="Go back"
        >
          <Icon name="arrow" size={19} />
        </button>
        <div>
          <span>{chapter.title}</span>
          <small>
            SCENARIO {currentScenarioIndex} OF {totalScenarios}
          </small>
        </div>
        <button type="button" onClick={handleEndPractice} className="end-session pressable">
          End
        </button>
      </header>

      {/* Progress Track */}
      <div className="step-track">
        <i style={{ width: `${stepPercent}%` }} />
      </div>

      {/* Key Redemittel Phrase Drawer */}
      <div className="phrase-drawer">
        <div className="phrase-title">
          <span>
            <Icon name="spark" size={15} /> KEY PHRASES
          </span>
          <small>
            {usedCount} OF {keyPhrases.length} MASTERED
          </small>
        </div>
        <div className="phrase-scroll">
          {keyPhrases.map((phrase, idx) => {
            const isUsed = masteredRedemittel.includes(phrase);
            return (
              <span key={idx} className={isUsed ? 'used' : ''}>
                {isUsed && <Icon name="check" size={13} />}
                {phrase}
              </span>
            );
          })}
        </div>
      </div>

      {/* Chat Stream */}
      <div className="chat-stream">
        <div className="time-stamp">LIVE CONVERSATION · CEFR {level?.toUpperCase()}</div>

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isSending && (
          <div className="ai-row">
            <div className="ai-avatar">
              <Icon name="spark" size={17} />
            </div>
            <div className="message-wrap">
              <div className="speaker-label">FRANKIE · AI TUTOR</div>
              <div className="ai-bubble flex items-center gap-1.5 py-3">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Optional Keyboard Input Drawer */}
      {showKeyboard && (
        <div className="fixed bottom-[132px] left-1/2 -translate-x-1/2 w-full max-w-[393px] px-4 py-2 z-30 bg-dark-950/95 backdrop-blur-md border-t border-dark-800">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type in German..."
              className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-dark-500 outline-none focus:border-brand-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-brand-600 text-white disabled:opacity-40"
              title="Send text"
            >
              <Icon name="send" size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Bottom Voice Actions */}
      <footer className="voice-actions">
        <button
          type="button"
          onClick={() => setShowKeyboard(!showKeyboard)}
          className={`side-action pressable ${showKeyboard ? 'text-brand-400 border-brand-500/40' : ''}`}
          title="Toggle keyboard input"
        >
          <Icon name="keyboard" size={20} />
        </button>

        <VoiceRecorder
          onResult={(text) => setInputText((prev) => prev + (prev ? ' ' : '') + text)}
          isProcessing={isSending}
          isLiveMode={isLiveMode}
          onAutoSend={handleSend}
          onBargeIn={handleBargeIn}
        />

        <button
          type="button"
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={`side-action pressable ${isLiveMode ? 'text-brand-400' : 'text-dark-500'}`}
          title={isLiveMode ? 'Live Mode Active' : 'Manual Mode Active'}
        >
          <Icon name="replay" size={20} />
        </button>
      </footer>
    </div>
  );
};
