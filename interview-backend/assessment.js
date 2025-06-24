const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const {OpenAI} = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');
 // Assuming config.js is in the same directory
const fs = require('fs');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); 

// Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store current assessment session 
let currentAssessment = {
  resumeText: '',
  jobDescription: '',
  currentQuestion: null,
  questionCount: 0,
  maxQuestions: 5,
  responses: [],
  assessmentContext: '',
  candidateProfile: '',
  finished: false
};

// const callGeminiAPI = async (prompt) => {
//   try {
//     const result = await model.generateContent(prompt);
//     return result.response.text().trim();
//   } catch (error) {
//     console.error('Gemini API call failed:', error);
//     throw error;
//   }
// };
// OpenAI API call wrapper with enhanced error handling
const callOpenAIAPI = async (prompt, options = {}) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview assessment system. Always respond with structured JSON when requested. Maintain consistency and accuracy in your evaluations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1500,
      response_format: options.json_mode ? { type: "json_object" } : undefined
    });
        return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
};

// Utility function to parse time strings like "30-60 seconds" to seconds
const parseTimeToSeconds = (timeString) => {
  const match = timeString.match(/(\d+)(?:-(\d+))?\s*seconds?/);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    return (min + max) / 2; // Average of range
  }
  return 60; // Default fallback
};

// Enhanced LLM analysis for MCQs with score reasoning - PRIMARY METHOD
const getLLMAnalysisForMCQ = async (question, selectedOption, correctOption, isCorrect, score, timeBonus) => {
  const prompt = config.prompts.mcqAnalysis
    .replace('{question}', question.question)
    .replace('{questionType}', 'mcq')
    .replace('{focusArea}', question.focus_area)
    .replace('{difficulty}', question.difficulty)
    .replace('{answer}', `Selected: ${selectedOption.letter}) ${selectedOption.text}`)
    .replace('{responseTime}', timeBonus || 'Standard timing')
    .replace('{selectedOption}', selectedOption.letter)
    .replace('{selectedText}', selectedOption.text)
    .replace('{correctOption}', correctOption.letter)
    .replace('{correctText}', correctOption.text)
    .replace('{isCorrect}', isCorrect ? 'Correct' : 'Incorrect')
    .replace('{score}', score);

  try {
    const result = await callOpenAIAPI(prompt, { json_mode: true });
    const analysis = JSON.parse(result);
    
    // Ensure we have ui_feedback, if not create fallback
    if (!analysis.ui_feedback) {
      analysis.ui_feedback = createFallbackMCQFeedback(isCorrect, score, selectedOption, correctOption, question.explanation);
    }
    return analysis;
  } catch (error) {
    console.error('LLM MCQ analysis failed:', error);
    // Return fallback analysis
    return createFallbackAnalysis(isCorrect, score, selectedOption, correctOption, question.explanation, timeBonus);
  }
};
// Fallback analysis when LLM fails
const createFallbackAnalysis = (isCorrect, score, selectedOption, correctOption, explanation, timeBonus) => {
  let quality = 'medium';
  if (isCorrect && score >= 8) quality = 'high';
  else if (score <= 4) quality = 'low';

  let reasoning = `Selected ${selectedOption.letter}, correct answer was ${correctOption.letter}. `;
  if (isCorrect) {
    reasoning += 'Demonstrates good understanding of the concept.';
  } else {
    reasoning += 'Review the explanation to strengthen knowledge in this area.';
  }

  const ui_feedback = createFallbackMCQFeedback(isCorrect, score, selectedOption, correctOption, explanation, quality, timeBonus);

  return {
    quality,
    reasoning,
    ui_feedback,
    score,
    strengths: isCorrect ? ['Correct answer selected'] : [],
    improvements: !isCorrect ? ['Review concept understanding', 'Study the explanation'] : []
  };
};

// Fallback HTML generation when LLM doesn't provide ui_feedback
const createFallbackMCQFeedback = (isCorrect, score, selectedOption, correctOption, explanation, quality = 'medium', timeBonus = '') => {
  let reasoningPoints = [];
  let headerColor = '#3b82f6';
  let qualityText = 'Medium Performance';
  
  // Determine quality-based styling and reasoning
  if (quality === 'high') {
    headerColor = '#059669';
    qualityText = 'Excellent Performance';
    reasoningPoints.push('Selected the correct answer');
    if (timeBonus === 'Quick and accurate response') {
      reasoningPoints.push('Quick response demonstrates confidence');
    }
    reasoningPoints.push('Shows strong understanding of the concept');
  } else if (quality === 'low') {
    headerColor = '#d97706';
    qualityText = 'Needs Improvement';
    reasoningPoints.push(`Selected ${selectedOption.letter}, correct was ${correctOption.letter}`);
    reasoningPoints.push('Knowledge gap identified in this area');
    if (timeBonus) {
      reasoningPoints.push('Review concepts for better understanding');
    }
  } else {
    // Medium quality
    if (isCorrect) {
      reasoningPoints.push('Correct answer selected');
      if (timeBonus && timeBonus.includes('reviewing')) {
        reasoningPoints.push('Could improve response timing');
      }
      reasoningPoints.push('Good grasp of the fundamentals');
    } else {
      reasoningPoints.push(`Selected ${selectedOption.letter}, correct was ${correctOption.letter}`);
      reasoningPoints.push('Partial understanding demonstrated');
    }
  }
  
  // Create bullet points with proper HTML formatting
  const reasoningBullets = reasoningPoints.map(reason => 
    `<div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
      <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
      <span style="color: #374151; font-size: 13px;">${reason}</span>
    </div>`
  ).join('');
  
  // Add explanation section if available
  let explanationSection = '';
  if (explanation) {
    explanationSection = `
      <div style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 3px solid ${headerColor};">
        <span style="font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          📝 Explanation:
        </span>
        <div style="color: #4b5563; font-size: 13px; margin-top: 6px; line-height: 1.5;">
          ${explanation}
        </div>
      </div>`;
  }
  
  return `
    <div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="margin-bottom: 12px;">
        <span style="font-weight: 600; color: ${headerColor}; font-size: 14px;">
          📊 ${qualityText} (${score}/10) - Here's why:
        </span>
        <div style="margin-top: 8px; padding-left: 12px;">
          ${reasoningBullets}
        </div>
      </div>
      ${explanationSection}
    </div>`;
};

