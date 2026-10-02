import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { FeedbackDrawer } from './FeedbackDrawer';
import { Volume2 } from 'lucide-react';
import { speak } from '../../lib/speech';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.role === 'ai';

  const handlePlayAudio = () => {
    speak(message.content);
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
              className="absolute -right-8 top-2 p-1.5 text-dark-500 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900 rounded-full"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isAi && message.aiResponse?.feedback_farsi && (
          <FeedbackDrawer feedback={message.aiResponse.feedback_farsi} />
        )}
      </div>
    </div>
  );
};
