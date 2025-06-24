// const express = require('express');
// const multer = require('multer');
// const pdfParse = require('pdf-parse');
// const cors = require('cors');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const OpenAI = require('openai');  // ← ADD THIS LINE
// const fs = require('fs');
// const { Readable } = require('stream');
// const path = require('path');
// const axios = require('axios');

// require('dotenv').config();

// const app = express();
// const upload = multer({ storage: multer.memoryStorage() }); 

// // Check if API key is loaded
// if (!process.env.GEMINI_API_KEY) {
//   console.error('GEMINI_API_KEY is not set in environment variables');
//   process.exit(1);
// }

// console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

// //  Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// app.use(cors());
// app.use(express.json());

// // Store current interview session 
// let currentInterview = {
//   resumeText: '',
//   jobDescription: '',
//   currentQuestion: null,
//   questionCount: 0,
//   maxQuestions: 5,
//   responses: [],
//   interviewContext: '',
//   candidateProfile: '',
//   finished: false
// };

// // Analyze response quality
// const analyzeResponse = async (question, answer, responseTime = null) => {
//   // Determine if this is an MCQ question
//   const isMCQ = question.type === 'mcq' && question.options;
  
//   if (isMCQ) {
//     return analyzeMCQResponse(question, answer, responseTime);
//   } else {
//     return analyzeTextResponse(question, answer, responseTime);
//   }
// };

// // MCQ-specific evaluation
// const analyzeMCQResponse = async (question, selectedLetter, responseTime) => {
//   // Find the selected option
//   const selectedOption = question.options.find(opt => opt.letter === selectedLetter);
//   const correctOption = question.options.find(opt => opt.isCorrect);
  
//   // Basic validation
//   if (!selectedOption) {
//     return {
//       isCorrect: false,
//       score: 0,
//       quality: 'invalid',
//       reasoning: 'Invalid option selected',
//       ui_feedback: 'Please select a valid option.',
//       selectedOption: selectedLetter,
//       correctOption: correctOption?.letter,
//       explanation: question.explanation || 'No explanation provided',
//       responseTime: responseTime,
//       analysisType: 'mcq'
//     };
//   }
  
//   const isCorrect = selectedOption.isCorrect;
  
//   // Score calculation for MCQ
//   let score = isCorrect ? 8 : 2; // Base score: 8 for correct, 2 for attempt
  
//   // Time-based bonus/penalty
//   if (responseTime && question.estimated_time) {
//     const expectedTimeSeconds = parseTimeToSeconds(question.estimated_time);
//     const timeFactor = responseTime / expectedTimeSeconds;
    
//     if (isCorrect) {
//       // Bonus for quick correct answers, penalty for very slow ones
//       if (timeFactor < 0.5) score = Math.min(10, score + 1); // Quick bonus
//       else if (timeFactor > 2) score = Math.max(5, score - 1); // Slow penalty
//     }
//   }
  
//   // Quality determination
//   let quality = 'medium';
//   if (isCorrect && score >= 8) quality = 'high';
//   else if (isCorrect && score >= 6) quality = 'medium';
//   else quality = 'low';
  
//   // Generate contextual feedback
//   let ui_feedback;
//   if (isCorrect) {
//     ui_feedback = `Correct! ${question.explanation || 'Good job on selecting the right answer.'}`;
//   } else {
//     ui_feedback = `Incorrect. The correct answer was ${correctOption?.letter}: "${correctOption?.text}". ${question.explanation || ''}`;
//   }
  
//   // Advanced LLM analysis for complex MCQs (optional)
//   if (question.difficulty === 'hard' || question.focus_area.includes('strategic')) {
//     try {
//       const advancedAnalysis = await getLLMAnalysisForMCQ(question, selectedOption, correctOption, isCorrect);
//       ui_feedback = advancedAnalysis.enhanced_feedback || ui_feedback;
//     } catch (error) {
//       console.log('Advanced MCQ analysis failed, using basic feedback');
//     }
//   }
  
//   return {
//     isCorrect,
//     score: Math.round(score),
//     quality,
//     reasoning: `MCQ: Selected ${selectedLetter}, correct answer was ${correctOption?.letter}`,
//     ui_feedback,
//     selectedOption: selectedLetter,
//     correctOption: correctOption?.letter,
//     explanation: question.explanation,
//     responseTime: responseTime,
//     timeTaken: responseTime ? `${responseTime}s` : 'Not measured',
//     analysisType: 'mcq',
//     difficulty: question.difficulty,
//     focus_area: question.focus_area
//   };
// };

// // Enhanced text response evaluation (your existing logic plus MCQ context)
// const analyzeTextResponse = async (question, answer, responseTime) => {
//   const answerLength = answer.trim().split(' ').length;
//   const hasExamples = /\b(example|instance|experience|project|when i|i worked|i led|for example)\b/i.test(answer);
//   const hasMetrics = /\d+/.test(answer) && /\b(percent|%|increase|decrease|improved|reduced|saved|revenue|cost)\b/i.test(answer);
  
//   const isDetailed = answerLength > 30;
//   const isVague = answerLength < 15;
  
//   try {
//     // Enhanced prompt that considers previous MCQ performance
//     const analysisPrompt = `
// Analyze this interview response for quality and provide actionable feedback.

// QUESTION: "${question.question}"
// QUESTION TYPE: ${question.type}
// FOCUS AREA: ${question.focus_area}
// DIFFICULTY: ${question.difficulty}
// CANDIDATE'S ANSWER: "${answer}"
// RESPONSE TIME: ${responseTime ? `${responseTime} seconds` : 'Not measured'}

// Evaluate considering:
// - Relevance to the question asked
// - Specificity and concrete examples
// - Quantifiable results or metrics
// - Communication clarity
// - Professional insight demonstrated
// - Completeness of the answer
// - Appropriateness for the difficulty level

// Return ONLY a JSON object:
// {
//   "quality": "high|medium|low",
//   "reasoning": "detailed explanation of evaluation",
//   "ui_feedback": "encouraging and constructive feedback for the candidate",
//   "score": 1-10,
//   "strengths": ["strength1", "strength2"],
//   "improvements": ["improvement1", "improvement2"]
// }
//   give feedback within 2 or 3 sentences, focusing on the most critical aspects of the response.
// `;

//     const llmResponse = await callGeminiAPI(analysisPrompt);
//     const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    
//     if (jsonMatch) {
//       const llmAnalysis = JSON.parse(jsonMatch[0]);
      
//       return {
//         length: answerLength,
//         hasExamples,
//         hasMetrics,
//         isDetailed,
//         isVague,
//         isCorrect: null, // Not applicable for text responses
//         quality: llmAnalysis.quality,
//         reasoning: llmAnalysis.reasoning,
//         ui_feedback: llmAnalysis.ui_feedback,
//         score: llmAnalysis.score || 5,
//         strengths: llmAnalysis.strengths || [],
//         improvements: llmAnalysis.improvements || [],
//         responseTime: responseTime,
//         timeTaken: responseTime ? `${responseTime}s` : 'Not measured',
//         analysisType: 'text'
//       };
//     }
    
//     throw new Error('Invalid LLM response format');
    
//   } catch (error) {
//     console.error('LLM Analysis failed:', error);
    
//     // Enhanced fallback with time consideration
//     let score = 5;
//     let quality = 'medium';
//     const strengths = [];
//     const improvements = [];
    
//     if (hasExamples) { score += 1; strengths.push('Includes specific examples'); }
//     if (hasMetrics) { score += 1; strengths.push('Contains quantifiable results'); }
//     if (isDetailed) { score += 1; strengths.push('Comprehensive response'); }
//     if (isVague) { score -= 2; improvements.push('Provide more detailed responses'); }
    
//     // Time-based adjustments
//     if (responseTime && question.estimated_time) {
//       const expectedTime = parseTimeToSeconds(question.estimated_time);
//       if (responseTime < expectedTime * 0.3) {
//         improvements.push('Take more time to provide thorough answers');
//       }
//     }
    
//     score = Math.max(1, Math.min(10, score));
    
//     if (score >= 8) quality = 'high';
//     else if (score <= 4) quality = 'low';
    
//     if (!hasExamples) improvements.push('Include specific examples');
//     if (!hasMetrics) improvements.push('Add quantifiable achievements');
    
//     return {
//       length: answerLength,
//       hasExamples,
//       hasMetrics,
//       isDetailed,
//       isVague,
//       isCorrect: null,
//       score,
//       quality,
//       strengths,
//       improvements,
//       reasoning: 'Fallback analysis based on content patterns',
//       ui_feedback: `${quality.charAt(0).toUpperCase() + quality.slice(1)} quality response. ${improvements.length > 0 ? 'Consider: ' + improvements[0] : 'Good work!'}`,
//       responseTime: responseTime,
//       analysisType: 'text'
//     };
//   }
// };

// // Advanced LLM analysis for complex MCQs
// const getLLMAnalysisForMCQ = async (question, selectedOption, correctOption, isCorrect) => {
//   const prompt = `
// Analyze this multiple choice question response for deeper insights:

// QUESTION: "${question.question}"
// FOCUS AREA: ${question.focus_area}
// DIFFICULTY: ${question.difficulty}

// SELECTED: ${selectedOption.letter}) ${selectedOption.text}
// CORRECT: ${correctOption.letter}) ${correctOption.text}
// RESULT: ${isCorrect ? 'Correct' : 'Incorrect'}

// If incorrect, analyze why the selected option might have been attractive and provide learning-focused feedback.
// If correct, acknowledge the good reasoning required.

// Return ONLY a JSON object:
// {
//   "enhanced_feedback": "Detailed feedback that explains the reasoning and provides learning value",
//   "knowledge_gap": "If incorrect, what concept should they study more",
//   "next_focus": "What area to emphasize in future questions"
// }
// `;

//   try {
//     const result = await callGeminiAPI(prompt);
//     const jsonMatch = result.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[0]);
//     }
//   } catch (error) {
//     console.error('Advanced MCQ analysis failed:', error);
//   }
  
//   return {
//     enhanced_feedback: isCorrect ? 'Correct answer!' : 'Incorrect. Review the explanation for the correct answer.',
//     knowledge_gap: !isCorrect ? question.focus_area : null,
//     next_focus: question.focus_area
//   };
// };

