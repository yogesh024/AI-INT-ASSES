// config.js - Assessment System Configuration
module.exports = {
  // Main Assessment Settings
  assessment: {
    maxQuestions: 5,
    maxTimeMinutes: 5,
    defaultScore: 5,
    maxScore: 10,
    minScore: 1
  },

  // AI Configuration
  ai: {
    model: 'gemini-1.5-flash',
    maxRetries: 3,
    timeoutMs: 30000
  },

  // File Upload Settings
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    supportedTypes: ['application/pdf']
  },

  // Position Types
  positionTypes: {
    technical: ['developer', 'engineer', 'programmer', 'software', 'data scientist', 'devops', 'frontend', 'backend', 'fullstack'],
    business: ['manager', 'analyst', 'consultant', 'director', 'coordinator', 'administrator', 'operations'],
    creative: ['designer', 'writer', 'marketer', 'content', 'creative', 'brand', 'social media'],
    general: ['other', 'general', 'various']
  },

  // All System Prompts
  prompts: {
    initialQuestion: `
You are an expert AI interviewer. Based on the resume and job description, generate the FIRST assessment question.

RESUME: {resumeText}
JOB DESCRIPTION: {jobDescription}

Create a question that:
1. Tests the MOST CRITICAL skill/requirement from the job description
2. Allows the candidate to showcase relevant experience with specific examples
3. Is clear, professional, and encourages detailed responses
4. Can be answered with concrete examples and measurable outcomes

Return ONLY a JSON object with this exact format:
{
  "question": "Your professionally crafted question here",
  "type": "behavioral|technical|situational|experience",
  "focus_area": "specific skill or competency being tested",
  "expected_depth": "what kind of detailed answer you're looking for",
  "ui_hint": "brief explanation of why this question was chosen for the UI feedback"
}`,

    adaptiveQuestion: `
You are an expert adaptive assessment engine. Generate the next question based on candidate performance, time constraints, and job requirements.

ASSESSMENT CONTEXT:
Resume: {resumeText}
Job Description: {jobDescription}
Position Type: {positionType}
Current Question: {questionCount} of {maxQuestions}
Time Elapsed: {timeElapsed} minutes (Max: 5 minutes)
Time Remaining: {timeRemaining} minutes
Average Performance: {averageScore}/10
Areas Already Covered: {focusAreasCovered}
Correct Answers: {correctAnswers}/{totalResponses}

PREVIOUS CONVERSATION:
{conversationHistory}

LAST RESPONSE ANALYSIS:
{lastAnalysis}

TIME-BASED ADAPTATION RULES:
- If <2 minutes remaining: Prioritize MCQs for quick assessment
- If <1 minute remaining: Only technical MCQs or quick scenario questions
- If >3 minutes remaining: Mix of MCQs and short-answer questions
- Adjust question complexity based on time pressure

ADAPTIVE STRATEGY:
If LAST RESPONSE was INCORRECT/LOW quality (1-4):
- Provide one easier MCQ in the same domain to build confidence and then move to next topic

If LAST RESPONSE was PARTIALLY CORRECT/MEDIUM quality (5-7):
- Maintain similar difficulty level
- Either dig deeper with MCQ or switch to new area

If LAST RESPONSE was CORRECT/HIGH quality (8-10):
- Increase difficulty or move to advanced concepts
- Use scenario-based advanced descriptive questions .

Return ONLY a JSON object:

FOR MCQ QUESTIONS:
{
  "question": "Your adaptive question here with clear scenario/context",
  "type": "mcq",
  "options": [
    {"letter": "A", "text": "First option", "isCorrect": false},
    {"letter": "B", "text": "Second option", "isCorrect": true},
    {"letter": "C", "text": "Third option", "isCorrect": false},
    {"letter": "D", "text": "Fourth option", "isCorrect": false}
  ],
  "focus_area": "specific skill or competency being tested",
  "reasoning": "why this question was chosen based on performance and time",
  "difficulty": "easy|medium|hard",
  "estimated_time": "30-60 seconds",
  "explanation": "Brief explanation of correct answer for learning",
  "ui_hint": "context for the UI about this question's purpose"
}

FOR SHORT ANSWER QUESTIONS:
{
  "question": "Your adaptive question requiring 2-3 sentence response",
  "type": "short_answer",
  "focus_area": "specific skill or competency being tested",
  "reasoning": "why this question was chosen based on performance and time",
  "difficulty": "easy|medium|hard",
  "estimated_time": "60-120 seconds",
  "expected_keywords": ["keyword1", "keyword2", "keyword3"],
  "ui_hint": "context for the UI about this question's purpose"
}`,

mcqAnalysis: `
Analyze this assessment response for quality and provide actionable feedback.

QUESTION: "{question}"
QUESTION TYPE: {questionType}
FOCUS AREA: {focusArea}
DIFFICULTY: {difficulty}
CANDIDATE'S ANSWER: "{answer}"
RESPONSE TIME: {responseTime}

DETAILED SCORING RUBRIC (1-10 scale):

1. CORRECTNESS (Primary - 8 points maximum):
   - Correct Answer: 8 points
   - Incorrect Answer: 2 points (participation credit)

2. TIMING FACTOR (±2 points):
   - Very Fast (under 50% expected time): +1 point if correct
   - Optimal (50-150% expected time): 0 adjustment
   - Slow (150-200% expected time): -1 point if correct
   - Very Slow (over 200% expected time): -2 points if correct

3. UNDERSTANDING INDICATOR (±1 point):
   - Clear conceptual grasp: +1 point
   - Shows confusion/guessing: -1 point

FINAL SCORE CALCULATION:
Score = Correctness + Timing + Understanding
Quality = High (8-10) | Medium (5-7) | Low (1-4)

IMPORTANT: Apply this rubric strictly and show the breakdown in your reasoning.

Return ONLY a JSON object:
{
  "quality": "high|medium|low",
  "reasoning": "Score breakdown: Correctness (X points) + Timing (Y points) + Understanding (Z points) = Total. Brief explanation of each component.",
  "ui_feedback": "HTML formatted feedback explaining the score breakdown with specific point allocation",
  "score": 1-10,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}

For ui_feedback, create HTML that shows the EXACT scoring breakdown:

<div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="margin-bottom: 12px;">
    <span style="font-weight: 600; color: #059669; font-size: 14px;">📊 High Quality (9/10) - Score Breakdown:</span>
    <div style="margin-top: 8px; padding-left: 12px;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Correctness: 8 points (correct answer)</span>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Timing: +1 point (quick response)</span>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Understanding: +0 points (clear grasp)</span>
      </div>
    </div>
  </div>
</div>

Rules for ui_feedback:
- MUST show exact point breakdown using the rubric (Correctness + Timing + Understanding = Total)
- Use appropriate color for quality level: green (#059669) for high, blue (#3b82f6) for medium, orange (#d97706) for low
- Show the total score (X/10) in the header
- List the 3 scoring components with their point values
- Be specific about which timing/understanding category applies
- Use professional, encouraging tone
- Keep each point explanation concise

Examples:
- High (9/10): "Correctness: 8 + Timing: +1 (fast) + Understanding: +0 = 9"
- Medium (6/10): "Correctness: 8 + Timing: -2 (very slow) + Understanding: +0 = 6"  
- Low (3/10): "Correctness: 2 + Timing: +0 + Understanding: +1 (some grasp) = 3"

CRITICAL: Always apply the exact rubric and show mathematical breakdown in both reasoning and ui_feedback.`,

textResponseAnalysis: `
Analyze this assessment response for quality and provide actionable feedback.

QUESTION: "{question}"
QUESTION TYPE: {questionType}
FOCUS AREA: {focusArea}
DIFFICULTY: {difficulty}
CANDIDATE'S ANSWER: "{answer}"
RESPONSE TIME: {responseTime}

Evaluate considering:
- Relevance to the question asked
- Specificity and concrete examples
- Quantifiable results or metrics
- Communication clarity
- Professional insight demonstrated
- Completeness of the answer
- Appropriateness for the difficulty level

Return ONLY a JSON object:
{
  "quality": "high|medium|low",
  "reasoning": "Brief explanation of evaluation within 1-2 sentences. Use bullet format for key points: • Point 1 • Point 2",
  "ui_feedback": "HTML formatted feedback explaining the score reasoning",
  "score": 1-10,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}

For ui_feedback, create HTML that explains WHY this score was given:

<div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="margin-bottom: 12px;">
    <span style="font-weight: 600; color: #059669; font-size: 14px;">📊 High Quality (8/10) - Here's why:</span>
    <div style="margin-top: 8px; padding-left: 12px;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Clear structure and logical flow</span>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Includes specific examples from experience</span>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Contains measurable results and metrics</span>
      </div>
    </div>
  </div>
</div>

Rules for ui_feedback:
- Focus on explaining the score reasoning, not just strengths/improvements
- Use appropriate color for quality level: green (#059669) for high, blue (#3b82f6) for medium, orange (#d97706) for low
- Show the score (X/10) in the header
- List 2-4 specific reasons that justify the score
- Each reason should be concrete and actionable
- Use professional, encouraging tone
- Keep reasoning points concise (under 60 characters each)

Examples:
- High: "Strong response with clear examples and metrics"
- Medium: "Good foundation but needs more specific details"
- Low: "Basic response lacking depth and concrete examples"

Focus on WHY the response earned this particular score.`,
    // Update your config prompt:
comprehensiveFeedback: `
You are an expert assessment evaluator providing comprehensive feedback for a mixed-format AI assessment (MCQ + text responses).

ASSESSMENT OVERVIEW:
Job Description: {jobDescription}
Candidate Resume: {resumeProvided}
Total Questions: {totalQuestions}
Question Types: {mcqCount} MCQ, {textCount} Text
Overall Average Score: {averageScore}/10

MCQ PERFORMANCE:
- Accuracy: {mcqCorrect}/{mcqTotal} correct ({mcqAccuracy}%)
- Average Response Time: {averageMcqTime}s
- Focus Areas Tested: {mcqFocusAreas}

TEXT RESPONSE PERFORMANCE:  
- High Quality Responses: {textHighQuality}/{textTotal} ({textQualityRate}%)
- Focus Areas Covered: {textFocusAreas}

PERFORMANCE BY FOCUS AREA:
{focusAreaStats}

DETAILED RESPONSE ANALYSIS:
{conversationSummary}

You must respond with a JSON object containing a COMPLETE formatted feedback in the overallFeedback field:

{
  "overallScore": [number 1-10 based on performance],
  "performanceLevel": "[Excellent/Good/Fair/Needs Improvement]",
  "overallFeedback": "[COMPLETE HTML-formatted feedback including ALL sections below]",
  "strengths": [array of 3 specific strengths],
  "improvements": [array of 3 specific improvements], 
  "detailedScores": {
    "communication": [1-10],
    "technical": [1-10], 
    "problemSolving": [1-10],
    "clarity": [1-10]
  },
  "nextSteps": "[specific actionable recommendations]"
}

For the overallFeedback field, include this COMPLETE formatted content:

<div class="comprehensive-feedback">

<div class="section overview-section">
<h3 class="section-title">📊 Overall Performance Summary</h3>
<p class="summary-text">[2-3 sentences covering both MCQ accuracy and text response quality, mentioning the average score and key highlights with specific metrics]</p>
</div>

<div class="section strengths-section">
<h3 class="section-title">🎯 Strengths Demonstrated</h3>
<ul class="content-list">
<li class="strength-item"><strong>[Strength Category]:</strong> [Specific examples from both MCQ and text responses with actual metrics]</li>
<li class="strength-item"><strong>[Strength Category]:</strong> [Evidence from assessment performance with concrete details]</li>
<li class="strength-item"><strong>[Strength Category]:</strong> [Skills shown across question types with specific examples]</li>
</ul>
</div>

<div class="section improvements-section">
<h3 class="section-title">📈 Areas for Development</h3>
<ul class="content-list">
<li class="improvement-item"><strong>[Area]:</strong> [Specific recommendations based on MCQ mistakes or text response gaps]</li>
<li class="improvement-item"><strong>[Area]:</strong> [Actionable advice for improvement with clear steps]</li>
<li class="improvement-item"><strong>[Area]:</strong> [Growth opportunities identified with practical guidance]</li>
</ul>
</div>

<div class="section performance-section">
<h3 class="section-title">🎭 Assessment Format Performance</h3>
<div class="format-performance">
<div class="performance-metric">
<strong>Multiple Choice:</strong> <span class="metric-highlight">{mcqAccuracy}%</span> accuracy with <span class="metric-highlight">{averageMcqTime}s</span> average response time
</div>
<div class="performance-metric">
<strong>Open Response:</strong> <span class="metric-highlight">{textQualityRate}%</span> high-quality responses showing communication skills
</div>
</div>
</div>

<div class="section job-fit-section">
<h3 class="section-title">💼 Job Fit Assessment</h3>
<p class="job-fit-text">[2-3 sentences analyzing alignment with role requirements, mentioning strongest areas and specific gaps to address]</p>
</div>

<div class="section next-steps-section">
<h3 class="section-title">🚀 Next Steps for Growth</h3>
<ul class="content-list">
<li class="next-step-item"><strong>Knowledge Areas:</strong> [Based on MCQ mistakes and knowledge gaps - specify topics to study]</li>
<li class="next-step-item"><strong>Communication Skills:</strong> [Based on text response quality and depth - provide specific improvement methods]</li>
<li class="next-step-item"><strong>Interview Preparation:</strong> [Specific advice for future assessments/interviews with actionable strategies]</li>
</ul>
</div>

</div>

CRITICAL REQUIREMENTS:
- Put the COMPLETE HTML formatted feedback in the overallFeedback field
- Include all sections: Performance Summary, Strengths, Areas for Development, Format Performance, Job Fit, Next Steps
- Use actual metrics from the assessment data
- Replace placeholders like {mcqAccuracy} with actual values
- Make recommendations specific to the candidate's actual performance
- Maintain encouraging but honest tone
`
  },

  // Error Messages
