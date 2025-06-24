const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const config = require('./config');

const router = express.Router();

// Initialize OpenAI and Gemini
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Import current assessment state
const { getCurrentAssessment } = require('./assessment');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/audio/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname) || '.webm';
    cb(null, `audio_${timestamp}${extension}`);
  }
});

const uploadAudio = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Audio file received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    if (file.mimetype.startsWith('audio/') || 
        file.originalname.endsWith('.webm') || 
        file.originalname.endsWith('.wav') || 
        file.originalname.endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Store active Socket.IO interview sessions
const activeSocketInterviews = new Map();

// Enhanced conversation state management (for HTTP fallback)
let conversationState = {
  currentQuestionIndex: 0,
  totalQuestions: 5,
  previousResponses: [],
  interviewContext: '',
  isFirstQuestion: true,
  waitingForResponse: false
};

// ==================== SHARED UTILITY FUNCTIONS ====================

// Generate TTS audio
const generateTTS = async (text) => {
  try {
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      speed: 1
    });

    return Buffer.from(await speechResponse.arrayBuffer());
  } catch (error) {
    console.error('TTS Error:', error);
    throw error;
  }
};

// Transcribe audio with Whisper
const transcribeAudioWithWhisper = async (audioBuffer, originalName = 'audio.webm') => {
  try {
    const tempDir = path.join(__dirname, 'temp_audio');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${originalName}`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    console.log('Transcribing audio file:', tempFilePath, 'Size:', audioBuffer.length);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
      temperature: 0.2,
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return transcription.trim();
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw error;
  }
};

// Generate natural transition between questions
const generateNaturalTransition = async (userResponse, questionIndex, currentQuestion) => {
  const prompt = config.voicePrompts.naturalTransition
    .replace('{currentQuestion}', currentQuestion)
    .replace('{userResponse}', userResponse)
    .replace('{questionIndex}', questionIndex + 1);

  try {
    const completion = await openai.chat.completions.create({
      model: config.voiceInterview.openai.chatModel,
      messages: [
        { 
          role: "system", 
          content: "You are a highly skilled, empathetic professional interviewer. You excel at reading candidate responses and adapting your communication style accordingly. You handle all interview situations with grace, patience, and professionalism. Your responses are natural, warm, and conversational - exactly what a human interviewer would say." 
        },
        { role: "user", content: prompt }
      ],
      temperature: config.voiceInterview.openai.temperature,
      max_tokens: config.voiceInterview.openai.maxTokens
    });

    const transition = completion.choices[0].message.content.trim();
    
    const isSpecialCase = config.voiceInterview.specialCases.repeat.some(keyword => 
      userResponse.toLowerCase().includes(keyword)) ||
      config.voiceInterview.specialCases.clarify.some(keyword => 
        userResponse.toLowerCase().includes(keyword)) ||
      config.voiceInterview.specialCases.technical.some(keyword => 
        userResponse.toLowerCase().includes(keyword)) ||
      userResponse.length < config.voiceInterview.specialCases.short;

    return {
      transition: transition,
      isSpecialCase: isSpecialCase
    };

  } catch (error) {
    console.error('Error generating transition:', error);
    return {
      transition: config.responseMessages.voice.defaultTransition,
      isSpecialCase: false
    };
  }
};

// Generate interview conclusion
const generateInterviewConclusion = async (responses) => {
  const responsesText = responses.map((r, i) => 
    `Q${i+1}: ${r.question}\nA${i+1}: ${r.answer.substring(0, 200)}...`
  ).join('\n\n');

  const prompt = config.voicePrompts.interviewConclusion
    .replace('{responses}', responsesText);

  try {
    const completion = await openai.chat.completions.create({
      model: config.voiceInterview.openai.chatModel,
      messages: [
        { role: "system", content: "You are a professional interviewer concluding an interview." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 150
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating conclusion:', error);
    return config.responseMessages.voice.interviewComplete;
  }
};

// Generate next question based on previous responses
const generateNextQuestion = async (previousResponses, resumeText, jobDescription, questionCount) => {
  const prompt = config.voicePrompts.nextQuestion
    .replace('{questionCount}', questionCount)
    .replace('{resumeText}', resumeText || 'No resume provided')
    .replace('{jobDescription}', jobDescription)
    .replace('{previousResponses}', JSON.stringify(previousResponses, null, 2));

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // or 'gpt-3.5-turbo-0125' for lower cost
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview assessment system. Generate the next interview question based on previous responses. Always respond with valid JSON only. The JSON should have this structure: { question: string, type: string, focus_area: string, expected_depth: string, ui_hint: string }'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    const result = response.choices[0].message.content.trim();
    return JSON.parse(result);
    
  } catch (error) {
    console.error('Error generating next question:', error);
    return {
      question: "What specific strategies do you use to stay current with industry trends and continuously improve your skills?",
      type: "experience",
      focus_area: "continuous learning and adaptability",
      expected_depth: "specific learning methods, recent examples, impact on work",
      ui_hint: "Testing commitment to professional development"
    };
  }
};

// Save audio to temporary file and return URL
const saveAudioToTempFile = async (audioBuffer, filename = null) => {
  const tempDir = path.join(__dirname, 'temp_audio');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = filename || `audio_${Date.now()}.mp3`;
  const filePath = path.join(tempDir, fileName);
  
  fs.writeFileSync(filePath, audioBuffer);

  // Clean up file after 30 seconds
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }, 30000);

  return `/temp_audio/${fileName}`;
};

// ==================== SOCKET.IO FUNCTIONS ====================

// Initialize interview session for Socket.IO
const initializeSocketInterview = (socketId, interviewData) => {
  const session = {
    socketId,
    interviewData,
    startTime: new Date(),
    conversationHistory: [],
    currentQuestion: null,
    questionCount: 0,
    maxQuestions: 5,
    responses: [],
    assessmentContext: ''
  };
  
  activeSocketInterviews.set(socketId, session);
  return session;
};

// Process user response via Socket.IO
const processSocketUserResponse = async (socket, userResponse, interviewSession) => {
  try {
    console.log('Processing Socket.IO user response:', userResponse.substring(0, 100) + '...');

    // Store response
    interviewSession.responses.push({
      questionNumber: interviewSession.questionCount + 1,
      question: interviewSession.currentQuestion?.question || 'Question not available',
      response: userResponse,
      timestamp: new Date()
    });

    interviewSession.conversationHistory.push({
      type: 'user',
      content: userResponse,
      timestamp: new Date().toISOString()
    });

    // Generate transition
    const transitionData = await generateNaturalTransition(
      userResponse,
      interviewSession.questionCount,
      interviewSession.currentQuestion?.question || ''
    );

    // Check if special case (don't advance question)
    if (transitionData.isSpecialCase) {
      const audioBuffer = await generateTTS(transitionData.transition);
      const audioBase64 = audioBuffer.toString('base64');
      
      socket.emit('ai-speaking', {
        audio: audioBase64,
        text: transitionData.transition,
        isSpecialResponse: true,
        currentQuestion: interviewSession.currentQuestion?.question,
        questionNumber: interviewSession.questionCount + 1
      });
      return;
    }

    // Advance question count
    interviewSession.questionCount++;

    // Check if interview complete
    if (interviewSession.questionCount >= interviewSession.maxQuestions) {
      const completionText = `${transitionData.transition} That completes our interview today. Thank you so much for your time and thoughtful responses. We'll be in touch soon regarding next steps. Have a wonderful day!`;
      
      const audioBuffer = await generateTTS(completionText);
      const audioBase64 = audioBuffer.toString('base64');
      
      socket.emit('ai-speaking', {
        audio: audioBase64,
        text: completionText,
        isComplete: true
      });

      socket.emit('interview-complete', {
        success: true,
        message: 'Interview completed successfully',
        responses: interviewSession.responses,
        conversationHistory: interviewSession.conversationHistory
      });

      // Clean up session
      activeSocketInterviews.delete(socket.id);
      return;
    }

    // Generate next question
    const nextQuestionData = await generateNextQuestion(
      interviewSession.responses,
      interviewSession.interviewData?.resumeText,
      interviewSession.interviewData?.jobDescription,
      interviewSession.questionCount + 1
    );

    interviewSession.currentQuestion = {
      question: nextQuestionData.question,
      questionNumber: interviewSession.questionCount + 1,
      data: nextQuestionData
    };

    // Combine transition + new question
    const fullResponse = `${transitionData.transition} ${nextQuestionData.question}`;
    
    const audioBuffer = await generateTTS(fullResponse);
    const audioBase64 = audioBuffer.toString('base64');
    
    socket.emit('ai-speaking', {
      audio: audioBase64,
      text: fullResponse,
      question: nextQuestionData.question,
      questionNumber: interviewSession.questionCount + 1,
      totalQuestions: interviewSession.maxQuestions,
      questionData: nextQuestionData
    });

    interviewSession.conversationHistory.push({
      type: 'ai',
      content: fullResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing Socket.IO user response:', error);
    socket.emit('error', { message: 'Failed to process response', error: error.message });
  }
};

// ==================== SOCKET.IO EVENT HANDLERS ====================

// Export Socket.IO handlers for use in websocket-handler.js
const socketHandlers = {
  // Start interview via Socket.IO
  startInterview: async (socket, data) => {
    try {
      console.log('Starting Socket.IO interview for:', socket.id);
      
      // Initialize interview session
      const interviewSession = initializeSocketInterview(socket.id, data.interviewData);

      // Get first question from assessment module
      const currentAssessment = getCurrentAssessment();
      const firstQuestion = currentAssessment.currentQuestion?.question || 
        data.interviewData?.question?.question || 
        "Let's start with you telling me about yourself and what brings you to this opportunity today.";

      interviewSession.currentQuestion = {
        question: firstQuestion,
        questionNumber: 1
      };

      const introText = `Hello! Welcome to your interview. I'm excited to learn more about you and your background. Let's begin with our first question: ${firstQuestion}`;
      
      console.log('Generating TTS for first question...');
      const audioBuffer = await generateTTS(introText);
      const audioBase64 = audioBuffer.toString('base64');
      
      socket.emit('ai-speaking', {
        audio: audioBase64,
        text: introText,
        question: firstQuestion,
        questionNumber: 1,
        totalQuestions: interviewSession.maxQuestions
      });

      socket.emit('interview-started', {
        success: true,
        message: 'Interview started successfully',
        currentQuestion: firstQuestion,
        questionNumber: 1,
        totalQuestions: interviewSession.maxQuestions
      });

    } catch (error) {
      console.error('Error starting Socket.IO interview:', error);
      socket.emit('error', { message: 'Failed to start interview', error: error.message });
    }
  },

  // Handle audio data via Socket.IO
  handleAudioData: async (socket, data) => {
    try {
      console.log('Received Socket.IO audio data from:', socket.id, 'Size:', data.audioData?.length || 0);
      
      const interviewSession = activeSocketInterviews.get(socket.id);
      if (!interviewSession) {
        socket.emit('error', { message: 'No active interview session' });
        return;
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(data.audioData, 'base64');
      
      // Validate audio size
      if (audioBuffer.length < 1024) {
        socket.emit('transcription-error', { message: 'Audio data too small' });
        return;
      }

      socket.emit('processing-audio', { message: 'Processing your response...' });

      // Transcribe with Whisper
      const transcription = await transcribeAudioWithWhisper(audioBuffer, data.filename || 'audio.webm');
      
      console.log('Socket.IO transcription result:', transcription);

      if (!transcription || transcription.trim().length < 5) {
        socket.emit('transcription-result', {
          transcript: transcription,
          needsClarification: true,
          message: "I didn't catch that clearly. Could you please elaborate a bit more on your answer?"
        });
        return;
      }

      // Send transcription back to client
      socket.emit('transcription-result', {
        transcript: transcription,
        success: true
      });

      // Process response and generate next question
      await processSocketUserResponse(socket, transcription, interviewSession);

    } catch (error) {
      console.error('Error processing Socket.IO audio:', error);
      socket.emit('transcription-error', { 
        message: 'Failed to process audio', 
        error: error.message 
      });
    }
  },

  // Handle text response via Socket.IO
  handleTextResponse: async (socket, data) => {
    try {
      const interviewSession = activeSocketInterviews.get(socket.id);
      if (!interviewSession) {
        socket.emit('error', { message: 'No active interview session' });
        return;
      }

      await processSocketUserResponse(socket, data.text, interviewSession);
    } catch (error) {
      console.error('Error processing Socket.IO text response:', error);
      socket.emit('error', { message: 'Failed to process response' });
    }
  },

  // End interview via Socket.IO
  endInterview: (socket) => {
    try {
      console.log('Ending Socket.IO interview for:', socket.id);
      const interviewSession = activeSocketInterviews.get(socket.id);
      
      if (interviewSession) {
        socket.emit('interview-ended', {
          success: true,
          responses: interviewSession.responses,
          conversationHistory: interviewSession.conversationHistory,
          duration: Date.now() - interviewSession.startTime.getTime()
        });
        
        activeSocketInterviews.delete(socket.id);
      }
    } catch (error) {
      console.error('Error ending Socket.IO interview:', error);
      socket.emit('error', { message: 'Failed to end interview' });
    }
  },

  // Handle disconnection
  handleDisconnect: (socket) => {
    console.log('Socket.IO client disconnected, cleaning up interview session:', socket.id);
    activeSocketInterviews.delete(socket.id);
  }
};

// ==================== HTTP ROUTES (PRESERVED FOR COMPATIBILITY) ====================

// Send audio response helper
const sendAudioResponse = (res, audioBuffer) => {
  res.set({
    'Content-Type': 'audio/mpeg',
    'Content-Disposition': 'inline; filename="response.mp3"',
    'Cache-Control': 'no-cache'
  });
  res.send(audioBuffer);
};

// Main Whisper transcription endpoint (HTTP)
router.post('/api/transcribe-whisper', uploadAudio.single('audio'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    console.log('=== HTTP Transcription Request Started ===');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = req.file;
    console.log('File details:', {
      originalname: audioFile.originalname,
      filename: audioFile.filename,
      path: audioFile.path,
      size: audioFile.size,
      mimetype: audioFile.mimetype
    });

    if (audioFile.size < 1024) {
      console.log('File too small, cleaning up');
      fs.unlinkSync(audioFile.path);
      return res.status(400).json({ error: 'Audio file too small' });
    }

    if (!fs.existsSync(audioFile.path)) {
      console.error('Uploaded file not found:', audioFile.path);
      return res.status(500).json({ error: 'Uploaded file not found' });
    }

    console.log('File exists, size:', audioFile.size, 'bytes');

    try {
      console.log('Creating file stream for OpenAI...');
      
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFile.path),
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
        temperature: 0.2,
      });

      console.log('HTTP Whisper transcription successful');
      console.log('Transcription result:', transcription);

      fs.unlinkSync(audioFile.path);

      res.json({
        success: true,
        text: transcription.trim(),
        fileSize: audioFile.size,
        originalName: audioFile.originalname
      });

    } catch (openaiError) {
      console.error('OpenAI Whisper API error:', openaiError);
      
      try {
        const fileBuffer = fs.readFileSync(audioFile.path);
        const extension = path.extname(audioFile.originalname) || '.webm';
        tempFilePath = path.join(path.dirname(audioFile.path), `temp_${Date.now()}${extension}`);
        fs.writeFileSync(tempFilePath, fileBuffer);
        
        console.log('Created temporary file:', tempFilePath);
        
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          language: 'en',
          response_format: 'text',
          temperature: 0.2,
        });

        console.log('Alternative method successful');
        
        fs.unlinkSync(audioFile.path);
        fs.unlinkSync(tempFilePath);

        res.json({
          success: true,
          text: transcription.trim(),
          fileSize: audioFile.size,
          method: 'alternative'
        });

      } catch (alternativeError) {
        console.error('Alternative method also failed:', alternativeError);
        
        if (openaiError.code === 'invalid_request_error') {
          return res.status(400).json({ 
            error: 'Invalid audio format or file corrupted',
            details: openaiError.message 
          });
        }

        return res.status(500).json({ 
          error: 'Transcription service error',
          details: openaiError.message,
          alternativeError: alternativeError.message
        });
      }
    }

  } catch (error) {
    console.error('HTTP Transcription endpoint error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(500).json({ 
      error: 'Server error during transcription',
      details: error.message 
    });
  }
});