// // Utility function to parse time strings like "30-60 seconds" to seconds
// const parseTimeToSeconds = (timeString) => {
//   const match = timeString.match(/(\d+)(?:-(\d+))?\s*seconds?/);
//   if (match) {
//     const min = parseInt(match[1]);
//     const max = match[2] ? parseInt(match[2]) : min;
//     return (min + max) / 2; // Average of range
//   }
//   return 60; // Default fallback
// };

// // Enhanced submit handler that tracks timing
// const enhancedSubmitAnswer = async (answer, startTime) => {
//   const responseTime = startTime ? (Date.now() - startTime) / 1000 : null;
  
//   setLoading(true);
  
//   try {
//     const response = await fetch('http://localhost:3001/submit-answer', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ 
//         answer,
//         responseTime: Math.round(responseTime),
//         questionType: currentQuestion.type
//       })
//     });

//     const data = await response.json();
    
//     if (data.finished) {
//       setFeedback(data.feedback);
//       setStep('completed');
//     } else {
//       setCurrentQuestion(data.nextQuestion);
//       setQuestionNumber(data.questionNumber);
      
//       // Show detailed feedback for both MCQ and text
//       if (data.previousAnalysis) {
//         setResponseQuality(data.previousAnalysis.quality);
//         setAdaptiveFeedback(data.previousAnalysis.ui_feedback);
        
//         // For MCQs, show additional feedback
//         if (data.previousAnalysis.analysisType === 'mcq') {
//           setMcqResult({
//             isCorrect: data.previousAnalysis.isCorrect,
//             selectedOption: data.previousAnalysis.selectedOption,
//             correctOption: data.previousAnalysis.correctOption,
//             explanation: data.previousAnalysis.explanation
//           });
//         }
//       }
//     }
//   } catch (error) {
//     alert('Error submitting answer');
//   }
  
//   setLoading(false);
// };

// // Gemini API integration - matches your existing pattern
// const callGeminiAPI = async (prompt) => {
//   try {
//     const result = await model.generateContent(prompt);
//     return result.response.text().trim();
//   } catch (error) {
//     console.error('Gemini API call failed:', error);
//     throw error;
//   }
// };

// // Generate initial question based on resume and job description
// const generateInitialQuestion = async (resumeText, jobDescription) => {
//   const prompt = `
// You are an expert AI interviewer. Based on the resume and job description, generate the FIRST assessment question.

// RESUME: ${resumeText || 'No resume provided - focus on job requirements'}
// JOB DESCRIPTION: ${jobDescription}

// Create a question that:
// 1. Tests the MOST CRITICAL skill/requirement from the job description
// 2. Allows the candidate to showcase relevant experience with specific examples
// 3. Is clear, professional, and encourages detailed responses
// 4. Can be answered with concrete examples and measurable outcomes

// EXAMPLE OUTPUT:
// {
//   "question": "Tell me about a challenging project where you had to lead a cross-functional team to deliver results under tight deadlines. What was your approach, and what specific outcomes did you achieve?",
//   "type": "behavioral",
//   "focus_area": "leadership and project management",
//   "expected_depth": "specific project details, leadership strategies, quantifiable results, challenges overcome",
//   "ui_hint": "This question tests leadership skills mentioned in the job requirements and allows for detailed examples"
// }

// Return ONLY a JSON object with this exact format:
// {
//   "question": "Your professionally crafted question here",
//   "type": "behavioral|technical|situational|experience",
//   "focus_area": "specific skill or competency being tested",
//   "expected_depth": "what kind of detailed answer you're looking for",
//   "ui_hint": "brief explanation of why this question was chosen for the UI feedback"
// }
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text().trim();
    
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[0]);
//     }
    
//     throw new Error('No valid JSON found');
//   } catch (error) {
//     console.error('Error generating initial question:', error);
//     return {
//       question: "Describe your most significant professional achievement that directly relates to this role. Please include the specific challenges you faced, your approach to solving them, and the measurable impact of your work.",
//       type: "experience",
//       focus_area: "relevant achievements and problem-solving",
//       expected_depth: "specific examples with challenges, solutions, and quantifiable results",
//       ui_hint: "This question allows candidates to showcase their most relevant experience with concrete examples"
//     };
//   }
// };

// // Generate adaptive next question based on previous responses
// const generateAdaptiveQuestion = async (assessmentData) => {
//   const { resumeText, jobDescription, responses, questionCount, maxQuestions = 5, startTime } = assessmentData;
  
//   // Calculate time metrics
//   const timeElapsed = startTime ? (Date.now() - startTime) / (1000 * 60) : 0; // in minutes
//   const timeRemaining = Math.max(0, 5 - timeElapsed);
//   const averageScore = responses.length > 0 ? responses.reduce((sum, r) => sum + (r.analysis.score || 5), 0) / responses.length : 5;
//   const correctAnswers = responses.filter(r => r.analysis.isCorrect === true).length;
//   const focusAreasCovered = responses.map(r => r.question.focus_area);
  
//   const conversationHistory = responses.map((r, i) => {
//     return `Q${i+1} (${r.question.focus_area}): ${r.question.question}
// A${i+1}: ${r.answer}
// Score: ${r.analysis.score || 'N/A'}/10 (${r.analysis.quality})
// Correct: ${r.analysis.isCorrect ? 'Yes' : 'No'}
// Response Time: ${r.responseTime || 'N/A'}s
// ---`;
//   }).join('\n');
  
//   const lastResponse = responses.length > 0 ? responses[responses.length - 1] : null;
//   const lastAnalysis = lastResponse ? lastResponse.analysis : { quality: 'medium', score: 5 };
  
//   // Determine position type from job description
//   const getPositionType = (jobDesc) => {
//     const technical = ['developer', 'engineer', 'programmer', 'software', 'data scientist', 'devops', 'frontend', 'backend', 'fullstack'];
//     const business = ['manager', 'analyst', 'consultant', 'director', 'coordinator', 'administrator', 'operations'];
//     const creative = ['designer', 'writer', 'marketer', 'content', 'creative', 'brand', 'social media'];
    
//     const desc = jobDesc.toLowerCase();
//     if (technical.some(term => desc.includes(term))) return 'technical';
//     if (business.some(term => desc.includes(term))) return 'business';
//     if (creative.some(term => desc.includes(term))) return 'creative';
//     return 'general';
//   };
  
//   const positionType = getPositionType(jobDescription);
  
//   const prompt = `
// You are an expert adaptive assessment engine. Generate the next question based on candidate performance, time constraints, and job requirements.

// ASSESSMENT CONTEXT:
// Resume: ${resumeText || 'No resume provided'}
// Job Description: ${jobDescription}
// Position Type: ${positionType}
// Current Question: ${questionCount + 1} of ${maxQuestions}
// Time Elapsed: ${timeElapsed.toFixed(1)} minutes (Max: 5 minutes)
// Time Remaining: ${timeRemaining.toFixed(1)} minutes
// Average Performance: ${averageScore.toFixed(1)}/10
// Areas Already Covered: ${focusAreasCovered.join(', ') || 'None'}
// Correct Answers: ${correctAnswers}/${responses.length} (${responses.length > 0 ? ((correctAnswers/responses.length)*100).toFixed(0) : 0}%)

// PREVIOUS CONVERSATION:
// ${conversationHistory || 'No previous responses'}

// LAST RESPONSE ANALYSIS:
// ${lastResponse ? `
// - Quality: ${lastAnalysis.quality}
// - Score: ${lastAnalysis.score}/10
// - Correct: ${lastAnalysis.isCorrect ? 'Yes' : 'No'}
// - UI Feedback Given: "${lastAnalysis.ui_feedback || lastAnalysis.reasoning}"
// ` : 'First question - no previous analysis'}

// AVAILABLE QUESTION TYPES:

// 1. **MCQ** - Multiple choice questions
// 2. **SHORT_ANSWER** - Brief text responses (2-3 sentences)
// MCQs- contains debug code,image bsed questions, scenario-based questions, and technical problem-solving,

// TIME-BASED ADAPTATION RULES:
// - If <2 minutes remaining: Prioritize MCQs for quick assessment
// - If <1 minute remaining: Only technical MCQs or quick scenario questions
// - If >3 minutes remaining: Mix of MCQs and short-answer questions
// - Adjust question complexity based on time pressure

// POSITION-SPECIFIC QUESTION TYPES:

// FOR TECHNICAL ROLES (Developer, Engineer, Data Scientist):
// - Code debugging MCQs
// - System design concepts
// - Algorithm complexity questions
// - Technology-specific scenarios
// - Best practices multiple choice

// FOR BUSINESS ROLES (Manager, Analyst, Consultant):
// - Strategic decision MCQs
// - Case study scenarios
// - Market analysis questions
// - Leadership situation choices
// - Process optimization problems

// FOR CREATIVE ROLES (Designer, Writer, Marketer):
// - Design principle MCQs
// - Creative process scenarios
// - Brand strategy questions
// - User experience choices
// - Campaign effectiveness problems

// ADAPTIVE STRATEGY WITH MCQs:

// If LAST RESPONSE was INCORRECT/LOW quality (1-4):
// - Provide an easier MCQ in the same domain to build confidence
// - Include explanatory follow-up for learning
// - Example MCQ: "Which of the following is the FIRST step in [process]? A) [option] B) [option] C) [option] D) [option]"

// If LAST RESPONSE was PARTIALLY CORRECT/MEDIUM quality (5-7):
// - Maintain similar difficulty level
// - Either dig deeper with MCQ or switch to new area
// - Example: "Based on your previous answer, which approach would be MOST effective? A) [option] B) [option] C) [option] D) [option]"

// If LAST RESPONSE was CORRECT/HIGH quality (8-10):
// - Increase difficulty or move to advanced concepts
// - Use scenario-based MCQs or multi-part questions
// - Example: "Excellent! Now for a more complex scenario: Given [situation], what would be your PRIMARY concern? A) [complex option] B) [complex option] C) [complex option] D) [complex option]"

// QUESTION FORMAT DECISION MATRIX:
// - Time Remaining > 3 min + High Performance = Short Answer (2-3 sentences)
// - Time Remaining > 3 min + Low Performance = MCQ with explanation
// - Time Remaining 2-3 min = MCQ only
// - Time Remaining < 2 min = Quick MCQ (technical facts)
// - Time Remaining < 1 min = True/False or single-word answers

