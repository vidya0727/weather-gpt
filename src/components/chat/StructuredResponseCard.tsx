import React, { useState } from 'react';
import { Bot, Clock, CloudRain, CheckCircle2, Sparkles, MapPin, Database, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { StructuredAIResponse } from '../../services/aiService';
import { RiskIndicator } from './RiskIndicator';
import { CollapsibleWhySection } from './CollapsibleWhySection';
import { FollowUpPills } from './FollowUpPills';
import './StructuredResponseCard.css';

interface StructuredResponseCardProps {
  response: StructuredAIResponse;
  onSelectFollowUp: (question: string) => void;
}

export const StructuredResponseCard: React.FC<StructuredResponseCardProps> = ({ response, onSelectFollowUp }) => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="structured-response-card glass-card">
      {/* Response Card Top Header */}
      <div className="card-top-header">
        <div className="bot-title-group">
          <div className="bot-avatar">
            <Bot size={18} className="bot-icon" />
          </div>
          <div>
            <span className="bot-name">WeatherGPT</span>
            <span className="bot-time">{response.timestamp}</span>
          </div>
        </div>

        <div className="location-context-chip">
          <MapPin size={12} className="icon-cyan" />
          <span>{response.locationName || 'Active Location'}</span>
        </div>
      </div>

      {/* Assessment Title & Dynamic Risk Meter */}
      <div className="assessment-header-row">
        <h4 className="assessment-title">{response.title}</h4>
        <RiskIndicator level={response.riskLevel} score={response.riskScore} />
      </div>

      {/* Main Grid: Weather Summary & Time Horizon */}
      <div className="summary-time-grid">
        <div className="summary-box">
          <div className="box-label">
            <CloudRain size={14} className="icon-cyan" /> Live Telemetry
          </div>
          <span className="box-val">{response.weatherSummary}</span>
        </div>

        <div className="time-box">
          <div className="box-label">
            <Clock size={14} className="icon-amber" /> Forecast Period
          </div>
          <span className="box-val">{response.timeWindow}</span>
        </div>
      </div>

      {/* Dynamic Recommendation Block */}
      <div className="rec-box">
        <div className="rec-label">
          <CheckCircle2 size={16} className="icon-emerald" /> AI Weather Recommendation
        </div>
        <p className="rec-text">"{response.recommendation}"</p>
      </div>

      {/* Data Attribution Footer */}
      <div className="telemetry-source-footer">
        <Database size={12} className="icon-cyan" />
        <span>Source: <strong>{response.debugInfo?.provider || 'Open-Meteo API'}</strong> • Weather-Aware Engine Active</span>
      </div>

      {/* Collapsible Why Section */}
      <CollapsibleWhySection
        explanation={response.whyExplanation}
        factors={response.whyFactors}
      />

      {/* Developer Debug Inspector */}
      {response.debugInfo && (
        <div className="developer-debug-wrapper">
          <button
            type="button"
            className="debug-trigger-btn"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Terminal size={14} className="icon-violet" />
            <span>Developer Debug Info ({response.debugInfo.intent})</span>
            {showDebug ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDebug && (
            <div className="debug-content-box">
              <div className="debug-item">
                <span className="debug-key">Selected Location:</span>
                <span className="debug-val">{response.debugInfo.locationName}</span>
              </div>
              <div className="debug-item">
                <span className="debug-key">Coordinates (Lat, Lon):</span>
                <span className="debug-val">{response.debugInfo.coordinates}</span>
              </div>
              <div className="debug-item">
                <span className="debug-key">Detected Intent:</span>
                <span className="debug-val intent-pill">{response.debugInfo.intent}</span>
              </div>
              <div className="debug-item">
                <span className="debug-key">Requested Period / Time:</span>
                <span className="debug-val">{response.debugInfo.timePeriod}</span>
              </div>
              <div className="debug-item">
                <span className="debug-key">Weather Data Timestamp:</span>
                <span className="debug-val">{response.debugInfo.retrievedAt}</span>
              </div>
              <div className="debug-item">
                <span className="debug-key">Weather Provider:</span>
                <span className="debug-val">{response.debugInfo.provider}</span>
              </div>
              <div className="debug-item">
                <span className="debug-key">Data Source Mode:</span>
                <span className="debug-val">
                  {response.debugInfo.isCached
                    ? `Cached Data (${response.debugInfo.cachedAt || 'saved'})`
                    : 'Live Telemetry'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow-Up Questions Section */}
      <FollowUpPills
        suggestions={response.followUpSuggestions}
        onSelectFollowUp={onSelectFollowUp}
      />
    </div>
  );
};