// Health check endpoint for debugging
router.get('/api/transcribe-health', (req, res) => {
  const uploadDir = 'uploads/audio/';
  const dirExists = fs.existsSync(uploadDir);
  
  res.json({
    status: 'healthy',
    uploadDirectory: uploadDir,
    directoryExists: dirExists,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    socketSessions: activeSocketInterviews.size,
    timestamp: new Date().toISOString()
  });
});

// Enhanced text-to-speech endpoint with better error handling
router.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const truncatedText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    const audioBuffer = await generateTTS(truncatedText);
    const audioUrl = await saveAudioToTempFile(audioBuffer);

    res.json({ audioUrl });

  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Start interview audio endpoint (HTTP)
router.post('/api/start-interview-audio', async (req, res) => {
  try {
    const { interviewData } = req.body;
    
    const currentAssessment = getCurrentAssessment();
    const firstQuestion = currentAssessment.currentQuestion?.question || 
      interviewData?.question?.question || 
      "Let's start with you telling me about yourself and what brings you to this opportunity today.";

    const introText = `Hello! Welcome to your interview. I'm excited to learn more about you and your background. Let's begin with our first question: ${firstQuestion}`;
    
    console.log('First question from AI:', firstQuestion);
    
    const audioBuffer = await generateTTS(introText);
    const audioUrl = await saveAudioToTempFile(audioBuffer, `interview_start_${Date.now()}.mp3`);

    res.json({ audioUrl });

  } catch (error) {
    console.error("Error starting interview audio:", error);
    res.status(500).json({ error: "Failed to start interview audio" });
  }
});