// QUESTION GENERATION RULES:
// 1. Avoid repeating focus areas: ${focusAreasCovered.join(', ') || 'None covered yet'}
// 2. Match question type to remaining time
// 3. Align difficulty with performance trajectory
// 4. Ensure questions test job-critical competencies
// 5. Include industry-specific terminology and scenarios
// 6. For MCQs: Make distractors plausible but clearly wrong to experts
// 7. Provide immediate learning value regardless of answer

// Return ONLY a JSON object with this exact format:

// FOR MCQ QUESTIONS:
// {
//   "question": "Your adaptive question here with clear scenario/context",
//   "type": "mcq",
//   "options": [
//     {"letter": "A", "text": "First option", "isCorrect": false},
//     {"letter": "B", "text": "Second option", "isCorrect": true},
//     {"letter": "C", "text": "Third option", "isCorrect": false},
//     {"letter": "D", "text": "Fourth option", "isCorrect": false}
//   ],
//   "focus_area": "specific skill or competency being tested",
//   "reasoning": "why this question was chosen based on performance and time",
//   "difficulty": "easy|medium|hard",
//   "estimated_time": "30-60 seconds",
//   "explanation": "Brief explanation of correct answer for learning",
//   "ui_hint": "context for the UI about this question's purpose"
// }

// FOR SHORT ANSWER QUESTIONS:
// {
//   "question": "Your adaptive question requiring 2-3 sentence response",
//   "type": "short_answer",
//   "focus_area": "specific skill or competency being tested",
//   "reasoning": "why this question was chosen based on performance and time",
//   "difficulty": "easy|medium|hard",
//   "estimated_time": "60-120 seconds",
//   "expected_keywords": ["keyword1", "keyword2", "keyword3"],
//   "ui_hint": "context for the UI about this question's purpose"
// }

// Examples for MCQ:

//  Debug MCQ:
// {
//   "question": "What is the primary bug in this JavaScript function?",
//   "type": "debug_code",
//   "code": "function calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i <= items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
//   "language": "javascript",
//   "response_format": "mcq",
//   "options": [
//     {"letter": "A", "text": "Missing return statement", "isCorrect": false},
//     {"letter": "B", "text": "Array index out of bounds (i <= items.length)", "isCorrect": true},
//     {"letter": "C", "text": "Incorrect variable initialization", "isCorrect": false},
//     {"letter": "D", "text": "Wrong loop type used", "isCorrect": false}
//   ]
// }

// IMAGE-BASED QUESTIONS (Technical/Business/Creative Roles):
// Present an image (chart, diagram, design) and ask for analysis.
// Response can be MCQ (interpret data) or text (detailed analysis).

// Example Image MCQ:
// {
//   "question": "Based on this sales performance chart, what is the most concerning trend?",
//   "type": "image_analysis",
//   "image_url": "https://example.com/sales-chart.png",
//   "image_description": "A line chart showing quarterly sales from Q1 2023 to Q4 2024. Q1-Q3 2023 show steady growth (20%, 25%, 30%), Q4 2023 peaks at 35%, but 2024 shows decline: Q1 28%, Q2 22%, Q3 18%, Q4 15%.",
//   "response_format": "mcq",
//   "options": [
//     {"letter": "A", "text": "Seasonal fluctuations are normal", "isCorrect": false},
//     {"letter": "B", "text": "Consistent decline throughout 2024", "isCorrect": true},
//     {"letter": "C", "text": "Q4 2023 peak was unsustainable", "isCorrect": false},
//     {"letter": "D", "text": "Overall growth trend is positive", "isCorrect": false}
//   ]
// }


// Ensure the question is directly relevant to the ${positionType} position requirements and builds upon previous responses to create a cohesive assessment experience.
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text().trim();
    
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       const question = JSON.parse(jsonMatch[0]);
//       question.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
//       question.generated_at = new Date().toISOString();
//       return question;
//     }
    
//     throw new Error('No valid JSON found');
//   } catch (error) {
//     console.error('Error generating adaptive question:', error);
    
//     // Enhanced fallback with time-aware and position-specific questions
//     const shouldUseMCQ = timeRemaining < 3 || (lastAnalysis.quality === 'low');
//     const difficulty = lastAnalysis.quality === 'high' ? 'hard' : 
//                      lastAnalysis.quality === 'low' ? 'easy' : 'medium';
    
//     // Position-specific fallback questions
//     const fallbackQuestions = {
//       technical: {
//         mcq: {
//           question: "When debugging a performance issue in a web application, what should be your FIRST step?",
//           type: "mcq",
//           options: [
//             {"letter": "A", "text": "Optimize database queries immediately", "isCorrect": false},
//             {"letter": "B", "text": "Profile the application to identify bottlenecks", "isCorrect": true},
//             {"letter": "C", "text": "Increase server memory allocation", "isCorrect": false},
//             {"letter": "D", "text": "Rewrite the entire codebase", "isCorrect": false}
//           ],
//           focus_area: "technical problem-solving",
//           difficulty: difficulty,
//           estimated_time: "45 seconds",
//           explanation: "Profiling helps identify the actual bottlenecks before making optimizations",
//           ui_hint: "Testing systematic debugging approach"
//         },
//         short_answer: {
//           question: "Describe your approach to code review. What specific things do you look for and why?",
//           type: "short_answer",
//           focus_area: "code quality and collaboration",
//           difficulty: difficulty,
//           estimated_time: "90 seconds",
//           expected_keywords: ["functionality", "readability", "security", "performance", "standards"],
//           ui_hint: "Assessing code quality awareness and team collaboration"
//         }
//       },
//       business: {
//         mcq: {
//           question: "Your team's project is 20% over budget with 2 weeks remaining. What's your MOST strategic response?",
//           type: "mcq",
//           options: [
//             {"letter": "A", "text": "Cut all non-essential features immediately", "isCorrect": false},
//             {"letter": "B", "text": "Analyze remaining work vs. budget impact and present options", "isCorrect": true},
//             {"letter": "C", "text": "Request additional budget without alternatives", "isCorrect": false},
//             {"letter": "D", "text": "Continue as planned and address overrun later", "isCorrect": false}
//           ],
//           focus_area: "project management and decision-making",
//           difficulty: difficulty,
//           estimated_time: "60 seconds",
//           explanation: "Strategic analysis provides stakeholders with informed options for decision-making",
//           ui_hint: "Testing strategic thinking under pressure"
//         },
//         short_answer: {
//           question: "How do you handle competing priorities from different stakeholders? Provide a specific approach.",
//           type: "short_answer",
//           focus_area: "stakeholder management",
//           difficulty: difficulty,
//           estimated_time: "90 seconds",
//           expected_keywords: ["prioritize", "communicate", "negotiate", "criteria", "stakeholder"],
//           ui_hint: "Assessing conflict resolution and prioritization skills"
//         }
//       },
//       creative: {
//         mcq: {
//           question: "When designing for mobile-first, what should be your PRIMARY consideration?",
//           type: "mcq",
//           options: [
//             {"letter": "A", "text": "Making desktop version look good on mobile", "isCorrect": false},
//             {"letter": "B", "text": "User experience and touch interactions on small screens", "isCorrect": true},
//             {"letter": "C", "text": "Fitting all desktop content on mobile", "isCorrect": false},
//             {"letter": "D", "text": "Using the same layout with smaller fonts", "isCorrect": false}
//           ],
//           focus_area: "user experience design",
//           difficulty: difficulty,
//           estimated_time: "45 seconds",
//           explanation: "Mobile-first design prioritizes optimal user experience for touch interfaces and smaller screens",
//           ui_hint: "Testing understanding of responsive design principles"
//         },
//         short_answer: {
//           question: "Describe your creative process from initial brief to final deliverable. What are your key steps?",
//           type: "short_answer",
//           focus_area: "creative process and methodology",
//           difficulty: difficulty,
//           estimated_time: "90 seconds",
//           expected_keywords: ["research", "ideation", "concept", "iteration", "feedback"],
//           ui_hint: "Assessing structured creative thinking and process"
//         }
//       },
//       general: {
//         mcq: {
//           question: "When facing a tight deadline with unclear requirements, what's your BEST first action?",
//           type: "mcq",
//           options: [
//             {"letter": "A", "text": "Start working immediately with best assumptions", "isCorrect": false},
//             {"letter": "B", "text": "Clarify requirements and prioritize critical elements", "isCorrect": true},
//             {"letter": "C", "text": "Ask for a deadline extension", "isCorrect": false},
//             {"letter": "D", "text": "Delegate the task to someone else", "isCorrect": false}
//           ],
//           focus_area: "problem-solving and communication",
//           difficulty: difficulty,
//           estimated_time: "45 seconds",
//           explanation: "Clarifying requirements prevents wasted effort and ensures you're solving the right problem",
//           ui_hint: "Testing practical problem-solving approach"
//         },
//         short_answer: {
//           question: "Tell me about a time you had to learn something completely new for work. How did you approach it?",
//           type: "short_answer",
//           focus_area: "learning and adaptability",
//           difficulty: difficulty,
//           estimated_time: "90 seconds",
//           expected_keywords: ["research", "practice", "resources", "apply", "result"],
//           ui_hint: "Assessing learning agility and self-development"
//         }
//       }
//     };
    
//     const positionQuestions = fallbackQuestions[positionType] || fallbackQuestions.general;
//     const questionType = shouldUseMCQ ? 'mcq' : 'short_answer';
//     const fallbackQuestion = positionQuestions[questionType];
    
//     return {
//       id: Date.now().toString(36) + Math.random().toString(36).substr(2),
//       reasoning: `Fallback ${questionType} question for ${positionType} role with ${difficulty} difficulty`,
//       generated_at: new Date().toISOString(),
//       ...fallbackQuestion
//     };
//   }
// };

// // Generate comprehensive feedback based on all responses
// const generateComprehensiveFeedback = async (assessmentData) => {
//   const { responses, resumeText, jobDescription } = assessmentData;
  
//   // Separate MCQ and text responses for different analysis
//   const mcqResponses = responses.filter(r => r.analysis.analysisType === 'mcq');
//   const textResponses = responses.filter(r => r.analysis.analysisType === 'text');
  
//   // Calculate comprehensive statistics
//   const totalQuestions = responses.length;
//   const averageScore = responses.reduce((sum, r) => sum + (r.analysis.score || 5), 0) / responses.length;
  