// MCQ-specific evaluation with enhanced UI feedback
const analyzeMCQResponse = async (question, selectedLetter, responseTime) => {
  // Add validation for question parameter
  if (!question) {
    console.error('analyzeMCQResponse: question parameter is null or undefined');
    return {
      error: true,
      isCorrect: false,
      score: 0,
      quality: 'invalid',
      reasoning: 'Question data missing',
      ui_feedback: '<div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;"><span style="color: #dc2626; font-weight: 600;">❌ Error</span><br/><span style="color: #6b7280; font-size: 13px;">Question data is missing</span></div>',
      analysisType: 'mcq'
    };
  }

  // Find the selected option
  const selectedOption = question.options?.find(opt => opt.letter === selectedLetter);
  const correctOption = question.options?.find(opt => opt.isCorrect);
  
  // Basic validation
  if (!selectedOption) {
    return {
      isCorrect: false,
      score: 0,
      quality: 'invalid',
      reasoning: 'Invalid option selected',
      ui_feedback: `
        <div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #dc2626; font-size: 14px;">
              ❌ Invalid Selection (0/10) - Here's why:
            </span>
            <div style="margin-top: 8px; padding-left: 12px;">
              <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
                <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
                <span style="color: #374151; font-size: 13px;">No valid option was selected</span>
              </div>
              <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
                <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
                <span style="color: #374151; font-size: 13px;">Please choose from the available options</span>
              </div>
            </div>
          </div>
        </div>`,
      selectedOption: selectedLetter,
      correctOption: correctOption?.letter,
      explanation: question.explanation || 'No explanation provided',
      responseTime: responseTime,
      analysisType: 'mcq'
    };
  }
  
  const isCorrect = selectedOption.isCorrect;
  
  // Score calculation for MCQ
  let score = isCorrect ? 8 : 2; // Base score: 8 for correct, 2 for attempt
  let timeBonus = '';
  
  // Time-based bonus/penalty
  if (responseTime && question.estimated_time) {
    const expectedTimeSeconds = parseTimeToSeconds(question.estimated_time);
    const timeFactor = responseTime / expectedTimeSeconds;
    
    if (isCorrect) {
      // Bonus for quick correct answers, penalty for very slow ones
      if (timeFactor < 0.5) {
        score = Math.min(10, score + 1);
        timeBonus = 'Quick and accurate response';
      } else if (timeFactor > 2) {
        score = Math.max(5, score - 1);
        timeBonus = 'Consider reviewing concepts for faster recall';
      }
    }
  }
  
  // Quality determination
  let quality = 'medium';
  if (isCorrect && score >= 8) quality = 'high';
  else if (isCorrect && score >= 6) quality = 'medium';
  else quality = 'low';
  
  // Generate HTML formatted feedback using LLM FIRST
  let ui_feedback;
  let analysisResult;

  // Always try LLM analysis first for better reasoning
  try {
    analysisResult = await getLLMAnalysisForMCQ(question, selectedOption, correctOption, isCorrect, score, timeBonus);
    ui_feedback = analysisResult.ui_feedback;
    
    // Update quality and reasoning from LLM if available
    if (analysisResult.quality) {
      quality = analysisResult.quality;
    }
    
  } catch (error) {
    console.error('LLM analysis failed, using fallback:', error);
    // Fallback to basic reasoning if LLM fails
    analysisResult = createFallbackAnalysis(isCorrect, score, selectedOption, correctOption, question.explanation, timeBonus);
    ui_feedback = analysisResult.ui_feedback;
  }
  
  return {
    isCorrect,
    score: Math.round(score),
    quality,
    reasoning: analysisResult?.reasoning || `MCQ: Selected ${selectedLetter}, correct answer was ${correctOption?.letter}`,
    ui_feedback,
    selectedOption: selectedLetter,
    correctOption: correctOption?.letter,
    explanation: question.explanation,
    responseTime: responseTime,
    timeTaken: responseTime ? `${responseTime}s` : 'Not measured',
    analysisType: 'mcq',
    difficulty: question.difficulty,
    focus_area: question.focus_area
  };
};