// Next question endpoint (HTTP)
router.post('/next-question', async (req, res) => {
  try {
    const { userResponse } = req.body;
    
    const currentAssessment = getCurrentAssessment();
    
    if (userResponse && currentAssessment.currentQuestion) {
      currentAssessment.responses.push({
        questionNumber: currentAssessment.questionCount,
        question: currentAssessment.currentQuestion.question,
        questionData: currentAssessment.currentQuestion,
        response: userResponse,
        timestamp: new Date()
      });
      
      currentAssessment.assessmentContext += `Q${currentAssessment.questionCount}: ${currentAssessment.currentQuestion.question}\nA${currentAssessment.questionCount}: ${userResponse}\n\n`;
    }
    
    const transitionData = await generateNaturalTransition(
      userResponse,
      currentAssessment.questionCount - 1,
      currentAssessment.currentQuestion.question
    );
    
    if (transitionData.isSpecialCase === true) {
      const audioBuffer = await generateTTS(transitionData.transition);
      const audioUrl = await saveAudioToTempFile(audioBuffer, `special_response_${Date.now()}.mp3`);
      
      return res.json({
        success: true,
        audioUrl,
        isSpecialResponse: true,
        message: transitionData.transition,
        currentQuestion: currentAssessment.currentQuestion.question,
        questionNumber: currentAssessment.questionCount,
        totalQuestions: currentAssessment.maxQuestions
      });
    }
    
    currentAssessment.questionCount++;
    
    if (currentAssessment.questionCount > currentAssessment.maxQuestions) {
      currentAssessment.finished = true;
      
      const completionText = `${transitionData.transition} That completes our interview today. Thank you so much for your time and thoughtful responses. We'll be in touch soon regarding next steps. Have a wonderful day!`;
      
      const audioBuffer = await generateTTS(completionText);
      const audioUrl = await saveAudioToTempFile(audioBuffer, `interview_complete_${Date.now()}.mp3`);
      
      return res.json({
        success: true,
        audioUrl,
        isComplete: true,
        message: completionText,
        interviewSummary: {
          totalQuestions: currentAssessment.questionCount - 1,
          responses: currentAssessment.responses
        }
      });
    }
    
    const nextQuestionData = await generateNextQuestion(
      currentAssessment.responses,
      currentAssessment.resumeText,
      currentAssessment.jobDescription,
      currentAssessment.questionCount
    );
    
    currentAssessment.currentQuestion = nextQuestionData;
    const fullResponse = `${transitionData.transition} ${nextQuestionData.question}`;
    
    const audioBuffer = await generateTTS(fullResponse);
    const audioUrl = await saveAudioToTempFile(audioBuffer, `question_${currentAssessment.questionCount}_${Date.now()}.mp3`);
    
    res.json({
      success: true,
      audioUrl,
      question: nextQuestionData.question,
      questionData: nextQuestionData,
      questionNumber: currentAssessment.questionCount,
      totalQuestions: currentAssessment.maxQuestions,
      isComplete: false,
      transition: transitionData.transition
    });
    
  } catch (error) {
    console.error("Error processing response:", error);
    res.status(500).json({ error: "Failed to process response" });
  }
});