//   // MCQ-specific stats
//   const mcqCorrect = mcqResponses.filter(r => r.analysis.isCorrect === true).length;
//   const mcqAccuracy = mcqResponses.length > 0 ? (mcqCorrect / mcqResponses.length) * 100 : 0;
//   const averageMcqTime = mcqResponses.length > 0 ? 
//     mcqResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / mcqResponses.length : 0;
  
//   // Text response stats
//   const textHighQuality = textResponses.filter(r => r.analysis.quality === 'high').length;
//   const textQualityRate = textResponses.length > 0 ? (textHighQuality / textResponses.length) * 100 : 0;
  
//   // Performance distribution
//   const qualityCounts = responses.reduce((acc, r) => {
//     if (r.analysis.analysisType === 'mcq') {
//       const quality = r.analysis.isCorrect ? 'high' : 'low';
//       acc[quality] = (acc[quality] || 0) + 1;
//     } else {
//       acc[r.analysis.quality] = (acc[r.analysis.quality] || 0) + 1;
//     }
//     return acc;
//   }, {});
  
//   // Focus areas analysis
//   const focusAreas = responses.reduce((acc, r) => {
//     const area = r.question.focus_area;
//     if (!acc[area]) {
//       acc[area] = { total: 0, correct: 0, avgScore: 0 };
//     }
//     acc[area].total += 1;
//     acc[area].avgScore += r.analysis.score || 5;
//     if (r.analysis.isCorrect === true || r.analysis.quality === 'high') {
//       acc[area].correct += 1;
//     }
//     return acc;
//   }, {});
  
//   // Calculate area performance
//   Object.keys(focusAreas).forEach(area => {
//     focusAreas[area].avgScore = focusAreas[area].avgScore / focusAreas[area].total;
//     focusAreas[area].successRate = (focusAreas[area].correct / focusAreas[area].total) * 100;
//   });
  
//   // Build conversation summary with mixed formats
//   const conversationSummary = responses.map((r, i) => {
//     if (r.analysis.analysisType === 'mcq') {
//       return `Q${i+1} (MCQ - ${r.question.focus_area}): ${r.analysis.isCorrect ? 'CORRECT' : 'INCORRECT'} (${r.analysis.score}/10)
// Selected: ${r.analysis.selectedOption} | Correct: ${r.analysis.correctOption}
// Time: ${r.responseTime || 'N/A'}s`;
//     } else {
//       return `Q${i+1} (Text - ${r.question.focus_area}): ${r.analysis.quality.toUpperCase()} quality (${r.analysis.score}/10)
// Response: ${r.answer.substring(0, 100)}...
// Strengths: ${r.analysis.strengths?.join(', ') || 'N/A'}`;
//     }
//   }).join('\n\n');

//   const prompt = `
// You are an expert assessment evaluator providing comprehensive feedback for a mixed-format AI assessment (MCQ + text responses).

// ASSESSMENT OVERVIEW:
// Job Description: ${jobDescription}
// Candidate Resume: ${resumeText ? 'Provided' : 'Not provided'}
// Total Questions: ${totalQuestions}
// Question Types: ${mcqResponses.length} MCQ, ${textResponses.length} Text
// Overall Average Score: ${averageScore.toFixed(1)}/10

// MCQ PERFORMANCE:
// - Accuracy: ${mcqCorrect}/${mcqResponses.length} correct (${mcqAccuracy.toFixed(0)}%)
// - Average Response Time: ${averageMcqTime.toFixed(1)}s
// - Focus Areas Tested: ${mcqResponses.map(r => r.question.focus_area).join(', ')}

// TEXT RESPONSE PERFORMANCE:  
// - High Quality Responses: ${textHighQuality}/${textResponses.length} (${textQualityRate.toFixed(0)}%)
// - Focus Areas Covered: ${textResponses.map(r => r.question.focus_area).join(', ')}

// PERFORMANCE BY FOCUS AREA:
// ${Object.entries(focusAreas).map(([area, stats]) => 
//   `- ${area}: ${stats.correct}/${stats.total} successful (${stats.successRate.toFixed(0)}%), avg score ${stats.avgScore.toFixed(1)}/10`
// ).join('\n')}

// DETAILED RESPONSE ANALYSIS:
// ${conversationSummary}

// Create comprehensive feedback that includes:

// **Overall Performance Summary**
// [2-3 sentences covering both MCQ accuracy and text response quality, mentioning the average score and key highlights]

// **🎯 Strengths Demonstrated**
// • **[Strength Category]:** [Specific examples from both MCQ and text responses]
// • **[Strength Category]:** [Evidence from assessment performance]  
// • **[Strength Category]:** [Skills shown across question types]

// **📈 Areas for Development**
// • **[Area]:** [Specific recommendations based on MCQ mistakes or text response gaps]
// • **[Area]:** [Actionable advice for improvement]
// • **[Area]:** [Growth opportunities identified]

// **🎭 Assessment Format Performance**
// • **Multiple Choice:** ${mcqAccuracy.toFixed(0)}% accuracy with ${averageMcqTime.toFixed(1)}s average response time
// • **Open Response:** ${textQualityRate.toFixed(0)}% high-quality responses showing ${textResponses.length > 0 ? 'good' : 'limited'} communication skills

// **💼 Job Fit Assessment**
// [2-3 sentences analyzing alignment with role requirements, mentioning strongest areas and gaps to address]

// **🚀 Next Steps for Growth**
// • **Knowledge Areas:** [Based on MCQ mistakes and knowledge gaps]
// • **Communication Skills:** [Based on text response quality and depth]
// • **Interview Preparation:** [Specific advice for future assessments/interviews]

// FORMATTING REQUIREMENTS:
// - Use **bold** for section headers and key terms
// - Include specific percentages and metrics
// - Reference both MCQ and text performance
// - Keep total length 250-350 words
// - Make recommendations actionable and specific
// - Maintain encouraging but honest tone

// Focus on how the mixed assessment format provided a comprehensive view of their capabilities across both knowledge recall (MCQ) and communication/reasoning (text responses).
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     return result.response.text().trim();
//   } catch (error) {
//     console.error('Error generating comprehensive feedback:', error);
    
//     // Enhanced fallback that handles mixed assessment
//     const performanceLevel = averageScore >= 7 ? 'strong' : averageScore >= 5 ? 'solid' : 'developing';
    
//     return `**Overall Performance Summary**

// You demonstrated ${performanceLevel} performance with an average score of ${averageScore.toFixed(1)}/10 across ${totalQuestions} questions. Your assessment included ${mcqResponses.length} multiple choice questions (${mcqAccuracy.toFixed(0)}% accuracy) and ${textResponses.length} open-ended responses.

// **🎯 Strengths Demonstrated**

// • **Knowledge Application:** ${mcqCorrect > 0 ? `Correctly answered ${mcqCorrect} out of ${mcqResponses.length} multiple choice questions` : 'Engaged thoughtfully with assessment questions'}
// • **Communication Skills:** ${textHighQuality > 0 ? `Provided ${textHighQuality} high-quality detailed responses` : 'Showed good engagement with open-ended questions'}
// • **Time Management:** ${averageMcqTime < 60 ? 'Efficient response times on multiple choice questions' : 'Thoughtful consideration of questions'}

// **📈 Areas for Development**

// • **Knowledge Gaps:** ${mcqResponses.length - mcqCorrect > 0 ? `Review concepts from ${mcqResponses.length - mcqCorrect} missed questions` : 'Continue building domain expertise'}
// • **Response Depth:** ${textResponses.length - textHighQuality > 0 ? 'Include more specific examples and quantifiable outcomes' : 'Maintain current level of detail'}
// • **Assessment Strategy:** Practice both quick recall and detailed explanations for comprehensive evaluation

// **🎭 Assessment Format Performance**

// • **Multiple Choice:** ${mcqAccuracy.toFixed(0)}% accuracy demonstrates ${mcqAccuracy >= 70 ? 'good' : 'developing'} foundational knowledge
// • **Open Response:** ${textQualityRate.toFixed(0)}% high-quality responses show ${textQualityRate >= 60 ? 'strong' : 'developing'} communication abilities

// **💼 Job Fit Assessment**

// Based on your mixed-format performance, you show ${averageScore >= 6 ? 'good alignment' : 'foundational capabilities'} for this role. Your strongest areas appear to be in ${Object.entries(focusAreas).sort((a,b) => b[1].successRate - a[1].successRate)[0]?.[0] || 'core competencies'}.

// **🚀 Next Steps for Growth**

// • **Knowledge Areas:** Focus on concepts from missed multiple choice questions and study industry best practices
// • **Communication Skills:** Practice the STAR method for behavioral questions and include specific metrics in examples  
// • **Interview Preparation:** Prepare for both quick-fire knowledge questions and detailed scenario discussions`;
//   }
// };

// // Configure multer with better storage handling
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = 'uploads/audio/';
//     // Ensure directory exists
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     // Generate unique filename with proper extension
//     const timestamp = Date.now();
//     const extension = path.extname(file.originalname) || '.webm';
//     cb(null, `audio_${timestamp}${extension}`);
//   }
// });

// const uploadW = multer({
//   storage: storage,
//   limits: {
//     fileSize: 25 * 1024 * 1024, // 25MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     console.log('File received:', {
//       originalname: file.originalname,
//       mimetype: file.mimetype,
//       size: file.size
//     });
    
//     // Accept audio files
//     if (file.mimetype.startsWith('audio/') || 
//         file.originalname.endsWith('.webm') || 
//         file.originalname.endsWith('.wav') || 
//         file.originalname.endsWith('.mp3')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only audio files are allowed'));
//     }
//   }
// });




// // Main Whisper transcription endpoint
// app.post('/api/transcribe-whisper', uploadW.single('audio'), async (req, res) => {
//   let tempFilePath = null;
  
//   try {
//     console.log('=== Transcription Request Started ===');
    
//     if (!req.file) {
//       return res.status(400).json({ error: 'No audio file provided' });
//     }

//     const audioFile = req.file;
//     console.log('File details:', {
//       originalname: audioFile.originalname,
//       filename: audioFile.filename,
//       path: audioFile.path,
//       size: audioFile.size,
//       mimetype: audioFile.mimetype
//     });

