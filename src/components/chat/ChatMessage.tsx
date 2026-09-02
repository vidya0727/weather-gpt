import React from 'react';
import { User } from 'lucide-react';
import { StructuredAIResponse } from '../../services/aiService';
import { WeatherGPTResponse } from '../../services/explanationService';
import { StructuredResponseCard } from './StructuredResponseCard';
import { ClimateChatInsight } from './ClimateChatInsight';
import { FollowUpPills } from './FollowUpPills';
import './ChatMessage.css';

export interface MessageItem {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  structuredResponse?: StructuredAIResponse;
  weatherGPTResponse?: WeatherGPTResponse;
  timestamp: string;
  followUpSuggestions?: string[];
}

interface ChatMessageProps {
  message: MessageItem;
  onSelectFollowUp: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectFollowUp }) => {
  if (message.sender === 'user') {
    return (
      <div className="chat-message-row message-user-row">
        <div className="user-message-bubble">
          <p className="user-message-text">{message.text}</p>
          <span className="user-message-time">{message.timestamp}</span>
        </div>
        <div className="user-avatar">
          <User size={16} />
        </div>
      </div>
    );
  }

  // Render Climate Insight card if available (Requirement 32)
  if (message.weatherGPTResponse?.climateResult) {
    return (
      <div className="chat-message-row message-bot-row">
        <div className="climate-bot-bubble-wrapper" style={{ width: '100%' }}>
          <ClimateChatInsight result={message.weatherGPTResponse.climateResult} />
          <div className="bot-explanation-text-bubble glass-card" style={{ padding: '1rem', marginTop: '0.5rem', borderRadius: '12px', fontSize: '0.92rem', lineHeight: '1.5', color: '#f1f5f9' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{message.text}</p>
          </div>
          {message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
            <FollowUpPills
              suggestions={message.followUpSuggestions}
              onSelectFollowUp={onSelectFollowUp}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message-row message-bot-row">
      {message.structuredResponse ? (
        <StructuredResponseCard
          response={message.structuredResponse}
          onSelectFollowUp={onSelectFollowUp}
        />
      ) : (
        <div className="bot-fallback-bubble glass-card" style={{ padding: '1rem', borderRadius: '14px' }}>
          <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{message.text}</p>
          {message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
            <FollowUpPills
              suggestions={message.followUpSuggestions}
              onSelectFollowUp={onSelectFollowUp}
            />
          )}
        </div>
      )}
    </div>
  );
};

