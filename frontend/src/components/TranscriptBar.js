import React, { useState, useEffect, useRef,useMemo } from 'react';

const TranscriptBar = ({ 
  speaker, // 'ai' or 'user'
  isActive = false, 
  currentText = '',
  position = 'bottom' // 'bottom' or 'top'
}) => {
  const [displayText, setDisplayText] = useState('');
  const [sentences, setSentences] = useState(['', '']);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);


  // Add this after the useState lines (around line 15)
const processedSentences = useMemo(() => {
  if (!currentText || !currentText.trim()) return ['', ''];
  
  const sentenceEnders = /[.!?]+\s/;
  const textSentences = currentText.split(sentenceEnders).filter(s => s.trim());
  
  if (textSentences.length >= 2) {
    return [
      textSentences[textSentences.length - 2]?.trim() || '',
      textSentences[textSentences.length - 1]?.trim() || ''
    ];
  } else if (textSentences.length === 1) {
    const words = textSentences[0].split(' ');
    if (words.length > 15) {
      const midPoint = Math.floor(words.length / 2);
      return [
        words.slice(0, midPoint).join(' '),
        words.slice(midPoint).join(' ')
      ];
    } else {
      return ['', textSentences[0]];
    }
  } else {
    return ['', ''];
  }
}, [currentText]);

// Then use processedSentences instead of sentences in your effects

  // Configuration
  const MAX_SENTENCES = 2;
  const HIDE_DELAY = 3000; // Hide after 3 seconds of inactivity
  const TYPING_SPEED = 50; // Speed for progressive text display

  // Update display text when currentText changes
useEffect(() => {
  if (currentText && currentText.trim()) {
    // SMOOTHING: Add delay before showing changes
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
      updateSentences(currentText);
    }, 200);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout to hide when inactive
    if (!isActive) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, HIDE_DELAY);
    }

    return () => clearTimeout(showTimeout);
  }
}, [currentText, isActive]);

  // Hide when speaker becomes inactive
  useEffect(() => {
    if (!isActive && currentText) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, HIDE_DELAY);
    } else if (isActive) {
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, currentText]);

  // Update sentences with smart sentence detection
  const updateSentences = (text) => {
    // Split by sentence endings, but keep simple for real-time
    const words = text.split(' ');
    
    // For real-time display, we'll show the most recent words
    // and try to break at natural sentence boundaries
    const sentenceEnders = /[.!?]+\s/;
    const textSentences = text.split(sentenceEnders).filter(s => s.trim());
    
    if (textSentences.length >= MAX_SENTENCES) {
      // Show last 2 sentences
      setSentences([
        textSentences[textSentences.length - 2]?.trim() || '',
        textSentences[textSentences.length - 1]?.trim() || ''
      ]);
    } else if (textSentences.length === 1) {
      // Split long single sentence into two parts
      const words = textSentences[0].split(' ');
      if (words.length > 15) {
        const midPoint = Math.floor(words.length / 2);
        setSentences([
          words.slice(0, midPoint).join(' '),
          words.slice(midPoint).join(' ')
        ]);
      } else {
        setSentences(['', textSentences[0]]);
      }
    } else {
      setSentences([
        textSentences[0]?.trim() || '',
        textSentences[1]?.trim() || ''
      ]);
    }
  };

  // Progressive text display for current sentence
  const [progressiveText, setProgressiveText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);

useEffect(() => {
  if (isActive && sentences[1]) {
    const words = sentences[1].split(' ');
    let currentIndex = 0;
    
    const showNextWord = () => {
      if (currentIndex < words.length && isActive) {
        setProgressiveText(words.slice(0, currentIndex + 1).join(' '));
        currentIndex++;
        // SMOOTHING: Slower, more natural timing
        setTimeout(showNextWord, 150 + Math.random() * 150);
      }
    };
    
    setProgressiveText('');
    showNextWord();
  } else if (!isActive) {
    setProgressiveText(sentences[1] || '');
  }
}, [sentences, isActive]);

  if (!isVisible || (!sentences[0] && !sentences[1])) {
    return null;
  }

  const styles = {
    container: {
      position: 'absolute',
      left: '8px',
      right: '8px',
      [position]: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      padding: '8px 12px',
      border: `2px solid ${speaker === 'ai' ? '#3b82f6' : '#10b981'}`,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      zIndex: 10,
      transition: 'all 0.3s ease',
      transform: isActive ? 'scale(1.02)' : 'scale(1)',
      animation: isActive ? 'glow 2s infinite alternate' : 'none'
    },
    
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px'
    },
    
    speakerLabel: {
      fontSize: '10px',
      fontWeight: '600',
      color: speaker === 'ai' ? '#60a5fa' : '#34d399',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    
    liveIndicator: {
      fontSize: '8px',
      padding: '2px 6px',
      borderRadius: '10px',
      backgroundColor: isActive ? '#ef4444' : 'transparent',
      color: isActive ? 'white' : 'transparent',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      animation: isActive ? 'pulse 1s infinite' : 'none'
    },
    
    content: {
      color: '#f3f4f6',
      fontSize: '12px',
      lineHeight: '1.4'
    },
    
    previousSentence: {
      color: '#9ca3af',
      marginBottom: '2px',
      opacity: 0.7,
      fontSize: '11px'
    },
    
    currentSentence: {
      color: '#f3f4f6',
      fontWeight: '500',
      minHeight: '16px',
      position: 'relative'
    },
    
    cursor: {
      display: 'inline-block',
      width: '2px',
      height: '14px',
      backgroundColor: speaker === 'ai' ? '#3b82f6' : '#10b981',
      marginLeft: '2px',
      animation: isActive ? 'blink 1s infinite' : 'none'
    },
    container: {
  position: 'absolute',
  left: '8px',
  right: '8px',
  [position]: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  padding: '8px 12px',
  border: `2px solid ${speaker === 'ai' ? '#3b82f6' : '#10b981'}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  zIndex: 10,
  transition: 'all 0.3s ease-in-out', // ADD THIS LINE
  transform: isActive ? 'scale(1.02)' : 'scale(1)',
  animation: isActive ? 'glow 2s infinite alternate' : 'none'
},

currentSentence: {
  color: '#f3f4f6',
  fontWeight: '500',
  minHeight: '16px',
  position: 'relative',
  transition: 'opacity 0.2s ease' // ADD THIS LINE
}
  };

  return (
    <>
      <style>
        {`
          @keyframes glow {
            0% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
            100% { 
              box-shadow: 0 4px 25px ${speaker === 'ai' 
                ? 'rgba(59, 130, 246, 0.4)' 
                : 'rgba(16, 185, 129, 0.4)'
              };
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
      
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.speakerLabel}>
            {speaker === 'ai' ? '🤖' : '👤'} {speaker === 'ai' ? 'AI' : 'You'}
          </div>
          <div style={styles.liveIndicator}>
            {isActive ? 'LIVE' : ''}
          </div>
        </div>
        
        <div style={styles.content}>
          {sentences[0] && (
            <div style={styles.previousSentence}>
              {sentences[0]}
            </div>
          )}
          
          <div style={styles.currentSentence}>
            {isActive ? progressiveText : sentences[1]}
            {isActive && <span style={styles.cursor}></span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default TranscriptBar;