// Enhanced text response evaluation
const analyzeTextResponse = async (question, answer, responseTime) => {
  // Add validation for null/undefined inputs
  if (!question || !answer) {
    console.error('analyzeTextResponse: Missing required parameters');
    return {
      error: true,
      length: 0,
      score: 0,
      quality: 'low',
      ui_feedback: '<div style="color: #dc2626;">❌ Unable to analyze - missing data</div>',
      analysisType: 'text'
    };
  }

  const answerLength = answer.trim().split(' ').length;
  const hasExamples = /\b(example|instance|experience|project|when i|i worked|i led|for example)\b/i.test(answer);
  const hasMetrics = /\d+/.test(answer) && /\b(percent|%|increase|decrease|improved|reduced|saved|revenue|cost)\b/i.test(answer);
  
  const isDetailed = answerLength > 30;
  const isVague = answerLength < 15;
  
  try {
    // Ensure question properties exist with defaults
    const questionData = {
      question: question.question || 'Unknown question',
      type: question.type || 'text',
      focus_area: question.focus_area || 'General',
      difficulty: question.difficulty || 'Medium'
    };

    // Enhanced prompt using config
    const analysisPrompt = config.prompts.textResponseAnalysis
      .replace('{question}', questionData.question)
      .replace('{questionType}', questionData.type)
      .replace('{focusArea}', questionData.focus_area)
      .replace('{difficulty}', questionData.difficulty)
      .replace('{answer}', answer)
      .replace('{responseTime}', responseTime ? `${responseTime} seconds` : 'Not measured');

    const llmResponse = await callOpenAIAPI(analysisPrompt);
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const llmAnalysis = JSON.parse(jsonMatch[0]);
      
      return {
        length: answerLength,
        hasExamples,
        hasMetrics,
        isDetailed,
        isVague,
        isCorrect: null, // Not applicable for text responses
        quality: llmAnalysis.quality || 'medium',
        reasoning: llmAnalysis.reasoning || 'Analysis completed',
        ui_feedback: llmAnalysis.ui_feedback || 'Response analyzed',
        score: llmAnalysis.score || 5,
        strengths: llmAnalysis.strengths || [],
        improvements: llmAnalysis.improvements || [],
        responseTime: responseTime,
        timeTaken: responseTime ? `${responseTime}s` : 'Not measured',
        analysisType: 'text'
      };
    }
    
    throw new Error('Invalid LLM response format');
    
  } catch (error) {
    console.error('LLM Analysis failed:', error);
    
    // Enhanced fallback with time consideration
    let score = 5;
    let quality = 'medium';
    const strengths = [];
    const improvements = [];
    
    if (hasExamples) { score += 1; strengths.push('Includes specific examples'); }
    if (hasMetrics) { score += 1; strengths.push('Contains quantifiable results'); }
    if (isDetailed) { score += 1; strengths.push('Comprehensive response'); }
    if (isVague) { score -= 2; improvements.push('Provide more detailed responses'); }
    
    // Time-based adjustments
    if (responseTime && question.estimated_time) {
      const parseTimeToSeconds = (timeString) => {
        const match = timeString.match(/(\d+)(?:-(\d+))?\s*seconds?/);
        if (match) {
          const min = parseInt(match[1]);
          const max = match[2] ? parseInt(match[2]) : min;
          return (min + max) / 2; // Average of range
        }
        return 60; // Default fallback
      };
      
      const expectedTime = parseTimeToSeconds(question.estimated_time);
      if (responseTime < expectedTime * 0.3) {
        improvements.push('Take more time to provide thorough answers');
      }
    }
    
    score = Math.max(1, Math.min(10, score));
    
    if (score >= 8) quality = 'high';
    else if (score <= 4) quality = 'low';
    
    if (!hasExamples) improvements.push('Include specific examples');
    if (!hasMetrics) improvements.push('Add quantifiable achievements');
    
    // Create HTML formatted UI feedback for fallback - focusing on score reasoning
    const createHTMLFeedback = (strengths, improvements, quality, score) => {
      // Create reasoning based on quality and score
      let reasoningPoints = [];
      
      if (quality === 'high') {
        reasoningPoints.push('Strong response with good structure and content');
        if (strengths.includes('Includes specific examples')) {
          reasoningPoints.push('Effective use of concrete examples');
        }
        if (strengths.includes('Contains quantifiable results')) {
          reasoningPoints.push('Includes measurable outcomes and metrics');
        }
        if (strengths.includes('Comprehensive response')) {
          reasoningPoints.push('Thorough and detailed explanation');
        }
      } else if (quality === 'low') {
        reasoningPoints.push('Response needs significant improvement');
        if (improvements.includes('Provide more detailed responses')) {
          reasoningPoints.push('Answer lacks sufficient detail and depth');
        }
        if (improvements.includes('Include specific examples')) {
          reasoningPoints.push('Missing concrete examples from experience');
        }
        if (improvements.includes('Add quantifiable achievements')) {
          reasoningPoints.push('No measurable results or metrics provided');
        }
      } else {
        reasoningPoints.push('Decent response with room for enhancement');
        if (improvements.includes('Include specific examples')) {
          reasoningPoints.push('Could benefit from more concrete examples');
        }
        if (improvements.includes('Add quantifiable achievements')) {
          reasoningPoints.push('Adding metrics would strengthen the response');
        }
        if (strengths.length > 0) {
          reasoningPoints.push('Shows good understanding of the topic');
        }
      }
      
      // Create bullet points for reasoning
      const reasoningBullets = reasoningPoints.map(reason => 
        `<div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
          <span style="color: #3b82f6; margin-right: 8px; font-weight: bold;">•</span>
          <span style="color: #374151; font-size: 13px;">${reason}</span>
        </div>`
      ).join('');
      
      // Quality-based header color
      let headerColor = '#3b82f6';
      let qualityText = 'Medium Quality';
      if (quality === 'high') {
        headerColor = '#059669';
        qualityText = 'High Quality';
      } else if (quality === 'low') {
        headerColor = '#d97706';
        qualityText = 'Needs Improvement';
      }
      
      return `
        <div style="line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: ${headerColor}; font-size: 14px;">
              📊 ${qualityText} (${score}/10) - Here's why:
            </span>
            <div style="margin-top: 8px; padding-left: 12px;">
              ${reasoningBullets}
            </div>
          </div>
        </div>`;
    };
    
    return {
      length: answerLength,
      hasExamples,
      hasMetrics,
      isDetailed,
      isVague,
      isCorrect: null,
      score,
      quality,
      strengths,
      improvements,
      reasoning: 'Fallback analysis based on content patterns',
      ui_feedback: createHTMLFeedback(strengths, improvements, quality, score),
      responseTime: responseTime,
      analysisType: 'text'
    };
  }
};

// Analyze response quality with validation
const analyzeResponse = async (question, answer, responseTime = null) => {
  // Validate inputs
  if (!question) {
    console.error('analyzeResponse: question parameter is null or undefined');
    return {
      error: true,
      message: 'Question data is missing',
      score: 0,
      quality: 'low',
      ui_feedback: '<div style="color: #dc2626;">❌ Unable to analyze - question data missing</div>',
      analysisType: 'error'
    };
  }

  if (!answer || typeof answer !== 'string') {
    console.error('analyzeResponse: answer parameter is invalid');
    return {
      error: true,
      message: 'Answer data is invalid', 
      score: 0,
      quality: 'low',
      ui_feedback: '<div style="color: #dc2626;">❌ Unable to analyze - answer data missing</div>',
      analysisType: 'error'
    };
  }

  // Determine if this is an MCQ question
  const isMCQ = question.type === 'mcq' && question.options;
  
  if (isMCQ) {
    return analyzeMCQResponse(question, answer, responseTime);
  } else {
    return analyzeTextResponse(question, answer, responseTime);
  }
};