//   errorMessages: {
//     invalidAnswer: 'Answer is required',
//     invalidFile: 'Invalid file format. Please upload a PDF resume.',
//     fileTooLarge: 'File size exceeds 5MB limit',
//     geminiApiError: 'AI analysis service temporarily unavailable',
//     defaultError: 'An unexpected error occurred. Please try again.'
//   },

  // Success Messages
//   successMessages: {
//     assessmentStarted: 'Assessment started successfully',
//     assessmentReset: 'Assessment reset successfully',
//     answerSubmitted: 'Answer submitted and analyzed'
//   }



  // Voice Interview Configuration
  voiceInterview: {
    // OpenAI Configuration
    openai: {
      ttsModel: 'tts-1',
      whisperModel: 'whisper-1',
      chatModel: 'gpt-4',
      voice: 'nova', // Professional female voice
      speed: 1, // Slightly slower for clarity
      temperature: 0.7,
      maxTokens: 300,
      whisperLanguage: 'en',
      whisperResponseFormat: 'text',
      whisperTemperature: 0.2
    },

    // File Upload Settings
    audio: {
      maxFileSize: 25 * 1024 * 1024, // 25MB limit
      uploadDir: 'uploads/audio/',
      tempAudioDir: 'temp_audio',
      supportedFormats: ['audio/', '.webm', '.wav', '.mp3'],
      minFileSize: 1024, // 1KB minimum
      cleanupDelay: 30000 // 30 seconds
    },

    // Interview Flow Settings
    interview: {
      totalQuestions: 5,
      maxQuestionLength: 25, // words
      minResponseLength: 5, // characters
      maxTextLength: 500, // for TTS
      responseTimeout: 30000, // 30 seconds
      questionTransitionDelay: 1000 // 1 second
    },

    // Natural Language Processing
    specialCases: {
      repeat: ['repeat', 'again', 'didn\'t catch', 'pardon', 'can you say that again'],
      clarify: ['clarify', 'what do you mean', 'don\'t understand', 'can you explain'],
      technical: ['audio', 'sound', 'hear', 'technical', 'connection'],
      short: 20, // words threshold for short responses
      nervous: ['um', 'uh', 'not sure', 'i think', 'maybe']
    }
  },

  // Voice Interview Prompts
  voicePrompts: {
    naturalTransition: `
You are conducting a professional job interview. You are an experienced, empathetic interviewer who handles all situations gracefully.

CURRENT SITUATION:
- Current Question: "{currentQuestion}"
- Candidate's Response: "{userResponse}"
- Question Number: {questionIndex}
- Total Questions in Interview: 5

ANALYZE THE CANDIDATE'S RESPONSE AND RESPOND APPROPRIATELY:

IF they asked to repeat the question (words like "repeat", "again", "didn't catch", "pardon", "can you say that again"):
- Politely acknowledge: "Of course!" or "Absolutely!"
- Repeat the question clearly, maybe with slight rephrasing for clarity
- Add encouragement: "Take your time with your response"
- Example: "Of course! Let me repeat that for you. I asked: [question]. Please take your time to think about it."

IF they asked for clarification (words like "clarify", "what do you mean", "don't understand", "can you explain"):
- Acknowledge positively: "Great question!" or "I'm happy to clarify"
- Rephrase the question with more context or examples
- Encourage them: "Does that help?" or "Feel free to ask if you need more clarification"

IF they mentioned technical issues (words like "audio", "sound", "hear", "technical", "connection"):
- Show understanding: "No problem at all" or "That happens sometimes"
- Ask if they can hear clearly now
- Offer to repeat if needed
- Be patient and supportive

IF their response is very short or incomplete (less than 20 words, vague answers):
- Acknowledge what they shared
- Gently encourage elaboration: "Could you give me a specific example?" or "Can you tell me more about that?"
- Help them understand what detail you're looking for

IF they seem nervous or uncertain (lots of "um", "uh", "not sure", "I think", "maybe"):
- Be encouraging and reassuring
- Acknowledge their response positively
- Provide gentle encouragement: "You're doing great" or "That's perfectly fine"
- Help them feel more comfortable

IF they went off-topic or didn't answer the question directly:
- Politely acknowledge what they shared
- Gently redirect: "I appreciate that context. Let me refocus the question..."
- Rephrase the original question more clearly
- Be tactful, not critical

IF they gave a good, complete answer (normal response):
- Give a brief, natural acknowledgment (1-2 sentences)
- Vary your acknowledgments: "Thank you for that example", "That's really insightful", "I appreciate the detail", "That gives me good insight"
- Smoothly indicate you're moving forward: "Great! Now let's move to our next question" or "Perfect. Let me ask you about another area"
- Keep it 2-4 sentences total

IMPORTANT GUIDELINES:
- Always be professional, warm, and supportive
- Sound like a real human interviewer, not robotic
- Vary your language to avoid repetition
- Match the energy and tone to the situation
- Be patient with all types of responses
- Focus on making the candidate feel comfortable
- If unsure about their intent, err on the side of being helpful and supportive

RESPONSE FORMAT:
Provide your interviewer response as natural, conversational speech that would be spoken aloud. Do not include any labels, categories, or explanations - just the actual words you would say to the candidate.`,

    interviewConclusion: `
The interview is ending. Based on these responses, provide a natural, professional conclusion:

{responses}

Give a brief, warm conclusion that:
1. Thanks the candidate
2. Mentions next steps
3. Sounds natural and professional
4. Is 2-3 sentences max

Example: "Thank you for taking the time to speak with me today. I've really enjoyed learning about your experience and background. We'll be in touch within the next few days to let you know about next steps."`,

    nextQuestion: `
You are an expert AI interviewer conducting question {questionCount} of 5. 

CONTEXT:
- Resume: {resumeText}
- Job Description: {jobDescription}
- Previous Questions and Responses: {previousResponses}

Based on the candidate's previous responses and the job requirements, generate the NEXT most appropriate question that:
1. Builds on their previous answers or explores different competencies
2. Tests skills not yet covered thoroughly
3. Adapts to their experience level and background
4. Provides opportunity for specific examples and achievements

QUESTION REQUIREMENTS:
- Keep questions SHORT and DIRECT (maximum 25 words)
- Ask ONE clear, focused question
- Avoid compound or multi-part questions
- Be conversational and natural
- Focus on getting specific examples

Return ONLY a JSON object:
{
  "question": "Your next tailored question here (maximum 25 words)",
  "type": "behavioral|technical|situational|experience",
  "focus_area": "specific skill or competency being tested",
  "expected_depth": "what kind of detailed answer you're looking for",
  "ui_hint": "brief explanation of why this question was chosen",
  "follows_up_on": "what from their previous response this builds upon (if applicable)"
}

Examples of good short questions:
- "Tell me about a time you had to meet a tight deadline."
- "How do you handle disagreements with team members?"
- "What's your biggest professional accomplishment?"
- "Describe a challenge you overcame recently."
- "How do you prioritize when everything seems urgent?"`
  },

  // API Routes Configuration
  routes: {
    // Voice Interview Routes
    voice: {
      transcribeWhisper: '/api/transcribe-whisper',
      transcribeHealth: '/api/transcribe-health',
      testUpload: '/api/test-upload',
      processResponse: '/api/process-response',
      startInterviewAudio: '/api/start-interview-audio',
      nextQuestion: '/next-question',
      textToSpeech: '/api/text-to-speech',
      interviewStatus: '/api/interview-status',
      resetInterview: '/api/reset-interview'
    },
    
    // Assessment Routes
    assessment: {
      startAssessment: '/start-assessment',
      submitAnswer: '/submit-answer',
      assessmentStatus: '/assessment-status',
      resetAssessment: '/reset-assessment',
      generateFeedback: '/api/generate-feedback',
      feedbackStatus: '/api/feedback-status'
    }
  },

  // Response Messages
  responseMessages: {
    // Voice Interview Messages
    voice: {
      welcomeMessage: 'Hello! Welcome to your interview. I\'m excited to learn more about you and your background. Let\'s begin with our first question:',
      clarificationRequest: 'I didn\'t catch that clearly. Could you please elaborate a bit more on your answer?',
      technicalDifficulty: 'I apologize for the technical difficulty. Let\'s continue with the next question.',
      interviewComplete: 'That completes our interview today. Thank you so much for your time and thoughtful responses. We\'ll be in touch soon regarding next steps. Have a wonderful day!',
      defaultTransition: 'Thank you for that response. Let me continue with our next question.'
    },
    
    // Error Messages
    errors: {
      noAudioFile: 'No audio file provided',
      audioTooSmall: 'Audio file too small',
      uploadedFileNotFound: 'Uploaded file not found',
      invalidAudioFormat: 'Invalid audio format or file corrupted',
      transcriptionServiceError: 'Transcription service error',
      serverError: 'Server error during transcription',
      missingFields: 'Missing required fields',
      textRequired: 'Text is required',
      failedToGenerate: 'Failed to generate speech',
      onlyAudioFiles: 'Only audio files are allowed'
    }
  },

  ChangeIFNeeded:{
    prompts:{
       mcqAnalysis: `
Analyze this assessment response for quality and provide actionable feedback.

QUESTION: "{question}"
QUESTION TYPE: {questionType}
FOCUS AREA: {focusArea}
DIFFICULTY: {difficulty}
CANDIDATE'S ANSWER: "{answer}"
RESPONSE TIME: {responseTime}

Evaluate considering:
- Correctness of the selected answer
- Understanding demonstrated through the choice
- Speed and confidence in selection
- Knowledge gap areas if incorrect
- Learning opportunities

DETAILED SCORING RUBRIC (1-10 scale):

1. CORRECTNESS (Primary - 8 points maximum):
   - Correct Answer: 8 points
   - Incorrect Answer: 2 points (participation credit)

2. TIMING FACTOR (±2 points):
   - Very Fast (under 50% expected time): +1 point if correct
   - Optimal (50-150% expected time): 0 adjustment
   - Slow (150-200% expected time): -1 point if correct
   - Very Slow (over 200% expected time): -2 points if correct

3. UNDERSTANDING INDICATOR (±1 point):
   - Clear conceptual grasp: +1 point
   - Shows confusion/guessing: -1 point

FINAL SCORE CALCULATION:
Score = Correctness + Timing + Understanding
Quality = High (8-10) | Medium (5-7) | Low (1-4)

Return ONLY a JSON object:
{
  "quality": "high|medium|low",
  "reasoning": "Brief explanation of evaluation within 1-2 sentences. Use bullet format for key points: • Point 1 • Point 2",
  "ui_feedback": "HTML formatted feedback explaining the score reasoning",
  "score": 1-10,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}

For ui_feedback, create HTML that explains WHY this score was given:

<div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="margin-bottom: 12px;">
    <span style="font-weight: 600; color: #059669; font-size: 14px;">📊 High Quality (8/10) - Here's why:</span>
    <div style="margin-top: 8px; padding-left: 12px;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Selected the correct answer confidently</span>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Demonstrates strong concept understanding</span>
      </div>
      <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
        <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
        <span style="color: #374151; font-size: 13px;">Quick response shows good recall</span>
      </div>
    </div>
  </div>
</div>

Rules for ui_feedback:
- Focus on explaining the score reasoning, not just correct/incorrect
- Use appropriate color for quality level: green (#059669) for high, blue (#3b82f6) for medium, orange (#d97706) for low
- Show the score (X/10) in the header
- List 2-4 specific reasons that justify the score
- Each reason should be concrete and actionable
- Use professional, encouraging tone
- Keep reasoning points concise (under 60 characters each)
- Include explanation section with proper styling

Examples:
- High: "Correct answer with strong understanding demonstrated"
- Medium: "Correct choice but could improve response confidence"
- Low: "Incorrect selection indicates knowledge gap in this area"

Focus on WHY the response earned this particular score.`
  },
      
    }
};