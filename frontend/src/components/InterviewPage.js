import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Volume2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import TranscriptBar from './TranscriptBar.js';

// AI Speech Transcript class (embedded)
class AISpeechTranscript {
  constructor() {
    this.isActive = false;
    this.audioElement = null;
    this.onTextUpdate = null;
    this.fullText = '';
    this.timeoutId = null;
  }

  initialize(audioElement, fullText, onTextUpdate) {
    this.audioElement = audioElement;
    this.fullText = fullText;
    this.onTextUpdate = onTextUpdate;
    this.isActive = true;

    this.audioElement.addEventListener('play', () => {
      this.startSimpleTranscript();
    });

    this.audioElement.addEventListener('ended', () => {
      this.stopTranscript();
    });
  }

  startSimpleTranscript() {
    if (!this.isActive) return;

    const sentences = this.fullText.split(/[.!?]+/).filter(s => s.trim());
    let currentSentence = 0;

    const showNextSentence = () => {
      if (currentSentence < sentences.length && this.isActive) {
        const textToShow = sentences.slice(0, currentSentence + 1).join('. ');
        
        if (this.onTextUpdate) {
          this.onTextUpdate(textToShow);
        }
        
        currentSentence++;
        
        // Show next sentence after 3-5 seconds
        this.timeoutId = setTimeout(showNextSentence, 3000 + Math.random() * 1000);
      }
    };

    // Start after 1 second
    this.timeoutId = setTimeout(showNextSentence, 700);
  }

  stopTranscript() {
    this.isActive = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.onTextUpdate) {
      this.onTextUpdate('');
    }
  }

  cleanup() {
    this.stopTranscript();
    this.audioElement = null;
    this.onTextUpdate = null;
  }
}

const AIInterviewPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const interviewData = state?.interviewData;

  // Interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Audio/Video controls
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Conversation flow state
  const [conversationState, setConversationState] = useState('waiting');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to start your interview');

  const [conversationHistory, setConversationHistory] = useState([]);
  const [interviewFeedback, setInterviewFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Real-time transcript states for bars
  const [userTranscriptText, setUserTranscriptText] = useState('');
  const [aiTranscriptText, setAiTranscriptText] = useState('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [showTranscriptBars, setShowTranscriptBars] = useState(true);

  // Socket.IO refs
  const socketRef = useRef(null);
  const userVideoRef = useRef(null);
  const currentAudio = useRef(null);
  
  // Audio recording refs
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // Real-time transcription refs
  const recognitionRef = useRef(null);
  const isRecognitionActive = useRef(false);
  const aiTranscriptRef = useRef(null);

  // Recording settings
  const CHUNK_DURATION = 8000;
  const SILENCE_THRESHOLD = 3000;
  const MAX_RECORDING_TIME = 180000;

  // Initialize AI transcript handler
  useEffect(() => {
    aiTranscriptRef.current = new AISpeechTranscript();
    
    return () => {
      if (aiTranscriptRef.current) {
        aiTranscriptRef.current.cleanup();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (interviewStarted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [interviewStarted]);

  // Camera setup
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log('Camera access denied'));
    }
  }, []);

  // Setup real-time speech recognition for user transcript
  const setupRealTimeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('User speech recognition started');
        isRecognitionActive.current = true;
      };

      // recognitionRef.current.onresult = (event) => {
      //   let interimTranscript = '';
      //   let finalTranscript = '';

      //   for (let i = event.resultIndex; i < event.results.length; i++) {
      //     const transcript = event.results[i][0].transcript;
      //     if (event.results[i].isFinal) {
      //       finalTranscript += transcript;
      //     } else {
      //       interimTranscript += transcript;
      //     }
      //   }

      //   const currentTranscript = finalTranscript + interimTranscript;
      //   if (currentTranscript.trim()) {
      //     setUserTranscriptText(currentTranscript);
      //   }
      // };


      recognitionRef.current.onresult = (event) => {
  let interimTranscript = '';
  let finalTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      finalTranscript += transcript;
    } else {
      interimTranscript += transcript;
    }
  }

  const currentTranscript = finalTranscript + interimTranscript;
  
  // SMOOTHING: Debounce updates
  clearTimeout(window.userTranscriptTimeout);
  window.userTranscriptTimeout = setTimeout(() => {
    if (currentTranscript.trim()) {
      setUserTranscriptText(currentTranscript);
    }
  }, 300);
};
      recognitionRef.current.onerror = (event) => {
        console.error('User recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setTimeout(() => {
            if (isUserSpeaking && isRecognitionActive.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Could not restart user recognition:', error);
              }
            }
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('User recognition ended');
        isRecognitionActive.current = false;
        
        if (isUserSpeaking) {
          setTimeout(() => {
            if (isUserSpeaking && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.log('Could not restart user recognition:', error);
              }
            }
          }, 100);
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to setup user speech recognition:', error);
      return false;
    }
  }, [isUserSpeaking]);

  // Socket.IO initialization
  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket'],
      timeout: 20000,
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setStatusMessage('Connected and ready to start');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setStatusMessage('Connection lost');
    });

    // Interview events
    socketRef.current.on('interview-started', (data) => {
      console.log('Interview started:', data);
      setStatusMessage('Interview started! Please answer the question.');
    });

    socketRef.current.on('ai-speaking', (data) => {
      console.log('AI speaking:', data);
      handleAIResponse(data);
    });

    socketRef.current.on('transcription-result', (data) => {
      console.log('Transcription result:', data);
      handleTranscriptionResult(data);
    });

    socketRef.current.on('processing-audio', (data) => {
      setConversationState('thinking');
      setStatusMessage(data.message);
      stopRealTimeRecognition();
    });

    socketRef.current.on('transcription-error', (data) => {
      console.error('Transcription error:', data);
      setStatusMessage('Could not process audio. Please try again.');
      setConversationState('waiting');
      
      setUserTranscriptText('');
      setIsUserSpeaking(false);
      
      setTimeout(() => {
        if (!interviewComplete) {
          startAudioRecording();
        }
      }, 2000);
    });

    socketRef.current.on('interview-complete', (data) => {
      console.log('Interview complete:', data);
      setInterviewComplete(true);
      setConversationState('complete');
      setStatusMessage('Interview completed! Thank you.');
      setConversationHistory(data.conversationHistory || conversationHistory);
      
      // Clear all transcripts
      setUserTranscriptText('');
      setAiTranscriptText('');
      setIsUserSpeaking(false);
      setIsAiSpeaking(false);
      
      if (aiTranscriptRef.current) {
        aiTranscriptRef.current.cleanup();
      }
      
      stopAudioRecording();
          // Navigate to feedback page with all necessary data
    setTimeout(() => {
      navigate('/feedback', {
        state: {
          conversationHistory: data.conversationHistory || conversationHistory,
          interviewData: {
            ...interviewData,
            jobTitle: interviewData?.jobTitle || 'Software Developer',
            company: interviewData?.company || 'TechCorp'
          },
          totalQuestions: 5,
          questionsAnswered: currentQuestionIndex + 1,
          interviewDuration: timeElapsed // This is in seconds
        }
      });
    }, 2000); // 2 second delay to show completion message

    });

    socketRef.current.on('interview-ended', (data) => {
      console.log('Interview ended:', data);
      handleInterviewEnd(data);
    });

    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data);
      setStatusMessage(`Error: ${data.message}`);
      setConversationState('waiting');
    });

    return () => {
      cleanup();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleAIResponse = async (data) => {
    setConversationState('speaking');
    setIsAiSpeaking(true);
    setStatusMessage('AI is responding...');
    
    // Clear previous AI transcript
    setAiTranscriptText('');

    // Add AI response to conversation history
    setConversationHistory(prev => [...prev, {
      type: 'ai',
      content: data.text,
      timestamp: new Date().toISOString()
    }]);

    // Update question info if provided
    if (data.questionNumber) {
      setCurrentQuestionIndex(data.questionNumber - 1);
    }

    try {
      // Convert base64 audio to blob and play
      const audioData = atob(data.audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (currentAudio.current) {
        currentAudio.current.pause();
        if (aiTranscriptRef.current) {
          aiTranscriptRef.current.cleanup();
        }
      }

      currentAudio.current = new Audio(audioUrl);
      
      // Initialize AI transcript with the audio element
      if (aiTranscriptRef.current && showTranscriptBars) {
        aiTranscriptRef.current.initialize(
          currentAudio.current, 
          data.text, 
          (transcript) => {
            setAiTranscriptText(transcript);
          }
        );
      }
      
      currentAudio.current.onended = () => {
        setIsAiSpeaking(false);
        setAiTranscriptText(''); // Clear AI transcript when done
        URL.revokeObjectURL(audioUrl);
        
        if (aiTranscriptRef.current) {
          aiTranscriptRef.current.stopTranscript();
        }
        
        if (data.isComplete) {
          setInterviewComplete(true);
          setConversationState('complete');
          setStatusMessage('Interview completed! Thank you.');
        } else if (!data.isSpecialResponse) {
          setConversationState('waiting');
          setStatusMessage('Please provide your complete answer...');
          
          setTimeout(() => {
            if (!interviewComplete) {
              startAudioRecording();
            }
          }, 1000);
        } else {
          setConversationState('waiting');
          setStatusMessage('Please continue with your answer...');
          
          setTimeout(() => {
            if (!interviewComplete) {
              startAudioRecording();
            }
          }, 1000);
        }
      };

      currentAudio.current.onerror = () => {
        setIsAiSpeaking(false);
        setAiTranscriptText('');
        setConversationState('waiting');
        setStatusMessage('Audio error. Please continue...');
        URL.revokeObjectURL(audioUrl);
        
        if (aiTranscriptRef.current) {
          aiTranscriptRef.current.stopTranscript();
        }
      };

      await currentAudio.current.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsAiSpeaking(false);
      setAiTranscriptText('');
      setConversationState('waiting');
      setStatusMessage('Ready for your response...');
      
      if (aiTranscriptRef.current) {
        aiTranscriptRef.current.stopTranscript();
      }
    }
  };

  const startRealTimeRecognition = useCallback(() => {
    if (recognitionRef.current && !isRecognitionActive.current) {
      try {
        setUserTranscriptText('');
        recognitionRef.current.start();
      } catch (error) {
        console.log('User recognition already running or failed to start:', error);
      }
    }
  }, []);

  const stopRealTimeRecognition = useCallback(() => {
    if (recognitionRef.current && isRecognitionActive.current) {
      recognitionRef.current.stop();
      isRecognitionActive.current = false;
    }
  }, []);

  const startAudioRecording = async () => {
    try {
      console.log('Starting audio recording...');
      
      if (!recognitionRef.current) {
        setupRealTimeRecognition();
      }
      
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });

      recordingChunksRef.current = [];
      
      setConversationState('listening');
      setStatusMessage('Listening... speak your complete answer');
      setIsUserSpeaking(true);

      startRealTimeRecognition();

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        setIsUserSpeaking(false);
        stopRealTimeRecognition();
        
        if (recordingChunksRef.current.length > 0) {
          processRecordedAudio();
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        handleRecordingError();
      };

      mediaRecorderRef.current.start();
      
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Max recording time reached, stopping...');
          stopAudioRecording();
        }
      }, MAX_RECORDING_TIME);

      silenceTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Silence detected, stopping recording...');
          stopAudioRecording();
        }
      }, CHUNK_DURATION + SILENCE_THRESHOLD);

    } catch (error) {
      console.error('Error starting recording:', error);
      setStatusMessage('Microphone access required. Please allow microphone access.');
      handleRecordingError();
    }
  };

  const stopAudioRecording = () => {
    console.log('Stopping audio recording...');
    
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    setIsUserSpeaking(false);
    stopRealTimeRecognition();
  };

  const processRecordedAudio = async () => {
    try {
      console.log('Processing recorded audio chunks:', recordingChunksRef.current.length);
      
      if (recordingChunksRef.current.length === 0) {
        setStatusMessage('No audio recorded. Please try again.');
        setConversationState('waiting');
        return;
      }

      const audioBlob = new Blob(recordingChunksRef.current, { 
        type: recordingChunksRef.current[0].type || 'audio/webm' 
      });
      
      if (audioBlob.size < 1024) {
        setStatusMessage('Audio too short. Please speak longer.');
        setConversationState('waiting');
        setTimeout(() => startAudioRecording(), 2000);
        return;
      }

      setConversationState('thinking');
      setStatusMessage('Processing your speech...');

      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result.split(',')[1];
        
        socketRef.current.emit('audio-data', {
          audioData: base64Audio,
          filename: `audio_${Date.now()}.webm`,
          mimeType: audioBlob.type
        });
      };
      
      reader.onerror = () => {
        console.error('Error reading audio blob');
        setStatusMessage('Error processing audio. Please try again.');
        setConversationState('waiting');
      };
      
      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('Error processing recorded audio:', error);
      setStatusMessage('Error processing audio. Please try again.');
      setConversationState('waiting');
    }
  };

  const handleTranscriptionResult = (data) => {
    if (data.needsClarification) {
      setStatusMessage(data.message);
      setConversationState('waiting');
      setUserTranscriptText('');
      setTimeout(() => {
        if (!interviewComplete) {
          startAudioRecording();
        }
      }, 2000);
    } else {
      setConversationState('thinking');
      setStatusMessage('Processing your response...');
      
      setConversationHistory(prev => [...prev, {
        type: 'user',
        content: data.transcript,
        timestamp: new Date().toISOString()
      }]);
      
      // Keep the final transcript visible for a moment
      setUserTranscriptText(data.transcript);
      setTimeout(() => {
        setUserTranscriptText('');
      }, 3000);
    }
  };

  const handleRecordingError = () => {
    setConversationState('waiting');
    setStatusMessage('Recording error. Please try again.');
    setIsUserSpeaking(false);
    setUserTranscriptText('');
    stopRealTimeRecognition();
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  };

  const cleanup = () => {
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (currentAudio.current) {
      currentAudio.current.pause();
    }

    if (aiTranscriptRef.current) {
      aiTranscriptRef.current.cleanup();
    }

    stopRealTimeRecognition();
    stopAudioRecording();
  };

  const startInterview = async () => {
    if (!socketRef.current || !socketRef.current.connected) {
      setStatusMessage('Not connected to server. Please refresh the page.');
      return;
    }

    setupRealTimeRecognition();

    setStatusMessage('Starting interview...');
    setInterviewStarted(true);
    setConversationState('waiting');

    socketRef.current.emit('start-interview', {
      interviewData: interviewData,
      timestamp: new Date().toISOString()
    });
  };

  const endInterview = async () => {
    setFeedbackLoading(true);
    setStatusMessage('Ending interview...');
    
    stopAudioRecording();
    
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('end-interview');
    }
    
    // Clear all transcripts
    setUserTranscriptText('');
    setAiTranscriptText('');
    setIsUserSpeaking(false);
    setIsAiSpeaking(false);
    
    if (aiTranscriptRef.current) {
      aiTranscriptRef.current.cleanup();
    }
    
    navigate('/feedback', {
      state: {
        conversationHistory: conversationHistory,
        interviewData: interviewData,
        totalQuestions: 5,
        questionsAnswered: currentQuestionIndex + 1,
        interviewDuration: timeElapsed
      }
    });
    
    setFeedbackLoading(false);
  };

  const handleInterviewEnd = (data) => {
    setInterviewComplete(true);
    setConversationState('complete');
    setStatusMessage('Interview ended');
    setConversationHistory(data.conversationHistory || conversationHistory);
    
    // Clear all transcripts
    setUserTranscriptText('');
    setAiTranscriptText('');
    setIsUserSpeaking(false);
    setIsAiSpeaking(false);
    
    if (aiTranscriptRef.current) {
      aiTranscriptRef.current.cleanup();
    }
    
    cleanup();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIndicator = () => {
    switch (conversationState) {
      case 'listening':
        return (
          <div style={styles.statusIndicator}>
            <div style={styles.pulsingDot}></div>
            <span>Listening...</span>
          </div>
        );
      case 'thinking':
        return (
          <div style={styles.statusIndicator}>
            <div style={styles.spinner}></div>
            <span>Processing...</span>
          </div>
        );
      case 'speaking':
        return (
          <div style={styles.statusIndicator}>
            <Volume2 size={16} />
            <span>AI Speaking...</span>
          </div>
        );
      default:
        return null;
    }
  };

  const styles = { 
    container: {
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#2d2d2d',
      borderBottom: '1px solid #404040',
      flexWrap: 'wrap',
      gap: '8px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap'
    },
    headerTitle: {
      fontSize: 'clamp(14px, 4vw, 18px)',
      fontWeight: '600'
    },
    headerTime: {
      fontSize: 'clamp(12px, 3vw, 14px)',
      color: '#9ca3af'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    connectionStatus: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '12px',
      backgroundColor: socketRef.current?.connected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      color: socketRef.current?.connected ? '#22c55e' : '#ef4444',
      border: `1px solid ${socketRef.current?.connected ? '#22c55e' : '#ef4444'}`
    },
    transcriptToggle: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '8px',
      backgroundColor: showTranscriptBars ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
      color: showTranscriptBars ? '#3b82f6' : '#6b7280',
      border: `1px solid ${showTranscriptBars ? '#3b82f6' : '#6b7280'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      '@media (min-width: 1024px)': {
        flexDirection: 'row'
      }
    },
    videoArea: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: '8px',
      padding: '12px',
      minHeight: '50vh',
      '@media (min-width: 640px)': {
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr',
        padding: '16px'
      }
    },
    videoContainer: {
      position: 'relative',
      backgroundColor: '#2d2d2d',
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '16/9',
      minHeight: '200px'
    },
    aiVideo: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
    },
    aiAvatarContainer: {
      textAlign: 'center'
    },
    aiAvatar: {
      width: 'clamp(60px, 15vw, 96px)',
      height: 'clamp(60px, 15vw, 96px)',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      transition: 'all 0.3s ease',
      border: isAiSpeaking ? '4px solid #10b981' : 'none',
      animation: isAiSpeaking ? 'pulse 1.5s infinite' : 'none'
    },
    aiAvatarEmoji: {
      fontSize: 'clamp(24px, 6vw, 36px)'
    },
    aiName: {
      fontSize: 'clamp(14px, 4vw, 18px)',
      fontWeight: '600',
      marginBottom: '4px'
    },
    aiRole: {
      fontSize: 'clamp(12px, 3vw, 14px)',
      color: '#93c5fd'
    },
    userVideo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    userVideoOff: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#404040'
    },
    userAvatarContainer: {
      textAlign: 'center'
    },
    userAvatar: {
      width: 'clamp(60px, 15vw, 96px)',
      height: 'clamp(60px, 15vw, 96px)',
      borderRadius: '50%',
      backgroundColor: '#525252',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    },
    videoLabel: {
      position: 'absolute',
      bottom: '8px',
      left: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: 'clamp(10px, 2.5vw, 14px)'
    },
    muteIndicator: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      backgroundColor: '#ef4444',
      padding: '4px',
      borderRadius: '4px'
    },
    statusArea: {
      position: 'absolute',
      top: '8px',
      left: '8px',
      right: '8px',
      textAlign: 'center'
    },
    statusMessage: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      marginBottom: '8px'
    },
    liveIndicator: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: isUserSpeaking ? 'rgba(16, 185, 129, 0.2)' : isAiSpeaking ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)',
      color: isUserSpeaking ? '#10b981' : isAiSpeaking ? '#3b82f6' : '#6b7280',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '10px',
      border: `1px solid ${isUserSpeaking ? '#10b981' : isAiSpeaking ? '#3b82f6' : '#6b7280'}`
    },
    statusIndicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#10b981'
    },
    pulsingDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#10b981',
      borderRadius: '50%',
      animation: 'pulse 1s infinite'
    },
    spinner: {
      width: '12px',
      height: '12px',
      border: '2px solid #404040',
      borderTop: '2px solid #10b981',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    bottomControls: {
      backgroundColor: '#2d2d2d',
      borderTop: '1px solid #404040',
      padding: '12px 16px'
    },
    controlsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'clamp(12px, 4vw, 16px)',
      flexWrap: 'wrap'
    },
    controlButton: {
      padding: 'clamp(8px, 2vw, 12px)',
      borderRadius: '50%',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      minWidth: '44px',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    muteButton: {
      backgroundColor: isMuted ? '#ef4444' : '#525252'
    },
    videoButton: {
      backgroundColor: !cameraOn ? '#ef4444' : '#525252'
    },
    endButton: {
      backgroundColor: '#ef4444'
    },
    startButton: {
      backgroundColor: '#10b981'
    }
  };

  if (!interviewData) {
    return <p>No interview data found. Please start from the home page.</p>;
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 640px) {
            .video-area {
              grid-template-columns: 1fr !important;
              grid-template-rows: repeat(2, 1fr) !important;
            }
          }
          
          @media (min-width: 640px) {
            .video-area {
              grid-template-columns: 1fr 1fr !important;
              grid-template-rows: 1fr !important;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerTitle}>🎙️ Real-time AI & User Transcript</div>
          <div style={styles.headerTime}>
            {formatTime(timeElapsed)} elapsed
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.connectionStatus}>
            {socketRef.current?.connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <div 
            style={styles.transcriptToggle}
            onClick={() => setShowTranscriptBars(!showTranscriptBars)}
          >
            📝 {showTranscriptBars ? 'Hide' : 'Show'} Live Transcripts
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Video Area */}
        <div style={styles.videoArea} className="video-area">
          {/* AI Interviewer */}
          <div style={styles.videoContainer}>
            <div style={styles.aiVideo}>
              <div style={styles.aiAvatarContainer}>
                <div style={styles.aiAvatar}>
                  <div style={styles.aiAvatarEmoji}>🤖</div>
                </div>
                <div style={styles.aiName}>AI Interviewer</div>
                <div style={styles.aiRole}>Live Speech Transcript</div>
              </div>
            </div>
            <div style={styles.videoLabel}>AI Interviewer</div>
            
            {/* Status indicators */}
            <div style={styles.statusArea}>
              <div style={styles.statusMessage}>{statusMessage}</div>
              {getStatusIndicator()}
            </div>

            {/* Live speaking indicator */}
            <div style={styles.liveIndicator}>
              {isAiSpeaking && <Volume2 size={12} />}
              {isAiSpeaking ? 'AI Speaking' : 'Ready'}
            </div>

            {/* AI Transcript Bar - Real-time from actual audio */}
            {showTranscriptBars && (
              <TranscriptBar
                speaker="ai"
                isActive={isAiSpeaking}
                currentText={aiTranscriptText}
                position="bottom"
              />
            )}
          </div>

          {/* User */}
          <div style={styles.videoContainer}>
            {cameraOn ? (
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                style={styles.userVideo}
              />
            ) : (
              <div style={styles.userVideoOff}>
                <div style={styles.userAvatarContainer}>
                  <div style={styles.userAvatar}>
                    <div style={styles.aiAvatarEmoji}>👤</div>
                  </div>
                  <div style={styles.aiName}>Camera Off</div>
                </div>
              </div>
            )}
            <div style={styles.videoLabel}>You</div>
            
            {isMuted && (
              <div style={styles.muteIndicator}>
                <MicOff size={16} />
              </div>
            )}

            {/* User speaking indicator */}
            {isUserSpeaking && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Mic size={12} />
                LIVE
              </div>
            )}

            {/* User Transcript Bar - Real-time from speech recognition */}
            {showTranscriptBars && (
              <TranscriptBar
                speaker="user"
                isActive={isUserSpeaking}
                currentText={userTranscriptText}
                position="bottom"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={styles.bottomControls}>
        {interviewStarted ? (
          <div style={styles.controlsRow}>
            <button
              style={{...styles.controlButton, ...styles.muteButton}}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              style={{...styles.controlButton, ...styles.videoButton}}
              onClick={() => setCameraOn(!cameraOn)}
            >
              {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              style={{...styles.controlButton, ...styles.endButton}}
              onClick={endInterview}
            >
              <Phone size={20} />
            </button>
          </div>
        ) : (
          <div style={styles.controlsRow}>
            <button
              style={{...styles.controlButton, ...styles.startButton}}
              onClick={startInterview}
              disabled={!socketRef.current?.connected}
            >
              <Phone size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Loading overlay for feedback generation */}
      {feedbackLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
          color: 'white',
          fontSize: '18px'
        }}>
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #404040',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            Generating your interview feedback...
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInterviewPage;