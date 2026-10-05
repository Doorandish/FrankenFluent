import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { FeedbackDrawer } from './FeedbackDrawer';
import { Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { speak } from '../../lib/speech';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.role === 'ai';

  const handlePlayAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = 'de-DE';
      utterance.rate = 0.95;
      
      // Ensure German voice is assigned
      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find(v => v.lang.startsWith('de') || v.lang.includes('de-')) || null;
      if (deVoice) utterance.voice = deVoice;
      
      window.speechSynthesis.speak(utterance);
    } else {
      speak(message.content);
    }
  };

  return (
    <div className={cn("flex w-full mb-6", isAi ? "justify-start" : "justify-end")}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white mr-3 shrink-0 mt-1">
          AI
        </div>
      )}
      
      <div className={cn("max-w-[80%] flex flex-col", isAi ? "items-start" : "items-end")}>
        <div className={cn(
          "px-4 py-3 rounded-2xl relative group",
          isAi 
            ? "bg-dark-800 text-dark-100 rounded-tl-sm" 
            : "bg-brand-600 text-white rounded-tr-sm"
        )}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          
          {isAi && (
            <button 
              onClick={handlePlayAudio}
              className="absolute -right-10 top-2 p-2 text-dark-400 hover:text-brand-400 opacity-60 hover:opacity-100 transition-all bg-dark-900 rounded-full border border-dark-800 hover:border-brand-500/50"
              title="Play audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isAi && message.aiResponse?.feedback_english && (
          <FeedbackDrawer feedback={message.aiResponse.feedback_english} />
        )}
      </div>
    </div>
  );
};