//     // Validate file size
//     if (audioFile.size < 1024) { // Less than 1KB
//       console.log('File too small, cleaning up');
//       fs.unlinkSync(audioFile.path);
//       return res.status(400).json({ error: 'Audio file too small' });
//     }

//     // Verify the file exists
//     if (!fs.existsSync(audioFile.path)) {
//       console.error('Uploaded file not found:', audioFile.path);
//       return res.status(500).json({ error: 'Uploaded file not found' });
//     }

//     console.log('File exists, size:', audioFile.size, 'bytes');

//     try {
//       // Method 1: Direct file stream (recommended)
//       console.log('Creating file stream for OpenAI...');
      
//       const transcription = await openai.audio.transcriptions.create({
//         file: fs.createReadStream(audioFile.path),
//         model: 'whisper-1',
//         language: 'en',
//         response_format: 'text',
//         temperature: 0.2,
//       });

//       console.log('Whisper transcription successful');
//       console.log('Transcription result:', transcription);

//       // Clean up the uploaded file
//       fs.unlinkSync(audioFile.path);

//       // Return the transcription
//       res.json({
//         success: true,
//         text: transcription.trim(),
//         fileSize: audioFile.size,
//         originalName: audioFile.originalname
//       });

//     } catch (openaiError) {
//       console.error('OpenAI Whisper API error:', openaiError);
      
//       // Try alternative method with file buffer
//       console.log('Trying alternative method with file buffer...');
      
//       try {
//         const fileBuffer = fs.readFileSync(audioFile.path);
//         const blob = new Blob([fileBuffer], { type: audioFile.mimetype || 'audio/webm' });
        
//         // Create a temporary file with proper extension
//         const extension = path.extname(audioFile.originalname) || '.webm';
//         tempFilePath = path.join(path.dirname(audioFile.path), `temp_${Date.now()}${extension}`);
//         fs.writeFileSync(tempFilePath, fileBuffer);
        
//         console.log('Created temporary file:', tempFilePath);
        
//         const transcription = await openai.audio.transcriptions.create({
//           file: fs.createReadStream(tempFilePath),
//           model: 'whisper-1',
//           language: 'en',
//           response_format: 'text',
//           temperature: 0.2,
//         });

//         console.log('Alternative method successful');
        
//         // Clean up files
//         fs.unlinkSync(audioFile.path);
//         fs.unlinkSync(tempFilePath);

//         res.json({
//           success: true,
//           text: transcription.trim(),
//           fileSize: audioFile.size,
//           method: 'alternative'
//         });

//       } catch (alternativeError) {
//         console.error('Alternative method also failed:', alternativeError);
        
//         // Handle specific OpenAI errors
//         if (openaiError.code === 'invalid_request_error') {
//           return res.status(400).json({ 
//             error: 'Invalid audio format or file corrupted',
//             details: openaiError.message 
//           });
//         }

//         return res.status(500).json({ 
//           error: 'Transcription service error',
//           details: openaiError.message,
//           alternativeError: alternativeError.message
//         });
//       }
//     }

//   } catch (error) {
//     console.error('Transcription endpoint error:', error);
    
//     // Clean up files if they exist
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
//     if (tempFilePath && fs.existsSync(tempFilePath)) {
//       fs.unlinkSync(tempFilePath);
//     }

//     res.status(500).json({ 
//       error: 'Server error during transcription',
//       details: error.message 
//     });
//   }
// });

// // Health check endpoint for debugging
// app.get('/api/transcribe-health', (req, res) => {
//   const uploadDir = 'uploads/audio/';
//   const dirExists = fs.existsSync(uploadDir);
  
//   res.json({
//     status: 'healthy',
//     uploadDirectory: uploadDir,
//     directoryExists: dirExists,
//     openaiConfigured: !!process.env.OPENAI_API_KEY,
//     timestamp: new Date().toISOString()
//   });
// });

// // Endpoint to test file upload without transcription
// app.post('/api/test-upload', uploadW.single('audio'), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const fileInfo = {
//       originalname: req.file.originalname,
//       filename: req.file.filename,
//       path: req.file.path,
//       size: req.file.size,
//       mimetype: req.file.mimetype,
//       exists: fs.existsSync(req.file.path)
//     };

//     console.log('Test upload successful:', fileInfo);

//     // Clean up test file
//     if (fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }

//     res.json({
//       success: true,
//       message: 'File upload test successful',
//       fileInfo: fileInfo
//     });

//   } catch (error) {
//     console.error('Test upload error:', error);
//     res.status(500).json({ 
//       error: 'Test upload failed',
//       details: error.message 
//     });
//   }
// });




// // Start interview with resume and job description
// app.post('/start-assesment', upload.single('resume'), async (req, res) => {
//   try {
//     const { jobDescription } = req.body;
//     let resumeText = '';
    
//     // Parse resume if uploaded
//     if (req.file) {
//       const pdfData = await pdfParse(req.file.buffer);
//       resumeText = pdfData.text;
//     }

//     // Generate first question
//     const firstQuestion = await generateInitialQuestion(resumeText, jobDescription);
    
//     // Reset interview session
//     currentInterview = {
//       resumeText,
//       jobDescription,
//       currentQuestion: firstQuestion,
//       questionCount: 1,
//       maxQuestions: 5,
//       responses: [],
//       interviewContext: '',
//       candidateProfile: '',
//       finished: false
//     };

//     res.json({ 
//       success: true, 
//       question: firstQuestion,
//       questionNumber: 1,
//       totalQuestions: currentInterview.maxQuestions,
//       isAdaptive: true
//     });

//   } catch (error) {
//     console.error('Error starting interview:', error);
//     res.status(500).json({ error: 'Failed to start interview' });
//   }
// });

// app.post('/start-interview', upload.single('resume'), async (req, res) => {
//   try {
//     const { jobDescription } = req.body;
//     let resumeText = '';
    
//     // Parse resume if uploaded
//     if (req.file) {
//       const pdfData = await pdfParse(req.file.buffer);
//       resumeText = pdfData.text;
//     }

//     // Generate first question
//     const firstQuestion = await generateInitialQuestion(resumeText, jobDescription);
    
//     // Reset interview session
//     currentInterview = {
//       resumeText:resumeText,
//       jobDescription : jobDescription,
//       currentQuestion: firstQuestion,
//       questionCount: 1,
//       maxQuestions: 5,
//       responses: [],
//       interviewContext: '',
//       candidateProfile: '',
//       finished: false
//     };

//     res.json({ 
//       success: true, 
//       question: firstQuestion,
//       questionNumber: 1,
//       totalQuestions: currentInterview.maxQuestions,
//       isAdaptive: true
//     });

//   } catch (error) {
//     console.error('Error starting interview:', error);
//     res.status(500).json({ error: 'Failed to start interview' });
//   }
// });

// // Submit answer and get adaptive next question
// // Enhanced submit-answer endpoint
// app.post('/submit-answer', async (req, res) => {
//   try {
//     const { answer, responseTime, questionType } = req.body;
    
//     if (!answer || !answer.trim()) {
//       return res.status(400).json({ error: 'Answer is required' });
//     }
    
//     // Use enhanced analysis that handles both MCQ and text
//     const analysis = await analyzeResponse(
//       currentInterview.currentQuestion, 
//       answer.trim(),
//       responseTime
//     );
    
//     // Store the response with enhanced data
//     currentInterview.responses.push({
//       question: currentInterview.currentQuestion,
//       answer: answer.trim(),
//       analysis: analysis,
//       responseTime: responseTime,
//       timestamp: new Date().toISOString()
//     });

//     // Check if interview should end
//     if (currentInterview.questionCount >= currentInterview.maxQuestions) {
//       // Generate enhanced feedback for mixed assessment
//       const feedback = await generateComprehensiveFeedback(currentInterview);
      
//       currentInterview.finished = true;
      
//       // Calculate comprehensive statistics
//       const mcqResponses = currentInterview.responses.filter(r => r.analysis.analysisType === 'mcq');
//       const textResponses = currentInterview.responses.filter(r => r.analysis.analysisType === 'text');
//       const correctAnswers = currentInterview.responses.filter(r => 
//         r.analysis.isCorrect === true || r.analysis.quality === 'high'
//       ).length;
//       const averageScore = currentInterview.responses.reduce((acc, r) => acc + r.analysis.score, 0) / currentInterview.responses.length;
      
//       return res.json({
//         finished: true,
//         feedback: feedback,
//         overallStats: {
//           totalQuestions: currentInterview.responses.length,
//           averageScore: Math.round(averageScore * 10) / 10,
//           correctAnswers: correctAnswers,
//           mcqStats: {
//             total: mcqResponses.length,
//             correct: mcqResponses.filter(r => r.analysis.isCorrect === true).length,
//             accuracy: mcqResponses.length > 0 ? Math.round((mcqResponses.filter(r => r.analysis.isCorrect === true).length / mcqResponses.length) * 100) : 0
//           },
//           textStats: {
//             total: textResponses.length,
//             highQuality: textResponses.filter(r => r.analysis.quality === 'high').length,
//             qualityRate: textResponses.length > 0 ? Math.round((textResponses.filter(r => r.analysis.quality === 'high').length / textResponses.length) * 100) : 0
//           },
//           focusAreas: currentInterview.responses.reduce((acc, r) => {
//             const area = r.question.focus_area;
//             if (!acc[area]) acc[area] = { correct: 0, total: 0 };
//             acc[area].total += 1;
//             if (r.analysis.isCorrect === true || r.analysis.quality === 'high') {
//               acc[area].correct += 1;
//             }
//             return acc;
//           }, {})
//         }
//       });
//     }

//     // Generate next adaptive question
//     const nextQuestion = await generateAdaptiveQuestion(currentInterview);
//     currentInterview.currentQuestion = nextQuestion;
//     currentInterview.questionCount++;

//     res.json({
//       success: true,
//       nextQuestion: nextQuestion,
//       questionNumber: currentInterview.questionCount,
//       totalQuestions: currentInterview.maxQuestions,
//       previousAnalysis: {
//         quality: analysis.quality,
//         ui_feedback: analysis.ui_feedback,
//         isCorrect: analysis.isCorrect,
//         score: analysis.score,
//         explanation: analysis.explanation,
//         analysisType: analysis.analysisType,
//         selectedOption: analysis.selectedOption,
//         correctOption: analysis.correctOption,
//         responseTime: analysis.responseTime,
//         strengths: analysis.strengths,
//         improvements: analysis.improvements
//       }
//     });