// Generate initial question based on resume and job description
const generateInitialQuestion = async (resumeText, jobDescription) => {
  const prompt = config.prompts.initialQuestion
    .replace('{resumeText}', resumeText || 'No resume provided - focus on job requirements')
    .replace('{jobDescription}', jobDescription);

  try {
    const result = await callOpenAIAPI(prompt, { 
      json_mode: true,
      temperature: 0.8,
      max_tokens: 800 
    });
    
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating initial question:', error);
    return {
      question: "Describe your most significant professional achievement that directly relates to this role. Please include the specific challenges you faced, your approach to solving them, and the measurable impact of your work.",
      type: "experience",
      focus_area: "relevant achievements and problem-solving",
      expected_depth: "specific examples with challenges, solutions, and quantifiable results",
      ui_hint: "This question allows candidates to showcase their most relevant experience with concrete examples"
    };
  }
};


// Generate adaptive next question based on previous responses
const generateAdaptiveQuestion = async (assessmentData) => {
  const { resumeText, jobDescription, responses, questionCount, maxQuestions = 5, startTime } = assessmentData;
  
  // Calculate time metrics
  const timeElapsed = startTime ? (Date.now() - startTime) / (1000 * 60) : 0;
  const timeRemaining = Math.max(0, 5 - timeElapsed);
  const averageScore = responses.length > 0 ? responses.reduce((sum, r) => sum + (r.analysis.score || 5), 0) / responses.length : 8;
  const correctAnswers = responses.filter(r => r.analysis.isCorrect === true).length;
  const focusAreasCovered = responses.map(r => r.question.focus_area);
  
  const conversationHistory = responses.map((r, i) => {
    return `Q${i+1} (${r.question.focus_area}): ${r.question.question}
A${i+1}: ${r.answer}
Score: ${r.analysis.score || 'N/A'}/10 (${r.analysis.quality})
Correct: ${r.analysis.isCorrect ? 'Yes' : 'No'}
Response Time: ${r.responseTime || 'N/A'}s
---`;
  }).join('\n');
  
  const lastResponse = responses.length > 0 ? responses[responses.length - 1] : null;
  const lastAnalysis = lastResponse ? lastResponse.analysis : { quality: 'medium', score: 5 };
  
  // Determine position type from job description
  const getPositionType = (jobDesc) => {
    const desc = jobDesc.toLowerCase();
    if (config.positionTypes.technical.some(term => desc.includes(term))) return 'technical';
    if (config.positionTypes.business.some(term => desc.includes(term))) return 'business';
    if (config.positionTypes.creative.some(term => desc.includes(term))) return 'creative';
    return 'general';
  };
  
  const positionType = getPositionType(jobDescription);
  
  const prompt = config.prompts.adaptiveQuestion
    .replace('{resumeText}', resumeText || 'No resume provided')
    .replace('{jobDescription}', jobDescription)
    .replace('{positionType}', positionType)
    .replace('{questionCount}', questionCount + 1)
    .replace('{maxQuestions}', maxQuestions)
    .replace('{timeElapsed}', timeElapsed.toFixed(1))
    .replace('{timeRemaining}', timeRemaining.toFixed(1))
    .replace('{averageScore}', averageScore.toFixed(1))
    .replace('{focusAreasCovered}', focusAreasCovered.join(', ') || 'None')
    .replace('{correctAnswers}', correctAnswers)
    .replace('{totalResponses}', responses.length)
    .replace('{conversationHistory}', conversationHistory || 'No previous responses')
    .replace('{lastAnalysis}', lastResponse ? `
- Quality: ${lastAnalysis.quality}
- Score: ${lastAnalysis.score}/10
- Correct: ${lastAnalysis.isCorrect ? 'Yes' : 'No'}
- UI Feedback Given: "${lastAnalysis.ui_feedback || lastAnalysis.reasoning}"
` : 'First question - no previous analysis');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview', // or 'gpt-3.5-turbo-0125' for lower cost
      messages: [
        {
          role: 'system',
          content: 'You are an expert adaptive interview assessment system. Generate contextually appropriate questions based on previous responses and performance. Return JSON with this structure: { question: string, type: "mcq" | "short_answer" | "experience", options?: array (for mcq only with letter, text, isCorrect fields), focus_area: string, difficulty: "easy" | "medium" | "hard", estimated_time: string, explanation?: string (for mcq), expected_keywords?: array (for text questions), ui_hint: string }'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });
    
    const result = response.choices[0].message.content.trim();
    const question = JSON.parse(result);
    question.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    question.generated_at = new Date().toISOString();
    return question;

  } catch (error) {
    console.error('Error generating adaptive question:', error);
    
    // Enhanced fallback with time-aware and position-specific questions
    const shouldUseMCQ = timeRemaining < 3 || (lastAnalysis.quality === 'low');
    const difficulty = lastAnalysis.quality === 'high' ? 'hard' : 
                     lastAnalysis.quality === 'low' ? 'easy' : 'medium';
    
    // Position-specific fallback questions
    const fallbackQuestions = {
      // technical: {
      //   mcq: {
      //     question: "When debugging a performance issue in a web application, what should be your FIRST step?",
      //     type: "mcq",
      //     options: [
      //       {"letter": "A", "text": "Optimize database queries immediately", "isCorrect": false},
      //       {"letter": "B", "text": "Profile the application to identify bottlenecks", "isCorrect": true},
      //       {"letter": "C", "text": "Increase server memory allocation", "isCorrect": false},
      //       {"letter": "D", "text": "Rewrite the entire codebase", "isCorrect": false}
      //     ],
      //     focus_area: "technical problem-solving",
      //     difficulty: difficulty,
      //     estimated_time: "45 seconds",
      //     explanation: "Profiling helps identify the actual bottlenecks before making optimizations",
      //     ui_hint: "Testing systematic debugging approach"
      //   },
      //   short_answer: {
      //     question: "Describe your approach to code review. What specific things do you look for and why?",
      //     type: "short_answer",
      //     focus_area: "code quality and collaboration",
      //     difficulty: difficulty,
      //     estimated_time: "90 seconds",
      //     expected_keywords: ["functionality", "readability", "security", "performance", "standards"],
      //     ui_hint: "Assessing code quality awareness and team collaboration"
      //   }
      // },
      // business: {
      //   mcq: {
      //     question: "Your team's project is 20% over budget with 2 weeks remaining. What's your MOST strategic response?",
      //     type: "mcq",
      //     options: [
      //       {"letter": "A", "text": "Cut all non-essential features immediately", "isCorrect": false},
      //       {"letter": "B", "text": "Analyze remaining work vs. budget impact and present options", "isCorrect": true},
      //       {"letter": "C", "text": "Request additional budget without alternatives", "isCorrect": false},
      //       {"letter": "D", "text": "Continue as planned and address overrun later", "isCorrect": false}
      //     ],
      //     focus_area: "project management and decision-making",
      //     difficulty: difficulty,
      //     estimated_time: "60 seconds",
      //     explanation: "Strategic analysis provides stakeholders with informed options for decision-making",
      //     ui_hint: "Testing strategic thinking under pressure"
      //   },
      //   short_answer: {
      //     question: "How do you handle competing priorities from different stakeholders? Provide a specific approach.",
      //     type: "short_answer",
      //     focus_area: "stakeholder management",
      //     difficulty: difficulty,
      //     estimated_time: "90 seconds",
      //     expected_keywords: ["prioritize", "communicate", "negotiate", "criteria", "stakeholder"],
      //     ui_hint: "Assessing conflict resolution and prioritization skills"
      //   }
      // },
      // creative: {
      //   mcq: {
      //     question: "When designing for mobile-first, what should be your PRIMARY consideration?",
      //     type: "mcq",
      //     options: [
      //       {"letter": "A", "text": "Making desktop version look good on mobile", "isCorrect": false},
      //       {"letter": "B", "text": "User experience and touch interactions on small screens", "isCorrect": true},
      //       {"letter": "C", "text": "Fitting all desktop content on mobile", "isCorrect": false},
      //       {"letter": "D", "text": "Using the same layout with smaller fonts", "isCorrect": false}
      //     ],
      //     focus_area: "user experience design",
      //     difficulty: difficulty,
      //     estimated_time: "45 seconds",
      //     explanation: "Mobile-first design prioritizes optimal user experience for touch interfaces and smaller screens",
      //     ui_hint: "Testing understanding of responsive design principles"
      //   },
      //   short_answer: {
      //     question: "Describe your creative process from initial brief to final deliverable. What are your key steps?",
      //     type: "short_answer",
      //     focus_area: "creative process and methodology",
      //     difficulty: difficulty,
      //     estimated_time: "90 seconds",
      //     expected_keywords: ["research", "ideation", "concept", "iteration", "feedback"],
      //     ui_hint: "Assessing structured creative thinking and process"
      //   }
      // },
      // general: {
      //   mcq: {
      //     question: "When facing a tight deadline with unclear requirements, what's your BEST first action?",
      //     type: "mcq",
      //     options: [
      //       {"letter": "A", "text": "Start working immediately with best assumptions", "isCorrect": false},
      //       {"letter": "B", "text": "Clarify requirements and prioritize critical elements", "isCorrect": true},
      //       {"letter": "C", "text": "Ask for a deadline extension", "isCorrect": false},
      //       {"letter": "D", "text": "Delegate the task to someone else", "isCorrect": false}
      //     ],
      //     focus_area: "problem-solving and communication",
      //     difficulty: difficulty,
      //     estimated_time: "45 seconds",
      //     explanation: "Clarifying requirements prevents wasted effort and ensures you're solving the right problem",
      //     ui_hint: "Testing practical problem-solving approach"
      //   },
      //   short_answer: {
      //     question: "Tell me about a time you had to learn something completely new for work. How did you approach it?",
      //     type: "short_answer",
      //     focus_area: "learning and adaptability",
      //     difficulty: difficulty,
      //     estimated_time: "90 seconds",
      //     expected_keywords: ["research", "practice", "resources", "apply", "result"],
      //     ui_hint: "Assessing learning agility and self-development"
      //   }
      // }
    };
    
    const positionQuestions = fallbackQuestions[positionType] || fallbackQuestions.general;
    const questionType = shouldUseMCQ ? 'mcq' : 'short_answer';
    const fallbackQuestion = positionQuestions[questionType];
    
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      reasoning: `Fallback ${questionType} question for ${positionType} role with ${difficulty} difficulty`,
      generated_at: new Date().toISOString(),
      ...fallbackQuestion
    };
  }
};

