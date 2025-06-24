// AISpeechTranscript.js - Real-time AI speech transcript extractor

class AISpeechTranscript {
  constructor() {
    this.isActive = false;
    this.currentText = '';
    this.words = [];
    this.currentWordIndex = 0;
    this.audioElement = null;
    this.startTime = null;
    this.intervalId = null;
    this.onTextUpdate = null;
    this.speechRate = 150; // words per minute (adjustable)
    this.updateTimeout = null; // ADD THIS LINE

  }

  // Initialize with audio element and callback
  initialize(audioElement, fullText, onTextUpdate) {
    this.audioElement = audioElement;
    this.currentText = fullText;
    this.words = fullText.split(' ');
    this.currentWordIndex = 0;
    this.onTextUpdate = onTextUpdate;
    this.isActive = true;
    this.startTime = null;

    // Clean up any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Set up event listeners
    this.setupAudioListeners();
  }

  setupAudioListeners() {
    if (!this.audioElement) return;

    // When audio starts playing
    this.audioElement.addEventListener('play', () => {
      this.startRealTimeTranscript();
    });

    // When audio is paused
    this.audioElement.addEventListener('pause', () => {
      this.pauseTranscript();
    });

    // When audio ends
    this.audioElement.addEventListener('ended', () => {
      this.stopTranscript();
    });

    // When audio time updates (for sync)
    this.audioElement.addEventListener('timeupdate', () => {
      this.syncWithAudioTime();
    });

    // When audio loads and we can get duration
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.calculateTiming();
    });
  }

  calculateTiming() {
    if (!this.audioElement || !this.audioElement.duration) return;

    // Calculate words per second based on actual audio duration
    const audioDurationSeconds = this.audioElement.duration;
    const totalWords = this.words.length;
    
    if (totalWords > 0 && audioDurationSeconds > 0) {
      this.speechRate = (totalWords / audioDurationSeconds) * 60; // Convert to words per minute
      console.log(`Calculated speech rate: ${this.speechRate.toFixed(1)} words per minute`);
    }
  }

  startRealTimeTranscript() {
    if (!this.isActive || !this.words.length) return;

    this.startTime = Date.now();
    console.log('Starting real-time AI transcript');

    // Calculate interval based on speech rate
    const wordsPerSecond = this.speechRate / 60;
    const millisecondsPerWord = (1000 / wordsPerSecond)*3;

//     const randomDelay = Math.random() * 200; // 0-200ms random delay
// setTimeout(this.updateTranscript, millisecondsPerWord + randomDelay);

    this.intervalId = setInterval(() => {
      this.updateTranscript();
    }, millisecondsPerWord);

    // Initial update
    this.updateTranscript();
  }

 updateTranscript() {
  // Batch 2-3 words at once instead of 1 word
  const wordsToAdd = 3; // Add 3 words at once
  const endIndex = Math.min(this.currentWordIndex + wordsToAdd, this.words.length);
  const currentTranscript = this.words.slice(0, endIndex).join(' ');
  
  if (this.onTextUpdate) {
    this.onTextUpdate(currentTranscript);
  }
  
  this.currentWordIndex = endIndex;
}
  syncWithAudioTime() {
    if (!this.audioElement || !this.isActive || !this.words.length) return;

    const currentTime = this.audioElement.currentTime;
    const totalDuration = this.audioElement.duration;

    if (totalDuration > 0) {
      // Calculate which word should be showing based on audio progress
      const progress = currentTime / totalDuration;
      const expectedWordIndex = Math.floor(progress * this.words.length);

      // Adjust if we're significantly off
      if (Math.abs(expectedWordIndex - this.currentWordIndex) > 2) {
        this.currentWordIndex = expectedWordIndex;
        const syncedTranscript = this.words.slice(0, this.currentWordIndex + 1).join(' ');
        
        if (this.onTextUpdate) {
          this.onTextUpdate(syncedTranscript);
        }
      }
    }
  }

  pauseTranscript() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  stopTranscript() {
    this.isActive = false;
    this.currentWordIndex = 0;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear the transcript
    if (this.onTextUpdate) {
      this.onTextUpdate('');
    }

    console.log('AI transcript stopped');
  }

  // Alternative method using Web Speech API to listen to AI speech
  startSpeechRecognitionForAI() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported for AI transcript');
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.aiRecognition = new SpeechRecognition();

      this.aiRecognition.continuous = true;
      this.aiRecognition.interimResults = true;
      this.aiRecognition.lang = 'en-US';

      this.aiRecognition.onstart = () => {
        console.log('AI speech recognition started');
      };

      this.aiRecognition.onresult = (event) => {
        let transcript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim() && this.onTextUpdate) {
          this.onTextUpdate(transcript);
        }
      };

      this.aiRecognition.onerror = (event) => {
        console.error('AI speech recognition error:', event.error);
      };

      this.aiRecognition.onend = () => {
        console.log('AI speech recognition ended');
        if (this.onTextUpdate) {
          this.onTextUpdate('');
        }
      };

      this.aiRecognition.start();
      return true;

    } catch (error) {
      console.error('Failed to start AI speech recognition:', error);
      return false;
    }
  }

  stopSpeechRecognition() {
    if (this.aiRecognition) {
      this.aiRecognition.stop();
      this.aiRecognition = null;
    }
  }

  // Method to create audio context for real-time analysis
  startAudioAnalysis() {
    if (!this.audioElement) return false;

    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(this.audioElement);
      const analyser = audioContext.createAnalyser();

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let isPlaying = false;

      const detectSpeech = () => {
        if (!this.isActive) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Detect if audio is playing (simple threshold)
        const threshold = 10; // Adjust as needed
        const currentlyPlaying = average > threshold;

        if (currentlyPlaying && !isPlaying) {
          // Audio started
          isPlaying = true;
          this.startRealTimeTranscript();
        } else if (!currentlyPlaying && isPlaying) {
          // Audio stopped
          isPlaying = false;
          this.pauseTranscript();
        }

        requestAnimationFrame(detectSpeech);
      };

      detectSpeech();
      return true;

    } catch (error) {
      console.error('Failed to start audio analysis:', error);
      return false;
    }
  }

  // Cleanup method
  cleanup() {
    this.stopTranscript();
    this.stopSpeechRecognition();
    
    if (this.audioElement) {
      // Remove event listeners
      this.audioElement.removeEventListener('play', this.startRealTimeTranscript);
      this.audioElement.removeEventListener('pause', this.pauseTranscript);
      this.audioElement.removeEventListener('ended', this.stopTranscript);
      this.audioElement.removeEventListener('timeupdate', this.syncWithAudioTime);
      this.audioElement.removeEventListener('loadedmetadata', this.calculateTiming);
    }

    this.audioElement = null;
    this.onTextUpdate = null;
  }
}

export default AISpeechTranscript;