//   } catch (error) {
//     console.error('Error processing answer:', error);
//     res.status(500).json({ error: 'Failed to process answer' });
//   }
// });

// // Get current interview status
// app.get('/interview-status', (req, res) => {
//   res.json({
//     questionNumber: currentInterview.questionCount,
//     totalQuestions: currentInterview.maxQuestions,
//     finished: currentInterview.finished,
//     currentQuestion: currentInterview.currentQuestion,
//     responsesCount: currentInterview.responses.length
//   });
// });

// // Reset interview
// app.post('/reset-interview', (req, res) => {
//   currentInterview = {
//     resumeText: '',
//     jobDescription: '',
//     currentQuestion: null,
//     questionCount: 0,
//     maxQuestions: 5,
//     responses: [],
//     interviewContext: '',
//     candidateProfile: '',
//     finished: false
//   };
//   res.json({ success: true, message: 'Interview reset successfully' });
// });







// //interview backend server setup

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });



// // const evaluateResponse = (transcript, question, questionIndex) => {
// //   // Basic keyword analysis for demonstration
// //   const keywords = {
// //     0: ['experience', 'background', 'skills', 'work', 'career'], // Tell me about yourself
// //     1: ['technical', 'programming', 'leadership', 'problem', 'project'], // Skills question
// //     2: ['challenge', 'difficult', 'solution', 'overcome', 'learn'] // Challenging project
// //   };

// //   const questionKeywords = keywords[questionIndex] || [];
// //   const transcriptLower = transcript.toLowerCase();
  
// //   let score = 0;
// //   let matchedKeywords = [];
  
// //   // Check for relevant keywords
// //   questionKeywords.forEach(keyword => {
// //     if (transcriptLower.includes(keyword)) {
// //       score += 1;
// //       matchedKeywords.push(keyword);
// //     }
// //   });

// //   // Calculate percentage score
// //   const maxScore = questionKeywords.length;
// //   const percentageScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

// //   // Generate feedback based on score
// //   let feedback = '';
// //   let suggestions = [];

// //   if (percentageScore >= 80) {
// //     feedback = "Excellent response! You covered the key points very well.";
// //   } else if (percentageScore >= 60) {
// //     feedback = "Good response with room for improvement.";
// //     suggestions.push("Try to include more specific examples");
// //   } else if (percentageScore >= 40) {
// //     feedback = "Fair response, but could be more comprehensive.";
// //     suggestions.push("Include more relevant details");
// //     suggestions.push("Focus on specific achievements");
// //   } else {
// //     feedback = "Your response could benefit from more detail and relevance.";
// //     suggestions.push("Address the question more directly");
// //     suggestions.push("Include specific examples from your experience");
// //   }

// //   // Check response length
// //   const wordCount = transcript.split(' ').length;
// //   if (wordCount < 20) {
// //     suggestions.push("Try to provide more detailed responses");
// //   } else if (wordCount > 200) {
// //     suggestions.push("Consider being more concise in your answers");
// //   }

// //   return {
// //     score: percentageScore,
// //     feedback,
// //     suggestions,
// //     matchedKeywords,
// //     wordCount,
// //     analysis: {
// //       relevance: percentageScore,
// //       length: wordCount < 20 ? 'Too short' : wordCount > 200 ? 'Too long' : 'Good length',
// //       keyPoints: matchedKeywords.length
// //     }
// //   };
// // };

// // const generateFollowUp = (transcript, questionIndex) => {
// //   const followUpQuestions = {
// //     0: [
// //       "Can you elaborate on a specific achievement from your background?",
// //       "What motivated you to pursue this career path?",
// //       "How do your experiences align with our company's values?"
// //     ],
// //     1: [
// //       "Can you give me a specific example of when you used these skills?",
// //       "How do you stay updated with the latest industry trends?",
// //       "What's one skill you'd like to develop further?"
// //     ],
// //     2: [
// //       "What was the most important lesson you learned from that project?",
// //       "How did you handle team dynamics during challenging times?",
// //       "What would you do differently if faced with a similar situation?"
// //     ]
// //   };

// //   const questions = followUpQuestions[questionIndex] || [];
// //   return questions[Math.floor(Math.random() * questions.length)];
// // };

// // Main endpoint

// // Add this to your existing server.js file

// // Enhanced conversation state management
// let conversationState = {
//   currentQuestionIndex: 0,
//   totalQuestions: 5,
//   previousResponses: [],
//   interviewContext: '',
//   isFirstQuestion: true,
//   waitingForResponse: false
// };

// // Improved process response endpoint with better flow
// app.post('/api/process-response', async (req, res) => {
//   try {
//     const { transcript, questionIndex, question } = req.body;
    
//     console.log('Processing response:', { questionIndex, transcript: transcript.substring(0, 100) + '...' });

//     if (!transcript || !question || questionIndex == null) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Validate transcript quality
//     if (transcript.trim().length < 5) {
//       const clarificationResponse = "I didn't catch that clearly. Could you please elaborate a bit more on your answer?";
//       const audioBuffer = await generateTTS(clarificationResponse);
//       return sendAudioResponse(res, audioBuffer);
//     }

//     // Store the response
//     conversationState.previousResponses.push({
//       questionIndex,
//       question,
//       answer: transcript,
//       timestamp: new Date().toISOString()
//     });

//     // Determine conversation flow based on question index and response quality
//     let aiResponse = '';
    
//     if (questionIndex >= conversationState.totalQuestions - 1) {
//       // Final question - wrap up interview
//       aiResponse = await generateInterviewConclusion(conversationState.previousResponses);
//     } else {
//       // Generate natural transition and next question
//       aiResponse = await generateNaturalTransition(transcript, questionIndex, question);
//     }

//     const audioBuffer = await generateTTS(aiResponse);
//     sendAudioResponse(res, audioBuffer);

//   } catch (error) {
//     console.error("Error processing response:", error);
//     const errorResponse = "I apologize for the technical difficulty. Let's continue with the next question.";
//     const audioBuffer = await generateTTS(errorResponse);
//     sendAudioResponse(res, audioBuffer);
//   }
// });


// // Generate natural transition between questions
// const generateNaturalTransition = async (userResponse, questionIndex, currentQuestion) => {
//   const prompt = `
// You are conducting a professional job interview. You are an experienced, empathetic interviewer who handles all situations gracefully.

// CURRENT SITUATION:
// - Current Question: "${currentQuestion}"
// - Candidate's Response: "${userResponse}"
// - Question Number: ${questionIndex + 1}
// - Total Questions in Interview: 5

// ANALYZE THE CANDIDATE'S RESPONSE AND RESPOND APPROPRIATELY:

// IF they asked to repeat the question (words like "repeat", "again", "didn't catch", "pardon", "can you say that again"):
// - Politely acknowledge: "Of course!" or "Absolutely!"
// - Repeat the question clearly, maybe with slight rephrasing for clarity
// - Add encouragement: "Take your time with your response"
// - Example: "Of course! Let me repeat that for you. I asked: [question]. Please take your time to think about it."

// IF they asked for clarification (words like "clarify", "what do you mean", "don't understand", "can you explain"):
// - Acknowledge positively: "Great question!" or "I'm happy to clarify"
// - Rephrase the question with more context or examples
// - Encourage them: "Does that help?" or "Feel free to ask if you need more clarification"

// IF they mentioned technical issues (words like "audio", "sound", "hear", "technical", "connection"):
// - Show understanding: "No problem at all" or "That happens sometimes"
// - Ask if they can hear clearly now
// - Offer to repeat if needed
// - Be patient and supportive

// IF their response is very short or incomplete (less than 20 words, vague answers):
// - Acknowledge what they shared
// - Gently encourage elaboration: "Could you give me a specific example?" or "Can you tell me more about that?"
// - Help them understand what detail you're looking for

// IF they seem nervous or uncertain (lots of "um", "uh", "not sure", "I think", "maybe"):
// - Be encouraging and reassuring
// - Acknowledge their response positively
// - Provide gentle encouragement: "You're doing great" or "That's perfectly fine"
// - Help them feel more comfortable

// IF they went off-topic or didn't answer the question directly:
// - Politely acknowledge what they shared
// - Gently redirect: "I appreciate that context. Let me refocus the question..."
// - Rephrase the original question more clearly
// - Be tactful, not critical

// IF they gave a good, complete answer (normal response):
// - Give a brief, natural acknowledgment (1-2 sentences)
// - Vary your acknowledgments: "Thank you for that example", "That's really insightful", "I appreciate the detail", "That gives me good insight"
// - Smoothly indicate you're moving forward: "Great! Now let's move to our next question" or "Perfect. Let me ask you about another area"
// - Keep it 2-4 sentences total

// IMPORTANT GUIDELINES:
// - Always be professional, warm, and supportive
// - Sound like a real human interviewer, not robotic
// - Vary your language to avoid repetition
// - Match the energy and tone to the situation
// - Be patient with all types of responses
// - Focus on making the candidate feel comfortable
// - If unsure about their intent, err on the side of being helpful and supportive

// RESPONSE FORMAT:
// Provide your interviewer response as natural, conversational speech that would be spoken aloud. Do not include any labels, categories, or explanations - just the actual words you would say to the candidate.
// `;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         { 
//           role: "system", 
//           content: "You are a highly skilled, empathetic professional interviewer. You excel at reading candidate responses and adapting your communication style accordingly. You handle all interview situations with grace, patience, and professionalism. Your responses are natural, warm, and conversational - exactly what a human interviewer would say." 
//         },
//         { role: "user", content: prompt }
//       ],
//       temperature: 0.7,
//       max_tokens: 300
//     });

//     const transition = completion.choices[0].message.content.trim();
    
//     // Check if this was a special case that shouldn't advance the question
//     const isSpecialCase = userResponse.toLowerCase().includes('repeat') || 
//                          userResponse.toLowerCase().includes('clarify') ||
//                          userResponse.toLowerCase().includes('audio') ||
//                          userResponse.toLowerCase().includes('technical') ||
//                          userResponse.toLowerCase().includes('didn\'t catch') ||
//                          userResponse.toLowerCase().includes('pardon') ||
//                          userResponse.length < 20;