// Generate comprehensive feedback based on all responses
const generateComprehensiveFeedback = async (assessmentData) => {
  const { responses, resumeText, jobDescription } = assessmentData;
  
  // Separate MCQ and text responses for different analysis
  const mcqResponses = responses.filter(r => r.analysis.analysisType === 'mcq');
  const textResponses = responses.filter(r => r.analysis.analysisType === 'text');
  
  // Calculate comprehensive statistics
  const totalQuestions = responses.length;
  const averageScore = responses.reduce((sum, r) => sum + (r.analysis.score || 5), 0) / responses.length;
  
  // MCQ-specific stats
  const mcqCorrect = mcqResponses.filter(r => r.analysis.isCorrect === true).length;
  const mcqAccuracy = mcqResponses.length > 0 ? (mcqCorrect / mcqResponses.length) * 100 : 0;
  const averageMcqTime = mcqResponses.length > 0 ? 
    mcqResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / mcqResponses.length : 0;
  
  // Text response stats
  const textHighQuality = textResponses.filter(r => r.analysis.quality === 'high').length;
  const textQualityRate = textResponses.length > 0 ? (textHighQuality / textResponses.length) * 100 : 0;
  
  // Focus areas analysis
  const focusAreas = responses.reduce((acc, r) => {
    const area = r.question.focus_area;
    if (!acc[area]) {
      acc[area] = { total: 0, correct: 0, avgScore: 0 };
    }
    acc[area].total += 1;
    acc[area].avgScore += r.analysis.score || 5;
    if (r.analysis.isCorrect === true || r.analysis.quality === 'high') {
      acc[area].correct += 1;
    }
    return acc;
  }, {});
  
  // Calculate area performance
  Object.keys(focusAreas).forEach(area => {
    focusAreas[area].avgScore = focusAreas[area].avgScore / focusAreas[area].total;
    focusAreas[area].successRate = (focusAreas[area].correct / focusAreas[area].total) * 100;
  });
  
  // Build conversation summary with mixed formats
  const conversationSummary = responses.map((r, i) => {
    if (r.analysis.analysisType === 'mcq') {
      return `Q${i+1} (MCQ - ${r.question.focus_area}): ${r.analysis.isCorrect ? 'CORRECT' : 'INCORRECT'} (${r.analysis.score}/10)
Selected: ${r.analysis.selectedOption} | Correct: ${r.analysis.correctOption}
Time: ${r.responseTime || 'N/A'}s`;
    } else {
      return `Q${i+1} (Text - ${r.question.focus_area}): ${r.analysis.quality.toUpperCase()} quality (${r.analysis.score}/10)
Response: ${r.answer.substring(0, 100)}...
Strengths: ${r.analysis.strengths?.join(', ') || 'N/A'}`;
    }
  }).join('\n\n');

  // Enhanced prompt that requests structured JSON response
  const prompt = config.prompts.comprehensiveFeedback
    .replace('{jobDescription}', jobDescription)
    .replace('{resumeProvided}', resumeText ? 'Provided' : 'Not provided')
    .replace('{totalQuestions}', totalQuestions)
    .replace('{mcqCount}', mcqResponses.length)
    .replace('{textCount}', textResponses.length)
    .replace('{averageScore}', averageScore.toFixed(1))
    .replace('{mcqCorrect}', mcqCorrect)
    .replace('{mcqTotal}', mcqResponses.length)
    .replace('{mcqAccuracy}', mcqAccuracy.toFixed(0))
    .replace('{averageMcqTime}', averageMcqTime.toFixed(1))
    .replace('{mcqFocusAreas}', mcqResponses.map(r => r.question.focus_area).join(', '))
    .replace('{textHighQuality}', textHighQuality)
    .replace('{textTotal}', textResponses.length)
    .replace('{textQualityRate}', textQualityRate.toFixed(0))
    .replace('{textFocusAreas}', textResponses.map(r => r.question.focus_area).join(', '))
    .replace('{focusAreaStats}', Object.entries(focusAreas).map(([area, stats]) => 
      `- ${area}: ${stats.correct}/${stats.total} successful (${stats.successRate.toFixed(0)}%), avg score ${stats.avgScore.toFixed(1)}/10`
    ).join('\n'))
    .replace('{conversationSummary}', conversationSummary);

  try {
    // Call OpenAI API with structured output
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview assessment system. Generate comprehensive feedback in JSON format with the following structure: { overallScore: number (1-10), performanceLevel: string, overallFeedback: string, strengths: array of 3 strings, improvements: array of 3 strings, detailedScores: { communication: number (1-10), technical: number (1-10), problemSolving: number (1-10), clarity: number (1-10) }, nextSteps: string }'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = response.choices[0].message.content.trim();
    const parsedResponse = JSON.parse(responseText);
    
    // Validate that the response has the required structure
    if (parsedResponse.overallScore !== undefined && 
        parsedResponse.performanceLevel && 
        parsedResponse.overallFeedback && 
        parsedResponse.strengths && 
        parsedResponse.improvements && 
        parsedResponse.detailedScores && 
        parsedResponse.nextSteps) {
      return parsedResponse;
    } else {
      console.log('LLM response missing required fields, using fallback');
      return generateStructuredFallback(assessmentData, averageScore, focusAreas, responseText);
    }
    
  } catch (error) {
    console.error('Error generating comprehensive feedback:', error);
    return generateStructuredFallback(assessmentData, averageScore, focusAreas);
  }
};

