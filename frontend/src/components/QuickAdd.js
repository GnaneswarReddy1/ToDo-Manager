import React, { useState, useEffect, useRef } from 'react';

export default function QuickAdd({ onAICreate, onManualCreate, tagOptions = [] }) {
  const [text, setText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualDue, setManualDue] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [aiSelectedTags, setAiSelectedTags] = useState([]);
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [parsing, setParsing] = useState(false);

  const finalTranscriptRef = useRef('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.onresult = null; 
          recognitionRef.current.onend = null; 
          recognitionRef.current.stop(); 
        } catch (e) {}
      }
    };
  }, []);

  const startSpeechRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setRecording(true);
      setIsSpeaking(false);
      finalTranscriptRef.current = '';
      setText('');
    };

    rec.onresult = (event) => {
      let interim = '';
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
          finalTranscriptRef.current = final;
          setIsSpeaking(false);
        } else {
          interim += transcript;
          setIsSpeaking(true);
        }
      }
      
      setText(final + interim);
    };

    rec.onend = () => {
      if (recording) {
        setTimeout(() => { 
          try { 
            rec.start(); 
          } catch (err) { 
            setRecording(false);
            setIsSpeaking(false);
          } 
        }, 100);
      }
    };

    rec.onerror = (err) => {
      console.error('Speech recognition error:', err);
      if (err.error !== 'no-speech') {
        setRecording(false);
        setIsSpeaking(false);
      }
    };

    rec.onspeechstart = () => setIsSpeaking(true);
    rec.onspeechend = () => setIsSpeaking(false);

    recognitionRef.current = rec;
    try { 
      rec.start(); 
    } catch (e) { 
      console.error('Failed to start speech recognition:', e);
      setRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.onend = null; 
        recognitionRef.current.stop(); 
      } catch (e) {}
    }
    setRecording(false);
    setIsSpeaking(false);
    setText(finalTranscriptRef.current.trim());
  };

  const toggleSpeech = () => {
    if (recording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const doParse = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please speak or type something to create a task.');
      return;
    }
    
    if (recording) stopSpeechRecognition();
    setParsing(true);

    try {
      await onAICreate(text, aiSelectedTags);
    } catch (err) {
      console.error('AI parse error', err);
      alert('Failed to parse task. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  const doManual = async (e) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert('Please enter a task title.');
      return;
    }
    
    let dueDateTime = null;
    if (manualDue) {
      const iso = manualTime ? `${manualDue}T${manualTime}` : `${manualDue}T00:00`;
      dueDateTime = new Date(iso);
      if (isNaN(dueDateTime.getTime())) {
        alert('Invalid date/time selected.');
        return;
      }
    }

    try {
      await onManualCreate({
        title: manualTitle.trim(),
        notes: manualNotes.trim(),
        dueDate: dueDateTime,
        tags: selectedTags
      });
      
      // Reset form
      setManualTitle('');
      setManualNotes('');
      setManualDue('');
      setManualTime('');
      setSelectedTags([]);
    } catch (err) {
      console.error('Manual create error', err);
      alert('Failed to create task. Please try again.');
    }
  };

  const toggleAiTag = (tag) => {
    setAiSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const toggleManualTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearText = () => {
    setText('');
    finalTranscriptRef.current = '';
  };

  return (
    <div className="quickadd-container">
      {/* AI Quick Add Section */}
      <div className="ai-section">
        <div className="section-header">
          <div className="section-icon">🚀</div>
          <div>
            <h3>AI Quick Task</h3>
            <p>Speak or type naturally to create tasks instantly</p>
          </div>
        </div>

        <form onSubmit={doParse} className="ai-form">
          <div className="input-group">
            <div className="text-input-container">
              <textarea
                value={text}
                onChange={(e) => { 
                  finalTranscriptRef.current = e.target.value; 
                  setText(e.target.value); 
                }}
                placeholder="Try: 'Team meeting tomorrow at 2 PM about Q3 planning' or 'Dentist appointment next Friday at 10 AM'"
                className="text-input"
                rows={3}
              />
              {text && (
                <button 
                  type="button"
                  onClick={clearText}
                  className="clear-button"
                  title="Clear input"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="speech-controls">
              <button
                type="button"
                onClick={toggleSpeech}
                className={`speech-button ${recording ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
              >
                <span className="speech-icon">
                  {recording ? (isSpeaking ? '🎙️' : '🔴') : '🎤'}
                </span>
                {recording ? (
                  isSpeaking ? 'Speaking...' : 'Listening...'
                ) : (
                  'Start Speaking'
                )}
              </button>
              
              {recording && (
                <div className="recording-status">
                  <div className={`pulse-dot ${isSpeaking ? 'speaking' : ''}`}></div>
                  <span>{isSpeaking ? 'Voice detected' : 'Ready for input'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="tags-section">
            <label className="tags-label">Quick Categories</label>
            <div className="tags-container">
              {tagOptions.map(tag => (
                <button 
                  key={tag.label} 
                  type="button" 
                  className={`tag-button ${aiSelectedTags.includes(tag.label) ? 'selected' : ''}`}
                  style={{ '--tag-color': tag.color }}
                  onClick={() => toggleAiTag(tag.label)}
                >
                  {tag.label}
                  {aiSelectedTags.includes(tag.label) && ' ✓'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={parsing || !text.trim()}
            className="parse-button"
          >
            {parsing ? (
              <>
                <div className="spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span>🤖</span>
                AI Parse & Preview
              </>
            )}
          </button>
        </form>
      </div>

      {/* Manual Task Creation Section */}
      <div className="manual-section">
        <div className="section-header">
          <div className="section-icon">✏️</div>
          <div>
            <h3>Manual Task Creation</h3>
            <p>Create tasks with detailed specifications</p>
          </div>
        </div>

        <form onSubmit={doManual} className="manual-form">
          <div className="form-group">
            <input
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              placeholder="Task title *"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <textarea
              value={manualNotes}
              onChange={e => setManualNotes(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                value={manualDue} 
                onChange={e => setManualDue(e.target.value)} 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input 
                type="time" 
                value={manualTime} 
                onChange={e => setManualTime(e.target.value)} 
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={selectedTags[0] || ''}
                onChange={e => {
                  const val = e.target.value;
                  if (val) setSelectedTags([val]);
                }}
                className="form-select"
              >
                <option value="">Select category</option>
                {tagOptions.map(t => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!manualTitle.trim()}
            className="create-button"
          >
            <span>✅</span>
            Create Task
          </button>
        </form>
      </div>

      <style jsx>{`
        .quickadd-container {
          padding: 0;
        }

        .ai-section, .manual-section {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #E5E7EB;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .section-icon {
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 8px;
          color: white;
        }

        .section-header h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1F2937;
        }

        .section-header p {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
        }

        .input-group {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .text-input-container {
          flex: 1;
          position: relative;
        }

        .text-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
          transition: all 0.2s;
          background: #FFFFFF;
        }

        .text-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .text-input::placeholder {
          color: #9CA3AF;
        }

        .clear-button {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #6B7280;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .clear-button:hover {
          background: #374151;
        }

        .speech-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 140px;
        }

        .speech-button {
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          background: #FFFFFF;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .speech-button.recording {
          border-color: #EF4444;
          color: #EF4444;
        }

        .speech-button.speaking {
          border-color: #10B981;
          color: #10B981;
          animation: pulse 1.5s infinite;
        }

        .speech-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .speech-icon {
          font-size: 16px;
        }

        .recording-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6B7280;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #6B7280;
          border-radius: 50%;
        }

        .pulse-dot.speaking {
          background: #10B981;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

        .tags-section {
          margin-bottom: 20px;
        }

        .tags-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .tags-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag-button {
          padding: 8px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: #FFFFFF;
          color: #374151;
          font-weight: 500;
        }

        .tag-button.selected {
          background: var(--tag-color);
          color: #FFFFFF;
          border-color: var(--tag-color);
          transform: scale(1.05);
        }

        .tag-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .parse-button, .create-button {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .parse-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .parse-button:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
          transform: none;
        }

        .parse-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .create-button {
          background: #10B981;
          color: white;
        }

        .create-button:disabled {
          background: #9CA3AF;
          cursor: not-allowed;
        }

        .create-button:not(:disabled):hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: #FFFFFF;
          box-sizing: border-box;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .ai-section, .manual-section {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}