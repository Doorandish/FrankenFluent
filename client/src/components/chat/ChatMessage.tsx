import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { Icon } from '../common/Icon';
import { speak } from '../../lib/speech';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.role === 'ai';
  const [feedbackOpen, setFeedbackOpen] = useState(true);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = 'de-DE';
      utterance.rate = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      const deVoice = voices.find(v => v.lang.startsWith('de') || v.lang.includes('de-')) || null;
      if (deVoice) utterance.voice = deVoice;
      
      window.speechSynthesis.speak(utterance);
    } else {
      speak(message.content);
    }
  };

  if (!isAi) {
    return (
      <div className="user-row">
        <div className="user-bubble">{message.content}</div>
        <span className="delivered">
          <Icon name="check" size={12} /> Transcribed
        </span>
      </div>
    );
  }

  const feedback = message.aiResponse?.feedback_english;
  const hasError = feedback?.has_error;

  return (
    <div className={`ai-row ${hasError ? 'feedback-row' : ''}`}>
      <div className={`ai-avatar ${hasError ? 'correction' : ''}`}>
        <Icon name="spark" size={17} />
      </div>
      <div className="message-wrap">
        <div className="speaker-label">FRANKIE · AI TUTOR</div>
        <div className="ai-bubble">
          <p>{message.content}</p>
          <button 
            type="button" 
            onClick={handlePlayAudio}
            className="audio-control pressable"
            title="Listen to German audio"
          >
            <Icon name="speaker" size={17} />
          </button>
        </div>

        {/* Quick Correction Feedback Card from Figma */}
        {hasError && feedback && (
          <div className="feedback-card">
            <div 
              className="feedback-title pressable" 
              onClick={() => setFeedbackOpen(!feedbackOpen)}
            >
              <div>
                <Icon name="spark" size={16} />
                <span>QUICK CORRECTION</span>
              </div>
              <Icon 
                name="chevron" 
                size={16} 
                className={`transition-transform duration-200 ${feedbackOpen ? 'rotate-90' : ''}`} 
              />
            </div>

            {feedbackOpen && (
              <div className="feedback-content">
                {feedback.user_mistake && (
                  <div className="correction-line wrong">
                    <span>MISTAKE</span>
                    <p>{feedback.user_mistake}</p>
                  </div>
                )}
                {feedback.correct_version && (
                  <div className="correction-line right">
                    <span>CORRECT</span>
                    <p>{feedback.correct_version}</p>
                  </div>
                )}
                {feedback.explanation && (
                  <div className="grammar-tip">
                    <b>TIP</b>
                    <p>{feedback.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