// Fallback function that generates structured data based on assessment performance
const generateStructuredFallback = (assessmentData, averageScore, focusAreas, originalFeedback = null) => {
  const { responses } = assessmentData;
  const mcqResponses = responses.filter(r => r.analysis.analysisType === 'mcq');
  const textResponses = responses.filter(r => r.analysis.analysisType === 'text');
  
  // Calculate performance metrics
  const mcqCorrect = mcqResponses.filter(r => r.analysis.isCorrect === true).length;
  const mcqAccuracy = mcqResponses.length > 0 ? (mcqCorrect / mcqResponses.length) * 100 : 0;
  const textHighQuality = textResponses.filter(r => r.analysis.quality === 'high').length;
  const textQualityRate = textResponses.length > 0 ? (textHighQuality / textResponses.length) * 100 : 0;
  const averageMcqTime = mcqResponses.length > 0 ? 
    mcqResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / mcqResponses.length : 0;
  
  // Determine performance level
  const overallScore = Math.round(averageScore * 10) / 10;
  const performanceLevel = overallScore >= 8 ? 'Excellent' : 
                          overallScore >= 6 ? 'Good' : 
                          overallScore >= 4 ? 'Fair' : 'Needs Improvement';
  
  // Generate dynamic strengths based on actual performance
  const strengths = [];
  if (mcqAccuracy >= 70) {
    strengths.push(`Strong foundational knowledge with ${mcqAccuracy.toFixed(0)}% accuracy on multiple choice questions`);
  } else if (mcqAccuracy >= 50) {
    strengths.push(`Solid understanding of core concepts with ${mcqAccuracy.toFixed(0)}% accuracy`);
  } else if (mcqResponses.length > 0) {
    strengths.push('Engaged with technical assessment questions and demonstrated problem-solving approach');
  }
  
  if (textQualityRate >= 60) {
    strengths.push(`Excellent communication skills with ${textQualityRate.toFixed(0)}% high-quality responses`);
  } else if (textQualityRate >= 30) {
    strengths.push('Good communication abilities demonstrated in detailed responses');
  } else if (textResponses.length > 0) {
    strengths.push('Provided thoughtful responses to open-ended questions');
  }
  
  if (averageMcqTime > 0 && averageMcqTime < 45) {
    strengths.push(`Efficient decision-making with average response time of ${averageMcqTime.toFixed(1)} seconds`);
  } else if (responses.length > 0) {
    strengths.push('Demonstrated consistent engagement throughout the assessment');
  }
  
  // Ensure at least 2 strengths
  if (strengths.length < 2) {
    strengths.push('Active participation in the assessment process');
    strengths.push('Willingness to tackle challenging questions');
  }
  
  // Generate dynamic improvements based on actual weaknesses
  const improvements = [];
  const mcqIncorrect = mcqResponses.filter(r => r.analysis.isCorrect === false);
  if (mcqIncorrect.length > 0) {
    const missedAreas = [...new Set(mcqIncorrect.map(r => r.question.focus_area))];
    improvements.push(`Review key concepts in ${missedAreas.join(', ')} - ${mcqIncorrect.length} questions need attention`);
  }
  
  const lowQualityText = textResponses.filter(r => r.analysis.quality === 'low' || r.analysis.score < 5);
  if (lowQualityText.length > 0) {
    improvements.push(`Enhance response structure and depth - include more specific examples and quantifiable outcomes`);
  }
  
  // Find weakest focus area
  const areaPerformances = Object.entries(focusAreas).map(([area, stats]) => ({
    area,
    successRate: stats.successRate,
    avgScore: stats.avgScore
  })).sort((a, b) => a.avgScore - b.avgScore);
  
  if (areaPerformances.length > 0 && areaPerformances[0].avgScore < 6) {
    improvements.push(`Focus additional study on ${areaPerformances[0].area} where performance averaged ${areaPerformances[0].avgScore.toFixed(1)}/10`);
  }
  
  // Ensure at least 2 improvements
  if (improvements.length < 2) {
    improvements.push('Practice using the STAR method for more structured behavioral responses');
    improvements.push('Prepare specific examples with quantifiable results to strengthen answers');
  }
  
  // Calculate detailed scores based on performance
  const textScores = textResponses.map(r => r.analysis.score || 5);
  const communicationScore = textScores.length > 0 ? 
    Math.round(textScores.reduce((a, b) => a + b, 0) / textScores.length) : Math.round(overallScore);
  
  const technicalScore = mcqResponses.length > 0 ? 
    Math.round((mcqCorrect / mcqResponses.length) * 10) : Math.round(overallScore);
  
  const problemSolvingScore = Math.round((communicationScore + technicalScore) / 2);
  const clarityScore = communicationScore;
  
  // Generate next steps
  let nextSteps = '';
  if (overallScore >= 7) {
    nextSteps = 'Continue strengthening your expertise and practice articulating experience with specific metrics. ';
  } else if (overallScore >= 5) {
    nextSteps = 'Focus on improving knowledge gaps and providing more detailed, structured responses. ';
  } else {
    nextSteps = 'Prioritize studying core concepts and practicing both quick recall and detailed explanations. ';
  }
  
  if (mcqIncorrect.length > 0) {
    const missedConcepts = [...new Set(mcqIncorrect.map(r => r.question.focus_area))];
    nextSteps += `Review fundamental concepts in ${missedConcepts.join(' and ')} to strengthen your knowledge base.`;
  } else {
    nextSteps += 'Continue building on your strong foundation with advanced topics and real-world scenarios.';
  }
  
  // Generate overall feedback
  const overallFeedback = originalFeedback || `You demonstrated ${performanceLevel.toLowerCase()} performance with an average score of ${overallScore}/10 across ${responses.length} questions. Your assessment included ${mcqResponses.length} multiple choice questions (${mcqAccuracy.toFixed(0)}% accuracy) and ${textResponses.length} open-ended responses with ${textQualityRate.toFixed(0)}% high-quality answers. ${areaPerformances.length > 0 ? `Your strongest performance was in ${areaPerformances[areaPerformances.length - 1].area}, while ${areaPerformances[0].area} presents the most opportunity for improvement.` : 'Focus on consistent performance across all areas.'}`;
  
  return {
    overallScore: Math.max(1, Math.min(10, overallScore)),
    performanceLevel: performanceLevel,
    overallFeedback: overallFeedback,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    detailedScores: {
      communication: Math.max(1, Math.min(10, communicationScore)),
      technical: Math.max(1, Math.min(10, technicalScore)),
      problemSolving: Math.max(1, Math.min(10, problemSolvingScore)),
      clarity: Math.max(1, Math.min(10, clarityScore))
    },
    nextSteps: nextSteps
  };
};