// ==================== CANDIDATE FEEDBACK GENERATION ====================

const generateCandidateFeedback = async (conversationHistory, interviewData, duration) => {
  try {
    // Extract user responses from conversation
    const userResponses = conversationHistory
      .filter(entry => entry.type === 'user')
      .map((entry, index) => `Response ${index + 1}: ${entry.content}`)
      .join('\n\n');

    const aiQuestions = conversationHistory
      .filter(entry => entry.type === 'ai')
      .map((entry, index) => `Question ${index + 1}: ${entry.content}`)
      .join('\n\n');

    const prompt = `
You are an expert interview coach analyzing a candidate's performance in an AI-powered interview. Provide comprehensive feedback that helps the candidate improve.

INTERVIEW CONTEXT:
- Role: ${interviewData?.role || 'Software Developer'}
- Company: ${interviewData?.company || 'Technology Company'}
- Duration: ${duration} minutes
- Questions Asked: ${conversationHistory.filter(entry => entry.type === 'ai').length}
- Responses Given: ${conversationHistory.filter(entry => entry.type === 'user').length}

INTERVIEW QUESTIONS:
${aiQuestions}

CANDIDATE RESPONSES:
${userResponses}

Please analyze the candidate's performance and provide feedback in the following JSON format:

{
  "overallScore": {
    "score": number (0-100),
    "level": "Excellent|Good|Developing|Needs Improvement"
  },
  "communicationBreakdown": {
    "technicalExplanation": {
      "score": number (0-100),
      "feedback": "detailed analysis of how well they explained technical concepts"
    },
    "problemSolvingArticulation": {
      "score": number (0-100), 
      "feedback": "analysis of how clearly they communicated their problem-solving approach"
    },
    "behavioralResponses": {
      "score": number (0-100),
      "feedback": "evaluation of their behavioral question responses and examples"
    },
    "culturalFitIndicators": {
      "score": number (0-100),
      "feedback": "assessment of how well they align with company culture and values"
    }
  },
  "strengths": [
    {
      "category": "strength category name",
      "description": "what they did well",
      "evidence": "specific examples from their responses",
      "impact": "why this strength is valuable"
    }
  ],
  "developmentAreas": [
    {
      "category": "area needing improvement",
      "currentLevel": "current performance description",
      "challenge": "specific issue identified",
      "improvement": "actionable improvement strategy", 
      "practiceActivities": ["specific practice suggestion 1", "specific practice suggestion 2"],
      "resources": ["recommended learning resource 1", "recommended learning resource 2"]
    }
  ],
  "behavioralInsights": {
    "leadershipPotential": {
      "level": "Excellent|Strong|Good|Developing",
      "evidence": ["specific example from responses"],
      "developmentSuggestions": ["actionable suggestion"]
    },
    "teamCollaboration": {
      "level": "Excellent|Strong|Good|Developing", 
      "evidence": ["specific example from responses"],
      "developmentSuggestions": ["actionable suggestion"]
    },
    "adaptability": {
      "level": "Excellent|Strong|Good|Developing",
      "evidence": ["specific example from responses"], 
      "developmentSuggestions": ["actionable suggestion"]
    },
    "innovationMindset": {
      "level": "Excellent|Strong|Good|Developing",
      "evidence": ["specific example from responses"],
      "developmentSuggestions": ["actionable suggestion"]
    }
  },
  "actionPlan": {
    "immediate": {
      "title": "Next 1-2 Weeks",
      "actions": ["specific action item 1", "specific action item 2"]
    },
    "shortTerm": {
      "title": "Next 1-3 Months", 
      "actions": ["specific action item 1", "specific action item 2"]
    },
    "longTerm": {
      "title": "Next 3-6 Months",
      "actions": ["specific action item 1", "specific action item 2"]
    }
  },
  "interviewTips": [
    {
      "category": "Preparation",
      "tip": "specific actionable tip",
      "example": "concrete example of how to apply this tip"
    },
    {
      "category": "Communication",
      "tip": "specific actionable tip", 
      "example": "concrete example of how to apply this tip"
    },
    {
      "category": "Technical Discussion",
      "tip": "specific actionable tip",
      "example": "concrete example of how to apply this tip"
    }
  ],
  "encouragement": "Personalized encouraging message highlighting their potential and next steps"
}

Important Guidelines:
1. Be specific and reference actual content from their responses
2. Provide actionable, practical advice
3. Balance constructive criticism with positive reinforcement
4. Focus on growth and improvement opportunities
5. Make suggestions relevant to the role they're applying for
6. Use encouraging and professional language
7. Ensure all scores are realistic and justified by evidence

Return ONLY the JSON object, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach and career development specialist. Analyze interview performance and provide detailed, actionable feedback to help candidates improve. Always respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in OpenAI response');
    }

  } catch (error) {
    console.error('Error generating candidate feedback with OpenAI:', error);
    throw error;
  }
};

// Fallback feedback data
// const getFallbackFeedback = (duration, questionsCount) => ({
//   overallScore: {
//     score: 78,
//     level: "Good"
//   },
//   communicationBreakdown: {
//     technicalExplanation: {
//       score: 82,
//       feedback: "You demonstrated strong technical knowledge and were able to explain complex concepts clearly. Your use of examples helped illustrate your points effectively."
//     },
//     problemSolvingArticulation: {
//       score: 76,
//       feedback: "Your problem-solving approach was logical and systematic. You could improve by being more explicit about trade-offs and alternative solutions."
//     },
//     behavioralResponses: {
//       score: 74,
//       feedback: "You provided good examples from your experience. Consider using the STAR method (Situation, Task, Action, Result) to structure your responses more clearly."
//     },
//     culturalFitIndicators: {
//       score: 80,
//       feedback: "You showed good alignment with company values and demonstrated enthusiasm for the role. Your collaborative mindset came through clearly."
//     }
//   },
//   strengths: [
//     {
//       category: "Technical Communication",
//       description: "Clear explanation of complex technical concepts",
//       evidence: "You effectively broke down algorithmic approaches and used practical examples",
//       impact: "This skill is crucial for mentoring team members and client interactions"
//     },
//     {
//       category: "Problem-Solving Mindset", 
//       description: "Systematic approach to challenges",
//       evidence: "You consistently asked clarifying questions and considered multiple angles",
//       impact: "Shows strong analytical thinking that's valuable for complex projects"
//     }
//   ],
//   developmentAreas: [
//     {
//       category: "Response Structure",
//       currentLevel: "Good content but needs better organization",
//       challenge: "Responses sometimes lacked clear structure and logical flow",
//       improvement: "Use the STAR method for behavioral questions and outline technical explanations",
//       practiceActivities: [
//         "Record yourself answering common interview questions",
//         "Practice 2-minute technical explanations with clear beginning, middle, and end"
//       ],
//       resources: [
//         "Practice behavioral questions using STAR method",
//         "Watch technical presentation skills videos"
//       ]
//     }
//   ],
//   behavioralInsights: {
//     leadershipPotential: {
//       level: "Good",
//       evidence: ["Mentioned taking initiative on projects", "Showed decision-making examples"],
//       developmentSuggestions: ["Prepare more specific leadership stories", "Focus on team impact examples"]
//     },
//     teamCollaboration: {
//       level: "Strong",
//       evidence: ["Multiple examples of successful team projects", "Emphasized communication"],
//       developmentSuggestions: ["Develop conflict resolution examples", "Show cross-functional collaboration"]
//     },
//     adaptability: {
//       level: "Good", 
//       evidence: ["Showed flexibility in approach", "Mentioned learning new technologies"],
//       developmentSuggestions: ["Prepare stories about overcoming major changes", "Highlight rapid learning examples"]
//     },
//     innovationMindset: {
//       level: "Developing",
//       evidence: ["Some creative problem-solving mentioned"],
//       developmentSuggestions: ["Develop more innovation examples", "Show creative solutions to business problems"]
//     }
//   },
//   actionPlan: {
//     immediate: {
//       title: "Next 1-2 Weeks",
//       actions: [
//         "Practice STAR method with 5 behavioral questions daily",
//         "Record and review technical explanations for clarity"
//       ]
//     },
//     shortTerm: {
//       title: "Next 1-3 Months",
//       actions: [
//         "Build portfolio of leadership and innovation examples",
//         "Practice mock interviews with peers or professionals"
//       ]
//     },
//     longTerm: {
//       title: "Next 3-6 Months", 
//       actions: [
//         "Develop public speaking skills through presentations or meetups",
//         "Take on leadership role in current position or side projects"
//       ]
//     }
//   },
//   interviewTips: [
//     {
//       category: "Preparation",
//       tip: "Research the company's recent projects and challenges", 
//       example: "When asked about company fit, reference specific company initiatives and explain how your skills address their needs"
//     },
//     {
//       category: "Communication",
//       tip: "Use the 'Rule of 3' - make 3 key points in longer answers",
//       example: "For 'tell me about yourself': 1) Current role highlights, 2) Key achievements, 3) Why you're interested in this position"
//     },
//     {
//       category: "Technical Discussion",
//       tip: "Always explain your thought process out loud",
//       example: "When solving problems, say 'First I'll consider the constraints, then explore approaches, then discuss trade-offs'"
//     }
//   ],
//   encouragement: "You demonstrated strong technical skills and genuine enthusiasm for the role. With some practice on structuring your responses and developing more leadership examples, you'll be an even stronger candidate. Your collaborative mindset and problem-solving approach are definite assets. Keep building on these strengths!"
// });


// Generate candidate feedback
router.post('/api/generate-candidate-feedback', async (req, res) => {
  try {
    const { conversationHistory, interviewData, duration } = req.body;

    // Validate input
    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({ 
        error: 'Conversation history is required for feedback generation' 
      });
    }

    console.log('Generating candidate feedback:', {
      conversationLength: conversationHistory.length,
      duration: duration,
      role: interviewData?.role
    });
    console.log(interviewData);

    let feedback;
    
    try {
      // Generate feedback using OpenAI
      feedback = await generateCandidateFeedback(conversationHistory, interviewData, duration);
      console.log('OpenAI feedback generated successfully');
    } catch (error) {
      console.warn('OpenAI feedback generation failed, using fallback:', error.message);
      // Use fallback feedback if OpenAI fails
      const questionsCount = conversationHistory.filter(entry => entry.type === 'user').length;
      // feedback = getFallbackFeedback(duration, questionsCount);
    }

    // Add metadata
    const enrichedFeedback = {
      ...feedback,
      metadata: {
        generatedAt: new Date().toISOString(),
        interviewDuration: duration,
        questionsAnswered: conversationHistory.filter(entry => entry.type === 'user').length,
        totalQuestions: conversationHistory.filter(entry => entry.type === 'ai').length,
        candidateName: interviewData?.candidateName || 'Candidate',
        role: interviewData?.role || 'Position',
        company: interviewData?.company || 'Company',
        analysisMethod: 'openai-gpt4'
      }
    };

    res.json({
      success: true,
      feedback: enrichedFeedback,
      message: 'Candidate feedback generated successfully'
    });

  } catch (error) {
    console.error('Error in feedback generation endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate candidate feedback',
      details: error.message 
    });
  }
});

// Health check for feedback system
router.get('/api/feedback-health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'candidate-feedback',
    ai_provider: 'openai',
    openai_configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});


// Interview status endpoint
router.get('/api/interview-status', (req, res) => {
  res.json({
    httpSessions: {
      currentQuestionIndex: conversationState.currentQuestionIndex,
      totalQuestions: conversationState.totalQuestions,
      responsesCount: conversationState.previousResponses.length,
      isComplete: conversationState.currentQuestionIndex >= conversationState.totalQuestions,
      waitingForResponse: conversationState.waitingForResponse
    },
    socketSessions: {
      activeCount: activeSocketInterviews.size,
      sessions: Array.from(activeSocketInterviews.keys())
    }
  });
});

// Reset interview endpoint
router.post('/api/reset-interview', (req, res) => {
  conversationState = {
    currentQuestionIndex: 0,
    totalQuestions: 5,
    previousResponses: [],
    interviewContext: '',
    isFirstQuestion: true,
    waitingForResponse: false
  };
  
  // Also clear socket sessions if requested
  if (req.body.clearSocketSessions) {
    activeSocketInterviews.clear();
  }
  
  res.json({ 
    success: true, 
    message: 'Interview reset successfully',
    socketsCleared: req.body.clearSocketSessions || false
  });
});

// Test endpoint for Socket.IO integration
router.get('/api/socket-test', (req, res) => {
  res.json({
    message: 'Socket.IO integration ready',
    activeSocketSessions: activeSocketInterviews.size,
    availableHandlers: Object.keys(socketHandlers),
    timestamp: new Date().toISOString()
  });
});

// Export both the router and socket handlers
module.exports = {
  router,
  socketHandlers
};