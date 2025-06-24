import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Mic, User, Bot } from 'lucide-react';

const LiveTranscript = ({ 
  isVisible = true, 
  currentUserTranscript = '', 
  currentAITranscript = '', 
  isAiSpeaking = false, 
  isUserSpeaking = false,
  conversationHistory = []
}) => {
  const [displayTranscript, setDisplayTranscript] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState(null); // 'ai' or 'user'
  const [isTyping, setIsTyping] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [fullText, setFullText] = useState('');
  
  const transcriptRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Configuration
  const MAX_DISPLAY_LENGTH = 500; // Max characters to show
  const TYPING_SPEED = 50; // milliseconds per word for AI speech
  const SCROLL_DELAY = 100; // Auto-scroll delay

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (transcriptRef.current && autoScrollRef.current) {
      clearTimeout(autoScrollRef.current);
      autoScrollRef.current = setTimeout(() => {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }, SCROLL_DELAY);
    }
  }, []);

  // Truncate text from the beginning while preserving word boundaries
  const truncateFromStart = useCallback((text, maxLength) => {
    if (text.length <= maxLength) return text;
    
    const truncated = text.slice(text.length - maxLength);
    const firstSpaceIndex = truncated.indexOf(' ');
    
    // If we find a space, start from there to preserve word boundaries
    return firstSpaceIndex !== -1 ? '...' + truncated.slice(firstSpaceIndex) : '...' + truncated;
  }, []);

  // Simulate word-by-word typing for AI speech
  const simulateTyping = useCallback((text, speed = TYPING_SPEED) => {
    if (!text || text.trim() === '') return;
    
    setIsTyping(true);
    setWordIndex(0);
    setFullText(text);
    
    const words = text.split(' ');
    let currentIndex = 0;
    
    const typeNextWord = () => {
      if (currentIndex < words.length) {
        const currentText = words.slice(0, currentIndex + 1).join(' ');
        setDisplayTranscript(prev => {
          const newText = prev + (currentIndex === 0 ? '' : ' ') + words[currentIndex];
          return truncateFromStart(newText, MAX_DISPLAY_LENGTH);
        });
        setWordIndex(currentIndex + 1);
        currentIndex++;
        
        typingIntervalRef.current = setTimeout(typeNextWord, speed);
        scrollToBottom();
      } else {
        setIsTyping(false);
      }
    };
    
    // Clear any existing typing
    if (typingIntervalRef.current) {
      clearTimeout(typingIntervalRef.current);
    }
    
    typeNextWord();
  }, [scrollToBottom, truncateFromStart]);

  // Handle AI speaking
  useEffect(() => {
    if (isAiSpeaking && currentAITranscript) {
      setCurrentSpeaker('ai');
      
      // Add AI speaker indicator and start typing simulation
      const aiPrefix = '\n🤖 AI: ';
      setDisplayTranscript(prev => {
        const newText = prev + aiPrefix;
        return truncateFromStart(newText, MAX_DISPLAY_LENGTH);
      });
      
      // Start word-by-word simulation
      setTimeout(() => {
        simulateTyping(currentAITranscript, TYPING_SPEED);
      }, 100);
      
    } else if (!isAiSpeaking && currentSpeaker === 'ai') {
      // AI finished speaking
      setIsTyping(false);
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    }
  }, [isAiSpeaking, currentAITranscript, simulateTyping, currentSpeaker, truncateFromStart]);

  // Handle user speaking (live transcription)
  useEffect(() => {
    if (isUserSpeaking && currentSpeaker !== 'user') {
      setCurrentSpeaker('user');
      
      // Add user speaker indicator
      const userPrefix = '\n👤 You: ';
      setDisplayTranscript(prev => {
        const newText = prev + userPrefix;
        return truncateFromStart(newText, MAX_DISPLAY_LENGTH);
      });
    }
    
    if (isUserSpeaking && currentUserTranscript) {
      // Live update user transcript
      setDisplayTranscript(prev => {
        // Remove the last user input and add the updated one
        const lines = prev.split('\n');
        const lastLineIndex = lines.length - 1;
        
        if (lastLineIndex >= 0 && lines[lastLineIndex].startsWith('👤 You: ')) {
          lines[lastLineIndex] = '👤 You: ' + currentUserTranscript;
        } else {
          lines.push('👤 You: ' + currentUserTranscript);
        }
        
        const newText = lines.join('\n');
        return truncateFromStart(newText, MAX_DISPLAY_LENGTH);
      });
      
      scrollToBottom();
    } else if (!isUserSpeaking && currentSpeaker === 'user') {
      // User finished speaking
      setCurrentSpeaker(null);
    }
  }, [isUserSpeaking, currentUserTranscript, currentSpeaker, scrollToBottom, truncateFromStart]);

  // Handle conversation history updates (when responses are finalized)
  useEffect(() => {
    if (conversationHistory.length > 0) {
      const lastEntry = conversationHistory[conversationHistory.length - 1];
      
      // Only add to transcript if it's not already being displayed live
      if (!isAiSpeaking && !isUserSpeaking && !isTyping) {
        const speaker = lastEntry.type === 'ai' ? '🤖 AI: ' : '👤 You: ';
        const newEntry = '\n' + speaker + lastEntry.content;
        
        setDisplayTranscript(prev => {
          const newText = prev + newEntry;
          return truncateFromStart(newText, MAX_DISPLAY_LENGTH);
        });
        
        scrollToBottom();
      }
    }
  }, [conversationHistory, isAiSpeaking, isUserSpeaking, isTyping, scrollToBottom, truncateFromStart]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current);
      }
    };
  }, []);

  // Get current status
  const getCurrentStatus = () => {
    if (isTyping) return { text: 'AI is speaking...', color: '#3b82f6', icon: Volume2 };
    if (isAiSpeaking) return { text: 'AI is speaking...', color: '#3b82f6', icon: Volume2 };
    if (isUserSpeaking) return { text: 'You are speaking...', color: '#10b981', icon: Mic };
    return { text: 'Waiting...', color: '#6b7280', icon: null };
  };

  const status = getCurrentStatus();

  if (!isVisible) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          📝 Live Transcript
        </div>
        <div style={{ ...styles.status, color: status.color }}>
          {status.icon && <status.icon size={14} style={{ marginRight: '4px' }} />}
          {status.text}
        </div>
      </div>

      {/* Transcript Content */}
      <div 
        ref={transcriptRef}
        style={styles.transcriptArea}
      >
        <div style={styles.transcriptContent}>
          {displayTranscript.split('\n').map((line, index) => {
            if (!line.trim()) return null;
            
            const isAILine = line.startsWith('🤖 AI: ');
            const isUserLine = line.startsWith('👤 You: ');
            const isCurrentlyTyping = isTyping && index === displayTranscript.split('\n').length - 1 && isAILine;
            
            return (
              <div 
                key={index} 
                style={{
                  ...styles.transcriptLine,
                  ...(isAILine ? styles.aiLine : {}),
                  ...(isUserLine ? styles.userLine : {}),
                  ...(isCurrentlyTyping ? styles.typingLine : {})
                }}
              >
                {isAILine && (
                  <div style={styles.speakerIcon}>
                    <Bot size={14} color="#3b82f6" />
                  </div>
                )}
                {isUserLine && (
                  <div style={styles.speakerIcon}>
                    <User size={14} color="#10b981" />
                  </div>
                )}
                <div style={styles.messageContent}>
                  {line.replace(/^(🤖 AI: |👤 You: )/, '')}
                  {isCurrentlyTyping && (
                    <span style={styles.typingCursor}>|</span>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Empty state */}
          {!displayTranscript.trim() && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <div style={styles.emptyText}>
                Live transcript will appear here...
              </div>
              <div style={styles.emptySubtext}>
                Start the interview to see real-time transcription
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerText}>
          {displayTranscript.length > MAX_DISPLAY_LENGTH && (
            <span style={styles.truncateWarning}>
              ✂️ Showing recent {MAX_DISPLAY_LENGTH} characters
            </span>
          )}
          <span style={styles.charCount}>
            {displayTranscript.length} characters
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    height: '300px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px'
  },
  
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },
  
  status: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500'
  },
  
  transcriptArea: {
    flex: 1,
    overflow: 'auto',
    padding: '0',
    backgroundColor: '#1f2937'
  },
  
  transcriptContent: {
    padding: '12px',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  
  transcriptLine: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '8px',
    padding: '6px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    transition: 'all 0.2s ease'
  },
  
  aiLine: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeft: '3px solid #3b82f6'
  },
  
  userLine: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeft: '3px solid #10b981'
  },
  
  typingLine: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
  },
  
  speakerIcon: {
    marginRight: '8px',
    marginTop: '2px',
    flexShrink: 0
  },
  
  messageContent: {
    color: '#d1d5db',
    lineHeight: '1.4',
    wordBreak: 'break-word',
    flex: 1
  },
  
  typingCursor: {
    color: '#3b82f6',
    fontWeight: 'bold',
    animation: 'blink 1s infinite',
    marginLeft: '2px'
  },
  
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#6b7280'
  },
  
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  
  emptyText: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
    color: '#9ca3af'
  },
  
  emptySubtext: {
    fontSize: '12px',
    color: '#6b7280'
  },
  
  footer: {
    padding: '8px 16px',
    borderTop: '1px solid #374151',
    backgroundColor: '#111827',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px'
  },
  
  footerText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: '#6b7280'
  },
  
  truncateWarning: {
    color: '#f59e0b',
    fontWeight: '500'
  },
  
  charCount: {
    color: '#9ca3af'
  }
};

// Add CSS animation for typing cursor
const style = document.createElement('style');
style.textContent = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;
document.head.appendChild(style);

export default LiveTranscript;