// ROUTES

// Start assessment with resume and job description
router.post('/start-assessment', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    let resumeText = '';
    
    // Parse resume if uploaded
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    // Generate first question
    const firstQuestion = await generateInitialQuestion(resumeText, jobDescription);
    
    // Reset assessment session
    currentAssessment = {
      resumeText,
      jobDescription,
      currentQuestion: firstQuestion,
      questionCount: 1,
      maxQuestions: 5,
      responses: [],
      assessmentContext: '',
      candidateProfile: '',
      finished: false,
      startTime: Date.now()
    };

    res.json({ 
      success: true, 
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions: currentAssessment.maxQuestions,
      isAdaptive: true
    });

  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

// Legacy route for backward compatibility
router.post('/start-interview', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    let resumeText = '';
    
    // Parse resume if uploaded
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    // Generate first question
    const firstQuestion = await generateInitialQuestion(resumeText, jobDescription);
    
    // Reset assessment session
    currentAssessment = {
      resumeText: resumeText,
      jobDescription: jobDescription,
      currentQuestion: firstQuestion,
      questionCount: 1,
      maxQuestions: 5,
      responses: [],
      assessmentContext: '',
      candidateProfile: '',
      finished: false,
      startTime: Date.now()
    };

    res.json({ 
      success: true, 
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions: currentAssessment.maxQuestions,
      isAdaptive: true
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Submit answer and get adaptive next question
router.post('/submit-answer', async (req, res) => {
  try {
    const { answer, responseTime, questionType } = req.body;
    
    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: 'Answer is required' });
    }
    
    // Use enhanced analysis that handles both MCQ and text
    const analysis = await analyzeResponse(
      currentAssessment.currentQuestion, 
      answer.trim(),
      responseTime
    );
    
    // Store the response with enhanced data
    currentAssessment.responses.push({
      question: currentAssessment.currentQuestion,
      answer: answer.trim(),
      analysis: analysis,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });

    // Check if assessment should end
    if (currentAssessment.questionCount >= currentAssessment.maxQuestions) {
      // Generate enhanced feedback for mixed assessment
      const feedback = await generateComprehensiveFeedback(currentAssessment);
      
      currentAssessment.finished = true;
      
      // Calculate comprehensive statistics
      const mcqResponses = currentAssessment.responses.filter(r => r.analysis.analysisType === 'mcq');
      const textResponses = currentAssessment.responses.filter(r => r.analysis.analysisType === 'text');
      const correctAnswers = currentAssessment.responses.filter(r => 
        r.analysis.isCorrect === true || r.analysis.quality === 'high'
      ).length;
      const averageScore = currentAssessment.responses.reduce((acc, r) => acc + r.analysis.score, 0) / currentAssessment.responses.length;
      
      return res.json({
        finished: true,
        feedback: feedback,
        overallStats: {
          totalQuestions: currentAssessment.responses.length,
          averageScore: Math.round(averageScore * 10) / 10,
          correctAnswers: correctAnswers,
          mcqStats: {
            total: mcqResponses.length,
            correct: mcqResponses.filter(r => r.analysis.isCorrect === true).length,
            accuracy: mcqResponses.length > 0 ? Math.round((mcqResponses.filter(r => r.analysis.isCorrect === true).length / mcqResponses.length) * 100) : 0
          },
          textStats: {
            total: textResponses.length,
            highQuality: textResponses.filter(r => r.analysis.quality === 'high').length,
            qualityRate: textResponses.length > 0 ? Math.round((textResponses.filter(r => r.analysis.quality === 'high').length / textResponses.length) * 100) : 0
          },
          focusAreas: currentAssessment.responses.reduce((acc, r) => {
            const area = r.question.focus_area;
            if (!acc[area]) acc[area] = { correct: 0, total: 0 };
            acc[area].total += 1;
            if (r.analysis.isCorrect === true || r.analysis.quality === 'high') {
              acc[area].correct += 1;
            }
            return acc;
          }, {})
        }
      });
    }

    // Generate next adaptive question
    const nextQuestion = await generateAdaptiveQuestion(currentAssessment);
    currentAssessment.currentQuestion = nextQuestion;
    currentAssessment.questionCount++;

    res.json({
      success: true,
      nextQuestion: nextQuestion,
      questionNumber: currentAssessment.questionCount,
      totalQuestions: currentAssessment.maxQuestions,
      previousAnalysis: {
        quality: analysis.quality,
        ui_feedback: analysis.ui_feedback,
        isCorrect: analysis.isCorrect,
        score: analysis.score,
        explanation: analysis.explanation,
        analysisType: analysis.analysisType,
        selectedOption: analysis.selectedOption,
        correctOption: analysis.correctOption,
        responseTime: analysis.responseTime,
        strengths: analysis.strengths,
        improvements: analysis.improvements
      }
    });

  } catch (error) {
    console.error('Error processing answer:', error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

// Get current assessment status
router.get('/assessment-status', (req, res) => {
  res.json({
    questionNumber: currentAssessment.questionCount,
    totalQuestions: currentAssessment.maxQuestions,
    finished: currentAssessment.finished,
    currentQuestion: currentAssessment.currentQuestion,
    responsesCount: currentAssessment.responses.length
  });
});

// Legacy route for backward compatibility
router.get('/interview-status', (req, res) => {
  res.json({
    questionNumber: currentAssessment.questionCount,
    totalQuestions: currentAssessment.maxQuestions,
    finished: currentAssessment.finished,
    currentQuestion: currentAssessment.currentQuestion,
    responsesCount: currentAssessment.responses.length
  });
});

// Reset assessment
router.post('/reset-assessment', (req, res) => {
  currentAssessment = {
    resumeText: '',
    jobDescription: '',
    currentQuestion: null,
    questionCount: 0,
    maxQuestions: 5,
    responses: [],
    assessmentContext: '',
    candidateProfile: '',
    finished: false
  };
  res.json({ success: true, message: 'Assessment reset successfully' });
});

// Legacy route for backward compatibility
router.post('/reset-interview', (req, res) => {
  currentAssessment = {
    resumeText: '',
    jobDescription: '',
    currentQuestion: null,
    questionCount: 0,
    maxQuestions: 5,
    responses: [],
    assessmentContext: '',
    candidateProfile: '',
    finished: false
  };
  res.json({ success: true, message: 'Interview reset successfully' });
});

// Generate feedback endpoint
router.post('/api/generate-feedback', async (req, res) => {
  try {
    const { conversationHistory, interviewData, totalQuestions, questionsAnswered } = req.body;
    
    console.log('Feedback request received:', {
      historyLength: conversationHistory?.length,
      questionsAnswered,
      totalQuestions
    });

    // Use current assessment data if available
    if (currentAssessment.responses.length > 0) {
      // Get structured feedback directly from LLM
      const structuredFeedback = await generateComprehensiveFeedback(currentAssessment);
      
      // The LLM now returns the complete structured object
      res.json(structuredFeedback);
      
    } else {
      // Return error if no assessment data available
      res.status(400).json({ 
        error: 'No assessment data available',
        message: 'Please complete an assessment before requesting feedback'
      });
    }

  } catch (error) {
    console.error('Feedback generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate feedback',
      message: error.message 
    });
  }
});

// Health check endpoint for feedback system
router.get('/api/feedback-status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Assessment feedback system is operational',
    timestamp: new Date().toISOString(),
    features: {
      aiAnalysis: true,
      detailedScoring: true,
      actionableAdvice: true,
      mcqSupport: true,
      adaptiveQuestioning: true
    }
  });
});

// Export the current assessment state for use in other modules
const getCurrentAssessment = () => currentAssessment;

module.exports = router;
module.exports.getCurrentAssessment = getCurrentAssessment;