//     return {
//       transition: transition,
//       isSpecialCase: isSpecialCase
//     };

//   } catch (error) {
//     console.error('Error generating transition:', error);
    
//     return {
//       transition: "Thank you for that response. Let me continue with our next question.",
//       isSpecialCase: false
//     };
//   }
// };

// // Generate interview conclusion
// const generateInterviewConclusion = async (responses) => {
//   const prompt = `
// The interview is ending. Based on these responses, provide a natural, professional conclusion:

// ${responses.map((r, i) => `Q${i+1}: ${r.question}\nA${i+1}: ${r.answer.substring(0, 200)}...`).join('\n\n')}

// Give a brief, warm conclusion that:
// 1. Thanks the candidate
// 2. Mentions next steps
// 3. Sounds natural and professional
// 4. Is 2-3 sentences max

// Example: "Thank you for taking the time to speak with me today. I've really enjoyed learning about your experience and background. We'll be in touch within the next few days to let you know about next steps."
// `;

//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         { role: "system", content: "You are a professional interviewer concluding an interview." },
//         { role: "user", content: prompt }
//       ],
//       temperature: 0.6,
//       max_tokens: 150
//     });

//     return completion.choices[0].message.content.trim();
//   } catch (error) {
//     console.error('Error generating conclusion:', error);
//     return "Thank you for your time today. I've enjoyed our conversation and learning about your background. We'll be in touch soon regarding next steps.";
//   }
// };

// // Generate TTS audio
// const generateTTS = async (text) => {
//   try {
//     const speechResponse = await openai.audio.speech.create({
//       model: "tts-1",
//       voice: "nova", // Professional female voice
//       input: text,
//       speed: 1 // Slightly slower for clarity
//     });

//     return Buffer.from(await speechResponse.arrayBuffer());
//   } catch (error) {
//     console.error('TTS Error:', error);
//     throw error;
//   }
// };

// // Send audio response
// const sendAudioResponse = (res, audioBuffer) => {
//   res.set({
//     'Content-Type': 'audio/mpeg',
//     'Content-Disposition': 'inline; filename="response.mp3"',
//     'Cache-Control': 'no-cache'
//   });
//   res.send(audioBuffer);
// };

// // New endpoint for initial question with better introduction
// app.post('/api/start-interview-audio', async (req, res) => {
//   try {
//     const { interviewData } = req.body;
    
//     // Get the AI-generated question from your currentInterview state
//     // (assuming /start-interview was called first to generate the question)
//     const firstQuestion = currentInterview.currentQuestion?.question || 
//       interviewData?.question?.question || 
//       "Let's start with you telling me about yourself and what brings you to this opportunity today.";

//     const introText = `Hello! Welcome to your interview. I'm excited to learn more about you and your background. Let's begin with our first question: ${firstQuestion}`;
    
//     console.log('First question from AI:', firstQuestion);
    
//     const audioBuffer = await generateTTS(introText);
    
//     // Save to temporary file and return URL
//     const fileName = `interview_start_${Date.now()}.mp3`;
//     const filePath = path.join(__dirname, 'temp_audio', fileName);
    
//     // Ensure directory exists
//     if (!fs.existsSync(path.join(__dirname, 'temp_audio'))) {
//       fs.mkdirSync(path.join(__dirname, 'temp_audio'), { recursive: true });
//     }

//     fs.writeFileSync(filePath, audioBuffer);

//     res.json({ audioUrl: `/temp_audio/${fileName}` });
    
//     // Clean up file after 30 seconds
//     setTimeout(() => {
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     }, 30000);

//   } catch (error) {
//     console.error("Error starting interview audio:", error);
//     res.status(500).json({ error: "Failed to start interview audio" });
//   }
// });

// app.post('/next-question', async (req, res) => {
//   try {
//     const { userResponse } = req.body;
    
//     // Store the user's response if we have a current question
//     if (userResponse && currentInterview.currentQuestion) {
//       currentInterview.responses.push({
//         questionNumber: currentInterview.questionCount,
//         question: currentInterview.currentQuestion.question,
//         questionData: currentInterview.currentQuestion,
//         response: userResponse,
//         timestamp: new Date()
//       });
      
//       // Update interview context for better question generation
//       currentInterview.interviewContext += `Q${currentInterview.questionCount}: ${currentInterview.currentQuestion.question}\nA${currentInterview.questionCount}: ${userResponse}\n\n`;
//     }
    
//     // Generate natural transition that handles everything (using the LLM)
//     const transitionData = await generateNaturalTransition(
//       userResponse,
//       currentInterview.questionCount - 1,
//       currentInterview.currentQuestion.question
//     );
    
//     // Check if this was a special case (repeat, clarify, etc.)
//     // Handle both undefined and explicit isSpecialCase
//     if (transitionData.isSpecialCase === true) {
//       // Don't advance question count, just respond with the LLM's guidance
//       const audioBuffer = await generateTTS(transitionData.transition);
//       const fileName = `special_response_${Date.now()}.mp3`;
//       const filePath = path.join(__dirname, 'temp_audio', fileName);
      
//       if (!fs.existsSync(path.join(__dirname, 'temp_audio'))) {
//         fs.mkdirSync(path.join(__dirname, 'temp_audio'), { recursive: true });
//       }
      
//       fs.writeFileSync(filePath, audioBuffer);
      
//       return res.json({
//         success: true,
//         audioUrl: `/temp_audio/${fileName}`,
//         isSpecialResponse: true,
//         message: transitionData.transition,
//         currentQuestion: currentInterview.currentQuestion.question,
//         questionNumber: currentInterview.questionCount,
//         totalQuestions: currentInterview.maxQuestions
//       });
//     }
    
//     // Normal response - advance to next question
//     currentInterview.questionCount++;
    
//     // Check if interview is complete
//     if (currentInterview.questionCount > currentInterview.maxQuestions) {
//       currentInterview.finished = true;
      
//       const completionText = `${transitionData.transition} That completes our interview today. Thank you so much for your time and thoughtful responses. We'll be in touch soon regarding next steps. Have a wonderful day!`;
      
//       const audioBuffer = await generateTTS(completionText);
//       const fileName = `interview_complete_${Date.now()}.mp3`;
//       const filePath = path.join(__dirname, 'temp_audio', fileName);
      
//       if (!fs.existsSync(path.join(__dirname, 'temp_audio'))) {
//         fs.mkdirSync(path.join(__dirname, 'temp_audio'), { recursive: true });
//       }
      
//       fs.writeFileSync(filePath, audioBuffer);
      
//       return res.json({
//         success: true,
//         audioUrl: `/temp_audio/${fileName}`,
//         isComplete: true,
//         message: completionText,
//         interviewSummary: {
//           totalQuestions: currentInterview.questionCount - 1,
//           responses: currentInterview.responses
//         }
//       });
//     }
    
//     // Generate next adaptive question using AI
//     const nextQuestionData = await generateNextQuestion(
//       currentInterview.responses,
//       currentInterview.resumeText,
//       currentInterview.jobDescription,
//       currentInterview.questionCount
//     );
    
//     currentInterview.currentQuestion = nextQuestionData;
    
//     // Combine transition + new question
//     const fullResponse = `${transitionData.transition} ${nextQuestionData.question}`;
    
//     const audioBuffer = await generateTTS(fullResponse);
//     const fileName = `question_${currentInterview.questionCount}_${Date.now()}.mp3`;
//     const filePath = path.join(__dirname, 'temp_audio', fileName);
    
//     if (!fs.existsSync(path.join(__dirname, 'temp_audio'))) {
//       fs.mkdirSync(path.join(__dirname, 'temp_audio'), { recursive: true });
//     }
    
//     fs.writeFileSync(filePath, audioBuffer);
    
//     res.json({
//       success: true,
//       audioUrl: `/temp_audio/${fileName}`,
//       question: nextQuestionData.question,
//       questionData: nextQuestionData,
//       questionNumber: currentInterview.questionCount,
//       totalQuestions: currentInterview.maxQuestions,
//       isComplete: false,
//       transition: transitionData.transition
//     });
    
//     // Clean up files after 30 seconds
//     setTimeout(() => {
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     }, 30000);
    
//   } catch (error) {
//     console.error("Error processing response:", error);
//     res.status(500).json({ error: "Failed to process response" });
//   }
// });


// // Generate next question based on previous responses
// const generateNextQuestion = async (previousResponses, resumeText, jobDescription, questionCount) => {
// const prompt = `
// You are an expert AI interviewer conducting question ${questionCount} of 5. 

// CONTEXT:
// - Resume: ${resumeText || 'No resume provided'}
// - Job Description: ${jobDescription}
// - Previous Questions and Responses: ${JSON.stringify(previousResponses, null, 2)}

// Based on the candidate's previous responses and the job requirements, generate the NEXT most appropriate question that:
// 1. Builds on their previous answers or explores different competencies
// 2. Tests skills not yet covered thoroughly
// 3. Adapts to their experience level and background
// 4. Provides opportunity for specific examples and achievements

// QUESTION REQUIREMENTS:
// - Keep questions SHORT and DIRECT (maximum 25 words)
// - Ask ONE clear, focused question
// - Avoid compound or multi-part questions
// - Be conversational and natural
// - Focus on getting specific examples

// Return ONLY a JSON object:
// {
//   "question": "Your next tailored question here (maximum 25 words)",
//   "type": "behavioral|technical|situational|experience",
//   "focus_area": "specific skill or competency being tested",
//   "expected_depth": "what kind of detailed answer you're looking for",
//   "ui_hint": "brief explanation of why this question was chosen",
//   "follows_up_on": "what from their previous response this builds upon (if applicable)"
// }

// Examples of good short questions:
// - "Tell me about a time you had to meet a tight deadline."
// - "How do you handle disagreements with team members?"
// - "What's your biggest professional accomplishment?"
// - "Describe a challenge you overcame recently."
// - "How do you prioritize when everything seems urgent?"
// `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text().trim();
    
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[0]);
//     }
    
//     throw new Error('No valid JSON found');
//   } catch (error) {
//     console.error('Error generating next question:', error);
//     return {
//       question: "What specific strategies do you use to stay current with industry trends and continuously improve your skills?",
//       type: "experience",
//       focus_area: "continuous learning and adaptability",
//       expected_depth: "specific learning methods, recent examples, impact on work",
//       ui_hint: "Testing commitment to professional development"
//     };
//   }
// };



