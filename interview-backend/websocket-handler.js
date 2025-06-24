// Add these updates to your websocket-handler.js file

const { socketHandlers } = require('./interview');

/**
 * Enhanced WebSocket event handlers with live transcript support
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} io - Socket.IO server instance
 */
module.exports = function(socket, io) {
  console.log('🔌 Initializing WebSocket handlers with live transcript support for socket:', socket.id);

  // Store live transcript state for each socket
  socket.liveTranscriptState = {
    isStreaming: false,
    currentSpeaker: null, // 'ai' or 'user'
    streamingText: '',
    lastWordTime: Date.now()
  };

  // ==================== INTERVIEW EVENTS ====================

  // Start interview event
  socket.on('start-interview', async (data) => {
    console.log('📝 Start interview with live transcript for:', socket.id);
    try {
      await socketHandlers.startInterview(socket, data);
      
      // Initialize live transcript
      socket.emit('live-transcript-ready', {
        message: 'Live transcript initialized',
        features: ['real-time-transcription', 'word-by-word-display', 'auto-truncation']
      });
      
    } catch (error) {
      console.error('❌ Error in start-interview handler:', error);
      socket.emit('error', { 
        message: 'Failed to start interview', 
        error: error.message 
      });
    }
  });

  // Handle audio data with live transcript support
  socket.on('audio-data', async (data) => {
    console.log('🎵 Audio data with live transcript from:', socket.id, 'Size:', data.audioData?.length || 0);
    
    // Mark user as speaking for live transcript
    socket.liveTranscriptState.isStreaming = true;
    socket.liveTranscriptState.currentSpeaker = 'user';
    socket.liveTranscriptState.lastWordTime = Date.now();
    
    // Emit live transcript status
    socket.emit('live-transcript-status', {
      isUserSpeaking: true,
      speaker: 'user',
      timestamp: Date.now()
    });
    
    try {
      await socketHandlers.handleAudioData(socket, data);
    } catch (error) {
      console.error('❌ Error in audio-data handler:', error);
      
      // Clear live transcript state on error
      socket.liveTranscriptState.isStreaming = false;
      socket.liveTranscriptState.currentSpeaker = null;
      
      socket.emit('live-transcript-status', {
        isUserSpeaking: false,
        speaker: null,
        error: true
      });
      
      socket.emit('transcription-error', { 
        message: 'Failed to process audio', 
        error: error.message 
      });
    }
  });

  // Enhanced AI speaking event with live transcript
  socket.on('ai-speech-start', (data) => {
    console.log('🤖 AI speech starting with live transcript for:', socket.id);
    
    socket.liveTranscriptState.isStreaming = true;
    socket.liveTranscriptState.currentSpeaker = 'ai';
    socket.liveTranscriptState.streamingText = data.text || '';
    
    // Start word-by-word streaming simulation
    if (data.enableLiveTranscript && data.text) {
      simulateAIWordStreaming(socket, data.text);
    }
    
    socket.emit('live-transcript-status', {
      isAiSpeaking: true,
      speaker: 'ai',
      fullText: data.text,
      enableWordByWord: data.enableLiveTranscript
    });
  });

  // AI speech end event
  socket.on('ai-speech-end', () => {
    console.log('🤖 AI speech ended for:', socket.id);
    
    socket.liveTranscriptState.isStreaming = false;
    socket.liveTranscriptState.currentSpeaker = null;
    socket.liveTranscriptState.streamingText = '';
    
    socket.emit('live-transcript-status', {
      isAiSpeaking: false,
      speaker: null,
      completed: true
    });
  });

  // Handle real-time transcript streaming (for advanced integrations)
  socket.on('stream-transcript-chunk', (data) => {
    console.log('📝 Streaming transcript chunk from:', socket.id);
    
    if (socket.liveTranscriptState.currentSpeaker === 'user') {
      socket.liveTranscriptState.streamingText += ' ' + data.text;
      socket.liveTranscriptState.lastWordTime = Date.now();
      
      // Broadcast live transcript update
      socket.emit('live-transcript-update', {
        speaker: 'user',
        text: data.text,
        fullTranscript: socket.liveTranscriptState.streamingText,
        timestamp: Date.now(),
        isPartial: data.isPartial || false
      });
      
      // Auto-finalize if no new words for 3 seconds
      setTimeout(() => {
        if (Date.now() - socket.liveTranscriptState.lastWordTime > 3000) {
          socket.emit('live-transcript-finalized', {
            speaker: 'user',
            finalText: socket.liveTranscriptState.streamingText,
            timestamp: Date.now()
          });
          
          socket.liveTranscriptState.streamingText = '';
        }
      }, 3500);
    }
  });

  // Handle text response (fallback)
  socket.on('text-response', async (data) => {
    console.log('📝 Text response with live transcript from:', socket.id);
    try {
      await socketHandlers.handleTextResponse(socket, data);
    } catch (error) {
      console.error('❌ Error in text-response handler:', error);
      socket.emit('error', { 
        message: 'Failed to process text response', 
        error: error.message 
      });
    }
  });

  // End interview event
  socket.on('end-interview', () => {
    console.log('🏁 End interview with live transcript cleanup for:', socket.id);
    
    // Clear live transcript state
    socket.liveTranscriptState.isStreaming = false;
    socket.liveTranscriptState.currentSpeaker = null;
    socket.liveTranscriptState.streamingText = '';
    
    socket.emit('live-transcript-status', {
      isUserSpeaking: false,
      isAiSpeaking: false,
      speaker: null,
      interviewEnded: true
    });
    
    try {
      socketHandlers.endInterview(socket);
    } catch (error) {
      console.error('❌ Error in end-interview handler:', error);
      socket.emit('error', { 
        message: 'Failed to end interview', 
        error: error.message 
      });
    }
  });

  // ==================== LIVE TRANSCRIPT SPECIFIC EVENTS ====================

  // Toggle live transcript
  socket.on('toggle-live-transcript', (data) => {
    console.log('📝 Toggle live transcript for:', socket.id, 'Enable:', data.enabled);
    
    socket.liveTranscriptState.enabled = data.enabled;
    
    socket.emit('live-transcript-toggled', {
      enabled: data.enabled,
      message: data.enabled ? 'Live transcript enabled' : 'Live transcript disabled'
    });
  });

  // Request transcript history
  socket.on('get-transcript-history', () => {
    console.log('📝 Transcript history requested for:', socket.id);
    
    // Get conversation history from interview session
    try {
      const activeInterviews = require('./interview').activeSocketInterviews || new Map();
      const sessionInfo = activeInterviews.get(socket.id);
      
      socket.emit('transcript-history', {
        conversationHistory: sessionInfo?.conversationHistory || [],
        currentTranscript: socket.liveTranscriptState.streamingText || '',
        speaker: socket.liveTranscriptState.currentSpeaker
      });
    } catch (error) {
      console.error('❌ Error getting transcript history:', error);
      socket.emit('transcript-history', {
        conversationHistory: [],
        error: 'Failed to retrieve transcript history'
      });
    }
  });

  // Clear live transcript
  socket.on('clear-live-transcript', () => {
    console.log('📝 Clear live transcript for:', socket.id);
    
    socket.liveTranscriptState.streamingText = '';
    
    socket.emit('live-transcript-cleared', {
      message: 'Live transcript cleared',
      timestamp: Date.now()
    });
  });

  // ==================== UTILITY FUNCTIONS ====================

  // Simulate word-by-word AI speech for live transcript
  function simulateAIWordStreaming(socket, fullText, wordsPerSecond = 3) {
    if (!fullText || !socket.liveTranscriptState.isStreaming) return;
    
    const words = fullText.split(' ');
    let currentIndex = 0;
    const intervalMs = 1000 / wordsPerSecond;
    
    const streamNextWord = () => {
      if (currentIndex < words.length && 
          socket.liveTranscriptState.currentSpeaker === 'ai' && 
          socket.liveTranscriptState.isStreaming) {
        
        const currentWords = words.slice(0, currentIndex + 1).join(' ');
        
        socket.emit('live-transcript-word-update', {
          speaker: 'ai',
          currentWord: words[currentIndex],
          currentText: currentWords,
          totalWords: words.length,
          wordIndex: currentIndex,
          progress: ((currentIndex + 1) / words.length) * 100
        });
        
        currentIndex++;
        setTimeout(streamNextWord, intervalMs + Math.random() * 200); // Add slight variation
      } else {
        // Streaming complete
        socket.emit('live-transcript-word-complete', {
          speaker: 'ai',
          finalText: fullText,
          totalWords: words.length
        });
      }
    };
    
    // Start streaming after a brief delay
    setTimeout(streamNextWord, 300);
  }

  // Monitor transcript activity and auto-cleanup
  function monitorTranscriptActivity() {
    const INACTIVE_TIMEOUT = 30000; // 30 seconds
    
    setInterval(() => {
      if (socket.liveTranscriptState.isStreaming && 
          socket.liveTranscriptState.currentSpeaker === 'user' &&
          Date.now() - socket.liveTranscriptState.lastWordTime > INACTIVE_TIMEOUT) {
        
        console.log('📝 Auto-finalizing inactive transcript for:', socket.id);
        
        socket.emit('live-transcript-auto-finalized', {
          speaker: 'user',
          finalText: socket.liveTranscriptState.streamingText,
          reason: 'inactivity_timeout',
          timestamp: Date.now()
        });
        
        socket.liveTranscriptState.isStreaming = false;
        socket.liveTranscriptState.currentSpeaker = null;
        socket.liveTranscriptState.streamingText = '';
      }
    }, 10000); // Check every 10 seconds
  }

  // Start monitoring
  monitorTranscriptActivity();

  // ==================== CONNECTION EVENTS ====================

  // Handle ping/heartbeat
  socket.on('ping', () => {
    socket.emit('pong', { 
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      liveTranscriptActive: socket.liveTranscriptState.isStreaming
    });
  });

  // Handle client status request
  socket.on('get-status', () => {
    socket.emit('status', {
      connected: true,
      socketId: socket.id,
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
      liveTranscript: {
        enabled: socket.liveTranscriptState.enabled !== false,
        isStreaming: socket.liveTranscriptState.isStreaming,
        currentSpeaker: socket.liveTranscriptState.currentSpeaker,
        textLength: socket.liveTranscriptState.streamingText.length
      }
    });
  });

  // ==================== DEBUGGING EVENTS ====================

  // Debug event for testing connection
  socket.on('debug-test', (data) => {
    console.log('🔍 Debug test from:', socket.id, data);
    socket.emit('debug-response', {
      message: 'Debug test successful with live transcript support',
      receivedData: data,
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      liveTranscriptState: socket.liveTranscriptState
    });
  });

  // Test live transcript functionality
  socket.on('test-live-transcript', (data) => {
    console.log('🧪 Testing live transcript for:', socket.id);
    
    const testText = data.text || "This is a test of the live transcript system. Each word should appear progressively.";
    
    socket.liveTranscriptState.isStreaming = true;
    socket.liveTranscriptState.currentSpeaker = data.speaker || 'ai';
    socket.liveTranscriptState.streamingText = testText;
    
    if (data.speaker === 'ai') {
      simulateAIWordStreaming(socket, testText, data.wordsPerSecond || 2);
    } else {
      // Simulate user typing
      const words = testText.split(' ');
      let index = 0;
      
      const simulateUserTyping = () => {
        if (index < words.length) {
          const currentText = words.slice(0, index + 1).join(' ');
          
          socket.emit('live-transcript-update', {
            speaker: 'user',
            text: words[index],
            fullTranscript: currentText,
            timestamp: Date.now(),
            isPartial: index < words.length - 1
          });
          
          index++;
          setTimeout(simulateUserTyping, 500 + Math.random() * 500);
        } else {
          socket.emit('live-transcript-finalized', {
            speaker: 'user',
            finalText: testText,
            timestamp: Date.now()
          });
          
          socket.liveTranscriptState.isStreaming = false;
          socket.liveTranscriptState.currentSpeaker = null;
        }
      };
      
      setTimeout(simulateUserTyping, 1000);
    }
    
    socket.emit('test-live-transcript-started', {
      message: 'Live transcript test started',
      speaker: data.speaker || 'ai',
      testText: testText
    });
  });

  // ==================== ERROR HANDLING ====================

  // Handle client errors
  socket.on('client-error', (error) => {
    console.error('❌ Client error reported:', socket.id, error);
    
    // Clear live transcript state on client error
    if (error.type === 'transcript-error') {
      socket.liveTranscriptState.isStreaming = false;
      socket.liveTranscriptState.currentSpeaker = null;
      socket.liveTranscriptState.streamingText = '';
    }
    
    socket.emit('error-acknowledged', {
      message: 'Error received and logged',
      timestamp: new Date().toISOString(),
      transcriptStateCleared: error.type === 'transcript-error'
    });
  });

  // Handle unexpected errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', socket.id, error);
    
    // Clear live transcript state on socket error
    socket.liveTranscriptState.isStreaming = false;
    socket.liveTranscriptState.currentSpeaker = null;
    socket.liveTranscriptState.streamingText = '';
  });

  // ==================== CLEANUP ON DISCONNECT ====================

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', socket.id, 'Reason:', reason);
    
    try {
      // Clean up interview session
      socketHandlers.handleDisconnect(socket);
      
      // Clean up live transcript state
      if (socket.liveTranscriptState) {
        socket.liveTranscriptState.isStreaming = false;
        socket.liveTranscriptState.currentSpeaker = null;
        socket.liveTranscriptState.streamingText = '';
      }
      
      // Update user session if it exists
      if (socket.userSession) {
        socket.userSession.disconnectTime = new Date();
        socket.userSession.disconnectReason = reason;
        socket.userSession.liveTranscriptState = socket.liveTranscriptState;
        
        // Clean up any temp files
        if (socket.userSession.tempFiles) {
          socket.userSession.tempFiles.forEach(filePath => {
            try {
              const fs = require('fs');
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🧹 Cleaned up temp file:', filePath);
              }
            } catch (cleanupError) {
              console.error('❌ Error cleaning up file:', cleanupError);
            }
          });
        }
      }
      
      console.log('✅ Socket cleanup completed with live transcript cleanup for:', socket.id);
      
    } catch (error) {
      console.error('❌ Error during socket cleanup:', error);
    }
  });

  // ==================== INITIALIZATION COMPLETE ====================

  console.log('✅ WebSocket handlers with live transcript support initialized for socket:', socket.id);
  
  // Send initialization confirmation
  socket.emit('handlers-ready', {
    message: 'WebSocket handlers with live transcript support initialized successfully',
    socketId: socket.id,
    availableEvents: [
      'start-interview',
      'audio-data',
      'text-response',
      'end-interview',
      'toggle-live-transcript',
      'get-transcript-history',
      'clear-live-transcript',
      'test-live-transcript',
      'stream-transcript-chunk',
      'ping',
      'get-status',
      'debug-test'
    ],
    liveTranscriptFeatures: [
      'word-by-word-display',
      'real-time-streaming',
      'auto-truncation',
      'speaker-identification',
      'activity-monitoring',
      'auto-finalization'
    ],
    timestamp: new Date().toISOString()
  });
};