// // Enhanced text-to-speech endpoint with better error handling
// app.post('/api/text-to-speech', async (req, res) => {
//   try {
//     const { text } = req.body;
    
//     if (!text || text.trim().length === 0) {
//       return res.status(400).json({ error: 'Text is required' });
//     }

//     // Limit text length for better performance
//     const truncatedText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    
//     const audioBuffer = await generateTTS(truncatedText);
    
//     // Save to temporary file
//     const fileName = `speech_${Date.now()}.mp3`;
//     const filePath = path.join(__dirname, 'temp_audio', fileName);
    
//     // Ensure directory exists
//     if (!fs.existsSync(path.join(__dirname, 'temp_audio'))) {
//       fs.mkdirSync(path.join(__dirname, 'temp_audio'), { recursive: true });
//     }

//     fs.writeFileSync(filePath, audioBuffer);

//     res.json({ audioUrl: `/temp_audio/${fileName}` });
    
//     // Clean up file after 30 seconds
//     setTimeout(() => {
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     }, 30000);

//   } catch (error) {
//     console.error('Text to speech error:', error);
//     res.status(500).json({ error: 'Failed to generate speech' });
//   }
// });

// // Serve temporary audio files
// app.use('/temp_audio', express.static(path.join(__dirname, 'temp_audio')));

// // Interview status endpoint
// app.get('/api/interview-status', (req, res) => {
//   res.json({
//     currentQuestionIndex: conversationState.currentQuestionIndex,
//     totalQuestions: conversationState.totalQuestions,
//     responsesCount: conversationState.previousResponses.length,
//     isComplete: conversationState.currentQuestionIndex >= conversationState.totalQuestions,
//     waitingForResponse: conversationState.waitingForResponse
//   });
// });

// // Reset interview endpoint
// app.post('/api/reset-interview', (req, res) => {
//   conversationState = {
//     currentQuestionIndex: 0,
//     totalQuestions: 5,
//     previousResponses: [],
//     interviewContext: '',
//     isFirstQuestion: true,
//     waitingForResponse: false
//   };
  
//   res.json({ success: true, message: 'Interview reset successfully' });
// });

// // Cleanup old audio files periodically
// const cleanupAudioFiles = () => {
//   const audioDir = path.join(__dirname, 'temp_audio');
//   if (fs.existsSync(audioDir)) {
//     const files = fs.readdirSync(audioDir);
//     const now = Date.now();
//     const maxAge = 5 * 60 * 1000; // 5 minutes

//     files.forEach(file => {
//       const filePath = path.join(audioDir, file);
//       try {
//         const stats = fs.statSync(filePath);
//         if (now - stats.mtime.getTime() > maxAge) {
//           fs.unlinkSync(filePath);
//           console.log(`Cleaned up old audio file: ${file}`);
//         }
//       } catch (error) {
//         console.error(`Error cleaning up file ${file}:`, error);
//       }
//     });
//   }
// };

// // Run cleanup every 2 minutes
// setInterval(cleanupAudioFiles, 2 * 60 * 1000);

// // Enhanced error handling middleware
// app.use((error, req, res, next) => {
//   console.error('Server Error:', error);
//   res.status(500).json({ 
//     error: 'Internal server error',
//     message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//   });
// });

// console.log('✅ Enhanced interview endpoints loaded with improved conversation flow');


// // Add this to your server.js
// app.post('/api/generate-feedback', async (req, res) => {
//   try {
//     const { conversationHistory, interviewData, totalQuestions, questionsAnswered } = req.body;
    
//     console.log('Feedback request received:', {
//       historyLength: conversationHistory?.length,
//       questionsAnswered,
//       totalQuestions
//     });

//     // Simple test response first
//     const testFeedback = {
//       overallScore: 8,
//       performanceLevel: 'Good',
//       overallFeedback: 'You showed good communication skills and provided relevant examples. Keep working on providing more specific details in your responses.',
//       strengths: [
//         'Clear communication and good articulation',
//         'Provided relevant examples from experience',
//         'Showed enthusiasm for the role'
//       ],
//       improvements: [
//         'Include more specific metrics and numbers in examples',
//         'Structure responses using the STAR method',
//         'Research the company background more thoroughly'
//       ],
//       detailedScores: {
//         communication: 8,
//         technical: 7,
//         problemSolving: 7,
//         clarity: 8
//       },
//       nextSteps: 'Practice the STAR method for behavioral questions and prepare specific examples with quantifiable results.'
//     };

//     res.json(testFeedback);

//   } catch (error) {
//     console.error('Feedback generation error:', error);
//     res.status(500).json({ 
//       error: 'Failed to generate feedback',
//       message: error.message 
//     });
//   }
// });



// // Health check endpoint for feedback system
// app.get('/api/feedback-status', (req, res) => {
//   res.json({
//     status: 'OK',
//     message: 'Interview feedback system is operational',
//     timestamp: new Date().toISOString(),
//     features: {
//       aiAnalysis: true,
//       detailedScoring: true,
//       actionableAdvice: true
//     }
//   });
// });





// // Health check
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'Adaptive Interview Server is running',
//     timestamp: new Date().toISOString()
//   });
// });


// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`🚀 Adaptive Interview Server running on port ${PORT}`);
//   console.log(`openai.apiKey: ${process.env.OPENAI_API_KEY ? 'Loaded' : 'Not Loaded'}`);
//   console.log('✅ Features: Dynamic question generation, Response analysis, Adaptive difficulty');
// });






const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');

require('dotenv').config();

// Import route modules
const assessmentRoutes = require('./assessment');
const { router: interviewRoutes } = require('./interview'); // Updated import

// Validate required environment variables
// if (!process.env.GEMINI_API_KEY) {
//   console.error('GEMINI_API_KEY is not set in environment variables');
//   process.exit(1);
// }

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('Environment Variables Status:');
//console.log('✅ GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : 'Missing');
console.log('✅ OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Loaded' : 'Missing');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 25e6 // 25MB for audio files
});

// Middleware setup
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());

// Serve temporary audio files
app.use('/temp_audio', express.static(path.join(__dirname, 'temp_audio')));

// Create necessary directories
const createDirectories = () => {
  const dirs = [
    'uploads/audio',
    'temp_audio'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

createDirectories();

// Health check endpoint - updated to include WebSocket status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Interview System Server is running',
    timestamp: new Date().toISOString(),
    services: {
      assessment: 'Active',
      interview: 'Active',
      audio: 'Active',
      websocket: 'Active',
      connectedClients: io.engine.clientsCount
    }
  });
});

// WebSocket connection tracking
let connectedClients = 0;

// WebSocket event handlers
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`🔌 User connected: ${socket.id} (Total: ${connectedClients})`);
  
  // Store user session data
  socket.userSession = {
    conversationHistory: [],
    currentAssessment: null,
    isInterviewActive: false,
    connectionTime: new Date(),
    tempFiles: [] // Track temp files for cleanup
  };

  // Send connection confirmation
  socket.emit('connection-confirmed', {
    message: 'Connected to AI Interview Server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Initialize WebSocket handlers
  try {
    const websocketHandler = require('./websocket-handler');
    websocketHandler(socket, io);
    console.log('✅ WebSocket handlers loaded for:', socket.id);
  } catch (error) {
    console.error('❌ Error loading WebSocket handler:', error);
    socket.emit('server-error', { 
      message: 'WebSocket handler initialization failed',
      error: error.message 
    });
  }

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    connectedClients--;
    console.log(`🔌 User disconnected: ${socket.id} (Total: ${connectedClients}) - Reason: ${reason}`);
    
    // Cleanup any user-specific resources
    if (socket.userSession?.tempFiles) {
      socket.userSession.tempFiles.forEach(filePath => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up temp file for disconnected user: ${filePath}`);
          }
        } catch (error) {
          console.error(`❌ Error cleaning up temp file: ${error.message}`);
        }
      });
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// WebSocket connection status endpoint
app.get('/websocket-status', (req, res) => {
  res.json({
    status: 'active',
    connectedClients: connectedClients,
    totalConnections: io.engine.clientsCount,
    uptime: process.uptime(),
    socketIOVersion: require('socket.io/package.json').version
  });
});

// Socket.IO integration test endpoint
app.get('/socket-test', (req, res) => {
  res.json({
    message: 'Socket.IO server is running',
    connectedClients: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
    testInstructions: {
      frontend: 'Connect to ws://localhost:3001',
      events: [
        'start-interview',
        'audio-data', 
        'text-response',
        'end-interview'
      ]
    }
  });
});

// Mount route modules
app.use('/', assessmentRoutes);
app.use('/', interviewRoutes); // Now using the updated router

// Cleanup old audio files periodically
const cleanupAudioFiles = () => {
  const audioDir = path.join(__dirname, 'temp_audio');
  const uploadsDir = path.join(__dirname, 'uploads/audio');
  
  [audioDir, uploadsDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes

      files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up old audio file: ${file}`);
          }
        } catch (error) {
          console.error(`❌ Error cleaning up file ${file}:`, error);
        }
      });
    }
  });
};

// Run cleanup every 2 minutes
setInterval(cleanupAudioFiles, 2 * 60 * 1000);

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Performing graceful shutdown...');
  
  // Close WebSocket connections
  io.close(() => {
    console.log('🔌 WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('🚀 HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Performing graceful shutdown...');
  
  io.close(() => {
    console.log('🔌 WebSocket server closed');
  });
  
  server.close(() => {
    console.log('🚀 HTTP server closed');
    process.exit(0);
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
    availableEndpoints: [
      '/health',
      '/websocket-status',
      '/socket-test',
      '/assessment/*',
      '/interview/*',
      '/api/*'
    ]
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 AI Interview System Server running on port ${PORT}`);
  console.log('✅ Features: Adaptive Assessment, Audio Interview, Multi-modal Evaluation');
  console.log('✅ Routes: Assessment endpoints, Interview endpoints, Audio processing');
  console.log('🔌 WebSocket: Real-time audio interview support enabled');
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket status: http://localhost:${PORT}/websocket-status`);
  console.log(`🧪 Socket.IO test: http://localhost:${PORT}/socket-test`);
  console.log(`🎯 Frontend should connect to: ws://localhost:${PORT}`);
});

// Export both app and io for testing purposes
module.exports = { app, server, io };