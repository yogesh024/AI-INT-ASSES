import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage.js';
import InterviewPage from './components/InterviewPage';
import FeedbackPage from './components/InterviewFeedbackPage.js';
import { InterviewProvider } from './context/InterviewContext.js';
function App() {
  return (
    <Router>
      <InterviewProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />

        </Routes>
      </div>
      </InterviewProvider>
    </Router>
  );
}

export default App;













// import React, { useState } from 'react';
// import { Upload, FileText, MessageSquare, CheckCircle } from 'lucide-react';

// const InterviewPlatform = () => {
//   const [step, setStep] = useState('setup'); // setup, interview, completed
//   const [resumeFile, setResumeFile] = useState(null);
//   const [jobDescription, setJobDescription] = useState('');
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [currentAnswer, setCurrentAnswer] = useState('');
//   const [questionNumber, setQuestionNumber] = useState(0);
//   const [totalQuestions, setTotalQuestions] = useState(0);
//   const [responseQuality, setResponseQuality] = useState('');
//   const [adaptiveFeedback, setAdaptiveFeedback] = useState('');
//   const [feedback, setFeedback] = useState('');
//   const [loading, setLoading] = useState(false);

//   const styles = {
//     container: {
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif'
//     },
//     maxWidth: {
//       maxWidth: '800px',
//       margin: '0 auto'
//     },
//     header: {
//       textAlign: 'center',
//       marginBottom: '40px'
//     },
//     title: {
//       fontSize: '36px',
//       fontWeight: 'bold',
//       color: '#1f2937',
//       marginBottom: '10px',
//       margin: '0'
//     },
//     subtitle: {
//       color: '#6b7280',
//       fontSize: '16px'
//     },
//     card: {
//       backgroundColor: 'white',
//       borderRadius: '12px',
//       boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
//       padding: '32px'
//     },
//     formGroup: {
//       marginBottom: '24px'
//     },
//     label: {
//       display: 'flex',
//       alignItems: 'center',
//       fontSize: '18px',
//       fontWeight: '600',
//       color: '#374151',
//       marginBottom: '12px'
//     },
//     icon: {
//       marginRight: '8px'
//     },
//     uploadBox: {
//       border: '2px dashed #d1d5db',
//       borderRadius: '8px',
//       padding: '24px',
//       textAlign: 'center',
//       cursor: 'pointer',
//       transition: 'border-color 0.3s',
//       backgroundColor: '#f9fafb'
//     },
//     uploadBoxHover: {
//       borderColor: '#3b82f6'
//     },
//     hiddenInput: {
//       display: 'none'
//     },
//     uploadText: {
//       color: '#6b7280',
//       marginTop: '12px'
//     },
//     textarea: {
//       width: '100%',
//       height: '160px',
//       padding: '16px',
//       border: '1px solid #d1d5db',
//       borderRadius: '8px',
//       fontSize: '14px',
//       resize: 'none',
//       outline: 'none',
//       transition: 'border-color 0.3s, box-shadow 0.3s'
//     },
//     textareaFocus: {
//       borderColor: '#3b82f6',
//       boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
//     },
//     button: {
//       width: '100%',
//       backgroundColor: '#3b82f6',
//       color: 'white',
//       fontWeight: '600',
//       padding: '12px 24px',
//       borderRadius: '8px',
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'background-color 0.3s',
//       fontSize: '16px'
//     },
//     buttonHover: {
//       backgroundColor: '#2563eb'
//     },
//     buttonDisabled: {
//       opacity: '0.5',
//       cursor: 'not-allowed'
//     },
//     interviewHeader: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '16px'
//     },
//     interviewTitle: {
//       fontSize: '24px',
//       fontWeight: 'bold',
//       color: '#1f2937',
//       margin: '0'
//     },
//     badge: {
//       backgroundColor: '#dbeafe',
//       color: '#1e40af',
//       padding: '4px 12px',
//       borderRadius: '20px',
//       fontSize: '14px',
//       fontWeight: '600'
//     },
//     progressBar: {
//       width: '100%',
//       height: '8px',
//       backgroundColor: '#e5e7eb',
//       borderRadius: '4px',
//       marginBottom: '24px',
//       overflow: 'hidden'
//     },
//     progressFill: {
//       height: '100%',
//       backgroundColor: '#3b82f6',
//       transition: 'width 0.3s ease'
//     },
//     questionBox: {
//       backgroundColor: '#f9fafb',
//       borderRadius: '8px',
//       padding: '24px',
//       marginBottom: '24px'
//     },
//     questionLabel: {
//       fontSize: '18px',
//       fontWeight: '600',
//       color: '#374151',
//       marginBottom: '12px'
//     },
//     questionText: {
//       fontSize: '18px',
//       color: '#1f2937',
//       lineHeight: '1.6',
//       marginBottom: '12px'
//     },
//     questionType: {
//       display: 'inline-block',
//       backgroundColor: '#e0e7ff',
//       color: '#3730a3',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       fontSize: '12px',
//       fontWeight: '500'
//     },
//     answerTextarea: {
//       width: '100%',
//       height: '120px',
//       padding: '16px',
//       border: '1px solid #d1d5db',
//       borderRadius: '8px',
//       fontSize: '14px',
//       resize: 'none',
//       outline: 'none',
//       transition: 'border-color 0.3s, box-shadow 0.3s'
//     },
//     submitButton: {
//       width: '100%',
//       backgroundColor: '#059669',
//       color: 'white',
//       fontWeight: '600',
//       padding: '12px 24px',
//       borderRadius: '8px',
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'background-color 0.3s',
//       fontSize: '16px'
//     },
//     submitButtonHover: {
//       backgroundColor: '#047857'
//     },
//     completedContainer: {
//       textAlign: 'center'
//     },
//     completedTitle: {
//       fontSize: '28px',
//       fontWeight: 'bold',
//       color: '#1f2937',
//       marginBottom: '16px',
//       marginTop: '24px'
//     },
//     feedbackBox: {
//       backgroundColor: '#f9fafb',
//       borderRadius: '8px',
//       padding: '24px',
//       marginBottom: '24px',
//       textAlign: 'left'
//     },
//     feedbackLabel: {
//       fontSize: '18px',
//       fontWeight: '600',
//       color: '#374151',
//       marginBottom: '12px'
//     },
//     feedbackText: {
//       color: '#374151',
//       lineHeight: '1.6',
//       fontSize: '16px'
//     }
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type === 'application/pdf') {
//       setResumeFile(file);
//     } else {
//       alert('Please upload a PDF file');
//     }
//   };

//   const generateAssesment = async () => {
//     if (!jobDescription.trim()) {
//       alert('Please enter a job description');
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     if (resumeFile) {
//       formData.append('resume', resumeFile);
//     }
//     formData.append('jobDescription', jobDescription);

//     try {
//       const response = await fetch('http://localhost:3001/start-interview', {
//         method: 'POST',
//         body: formData
//       });

//       const data = await response.json();
//       if (data.success) {
//         setCurrentQuestion(data.question);
//         setTotalQuestions(data.totalQuestions);
//         setQuestionNumber(data.questionNumber);
//         setStep('interview');
//       }
//     } catch (error) {
//       alert('Error generating interview. Make sure backend is running.');
//     }
//     setLoading(false);
//   };

//   const submitAnswer = async () => {
//     if (!currentAnswer.trim()) {
//       alert('Please provide an answer');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch('http://localhost:3001/submit-answer', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ answer: currentAnswer })
//       });

//       const data = await response.json();
      
//       if (data.finished) {
//         setFeedback(data.feedback);
//         setStep('completed');
//       } else {
//         setCurrentQuestion(data.nextQuestion);
//         setQuestionNumber(data.questionNumber);
//         setCurrentAnswer('');
        
//         // Show adaptive feedback
//         if (data.previousAnalysis) {
//           setResponseQuality(data.previousAnalysis.quality);
//           setAdaptiveFeedback(data.previousAnalysis.feedback);
//         }
//       }
//     } catch (error) {
//       alert('Error submitting answer');
//     }
//     setLoading(false);
//   };

//   const resetInterview = () => {
//     setStep('setup');
//     setResumeFile(null);
//     setJobDescription('');
//     setCurrentQuestion(null);
//     setCurrentAnswer('');
//     setQuestionNumber(0);
//     setTotalQuestions(0);
//     setFeedback('');
//     setResponseQuality('');
//     setAdaptiveFeedback('');
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.maxWidth}>
//         <header style={styles.header}>
//           <h1 style={styles.title}>AI Interview Platform</h1>
//           <p style={styles.subtitle}>Upload your resume, enter job description, and practice interviews</p>
//         </header>

//         {step === 'setup' && (
//           <div style={styles.card}>
//             {/* Resume Upload */}
//             <div style={styles.formGroup}>
//               <label style={styles.label}>
//                 <FileText style={styles.icon} size={20} />
//                 Upload Resume (PDF - Optional)
//               </label>
//               <div style={styles.uploadBox}>
//                 <input
//                   type="file"
//                   accept=".pdf"
//                   onChange={handleFileUpload}
//                   style={styles.hiddenInput}
//                   id="resume-upload"
//                 />
//                 <label htmlFor="resume-upload" style={{cursor: 'pointer'}}>
//                   <Upload style={{margin: '0 auto 12px', display: 'block', color: '#9ca3af'}} size={48} />
//                   <p style={styles.uploadText}>
//                     {resumeFile ? resumeFile.name : 'Click to upload or drag and drop your PDF resume'}
//                   </p>
//                 </label>
//               </div>
//             </div>

//             {/* Job Description */}
//             <div style={styles.formGroup}>
//               <label style={styles.label}>
//                 <MessageSquare style={styles.icon} size={20} />
//                 Job Description *
//               </label>
//               <textarea
//                 value={jobDescription}
//                 onChange={(e) => setJobDescription(e.target.value)}
//                 placeholder="Paste the job description here..."
//                 style={styles.textarea}
//               />
//             </div>

//         <div style={{
//   display: 'flex',
//   gap: '16px',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: '20px',
//   flexWrap: 'wrap'
// }}>
//   <button
//     onClick={generateAssesment}
//     disabled={loading}
//     style={{
//       ...styles.button,
//       ...(loading ? styles.buttonDisabled : {}),
//       background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #667eea 100%)',
//       color: 'white',
//       border: 'none',
//       padding: '12px 24px',
//       borderRadius: '8px',
//       fontSize: '16px',
//       fontWeight: '600',
//       cursor: loading ? 'not-allowed' : 'pointer',
//       transition: 'all 0.3s ease',
//       boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
//       transform: loading ? 'none' : 'translateY(0)',
//       minWidth: '180px',
//       opacity: loading ? 0.6 : 1
//     }}
//     onMouseEnter={(e) => {
//       if (!loading) {
//         e.target.style.transform = 'translateY(-2px)';
//         e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
//       }
//     }}
//     onMouseLeave={(e) => {
//       if (!loading) {
//         e.target.style.transform = 'translateY(0)';
//         e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
//       }
//     }}
//   >
//     {loading ? (
//       <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//         <span style={{
//           width: '16px',
//           height: '16px',
//           border: '2px solid #ffffff40',
//           borderTop: '2px solid #ffffff',
//           borderRadius: '50%',
//           animation: 'spin 1s linear infinite'
//         }}></span>
//         Generating Assessment...
//       </span>
//     ) : 'Generate Assessment'}
//   </button>

//   <button
//     onClick={generateAssesment}
//     disabled={loading}
//     style={{
//       ...styles.button,
//       ...(loading ? styles.buttonDisabled : {}),
//       background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #f093fb 0%, #667eea 100%)',
//       color: 'white',
//       border: 'none',
//       padding: '12px 24px',
//       borderRadius: '8px',
//       fontSize: '16px',
//       fontWeight: '600',
//       cursor: loading ? 'not-allowed' : 'pointer',
//       transition: 'all 0.3s ease',
//       boxShadow: loading ? 'none' : '0 4px 15px rgba(240, 147, 251, 0.3)',
//       transform: loading ? 'none' : 'translateY(0)',
//       minWidth: '180px',
//       opacity: loading ? 0.6 : 1
//     }}
//     onMouseEnter={(e) => {
//       if (!loading) {
//         e.target.style.transform = 'translateY(-2px)';
//         e.target.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.4)';
//       }
//     }}
//     onMouseLeave={(e) => {
//       if (!loading) {
//         e.target.style.transform = 'translateY(0)';
//         e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.3)';
//       }
//     }}
//   >
//     {loading ? (
//       <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//         <span style={{
//           width: '16px',
//           height: '16px',
//           border: '2px solid #ffffff40',
//           borderTop: '2px solid #ffffff',
//           borderRadius: '50%',
//           animation: 'spin 1s linear infinite'
//         }}></span>
//         Generating Interview...
//       </span>
//     ) : 'Generate Interview'}
//   </button>

//   <style jsx>{`
//     @keyframes spin {
//       0% { transform: rotate(0deg); }
//       100% { transform: rotate(360deg); }
//     }
//   `}</style>
// </div>
//           </div>
//         )}

//         {step === 'interview' && currentQuestion && (
//               <div className="bg-white rounded-lg shadow-lg p-8">
//             <div className="mb-6">
//               <div style={styles.interviewHeader}>
//                 <h2 style={styles.interviewTitle}>🤖 Adaptive AI Interview</h2>
//                 <span style={styles.badge}>
//                   Question {questionNumber} of {totalQuestions}
//                 </span>
//               </div>
              
//               <div style={styles.progressBar}>
//                 <div 
//                   style={{
//                     ...styles.progressFill,
//                     width: `${(questionNumber / totalQuestions) * 100}%`
//                   }}
//                 ></div>
//               </div>

//               {/* Show adaptive feedback from previous response */}
//               {adaptiveFeedback && (
//                 <div style={{
//                   backgroundColor: responseQuality === 'high' ? '#dcfce7' : 
//                                   responseQuality === 'low' ? '#fef3c7' : '#e0f2fe',
//                   border: `1px solid ${responseQuality === 'high' ? '#16a34a' : 
//                                       responseQuality === 'low' ? '#d97706' : '#0284c7'}`,
//                   borderRadius: '8px',
//                   padding: '12px',
//                   marginBottom: '20px'
//                 }}>
//                   <div style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     marginBottom: '4px'
//                   }}>
//                     <span style={{
//                       fontSize: '14px',
//                       fontWeight: '600',
//                       color: responseQuality === 'high' ? '#16a34a' : 
//                              responseQuality === 'low' ? '#d97706' : '#0284c7'
//                     }}>
//                       Previous Response: {responseQuality.toUpperCase()} Quality
//                     </span>
//                   </div>
//                   <p style={{
//                     fontSize: '14px',
//                     color: '#374151',
//                     margin: '0'
//                   }}>
//                     💡 {adaptiveFeedback}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div>
//               <div style={styles.questionBox}>
//                 <h3 style={styles.questionLabel}>Question:</h3>
//                 <p style={styles.questionText}>{currentQuestion.question}</p>
//                 <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px'}}>
//                   <span style={styles.questionType}>
//                     {currentQuestion.type}
//                   </span>
//                   {currentQuestion.focus_area && (
//                     <span style={{...styles.questionType, backgroundColor: '#f0fdf4', color: '#166534'}}>
//                       Focus: {currentQuestion.focus_area}
//                     </span>
//                   )}
//                   {currentQuestion.difficulty && (
//                     <span style={{
//                       ...styles.questionType, 
//                       backgroundColor: currentQuestion.difficulty === 'hard' ? '#fef2f2' : 
//                                       currentQuestion.difficulty === 'easy' ? '#f0fdf4' : '#fffbeb',
//                       color: currentQuestion.difficulty === 'hard' ? '#dc2626' : 
//                              currentQuestion.difficulty === 'easy' ? '#166534' : '#d97706'
//                     }}>
//                       {currentQuestion.difficulty}
//                     </span>
//                   )}
//                 </div>
//                 {currentQuestion.reasoning && (
//                   <p style={{
//                     fontSize: '13px',
//                     color: '#6b7280',
//                     fontStyle: 'italic',
//                     marginTop: '8px',
//                     margin: '8px 0 0 0'
//                   }}>
//                     Why this question: {currentQuestion.reasoning}
//                   </p>
//                 )}
//               </div>

//               <div style={styles.formGroup}>
//                 <label style={styles.questionLabel}>Your Answer:</label>
//                 <textarea
//                   value={currentAnswer}
//                   onChange={(e) => setCurrentAnswer(e.target.value)}
//                   placeholder="Provide a detailed answer with specific examples..."
//                   style={styles.answerTextarea}
//                 />
//                 <p style={{
//                   fontSize: '12px',
//                   color: '#6b7280',
//                   marginTop: '4px',
//                   margin: '4px 0 0 0'
//                 }}>
//                   💡 Tip: Include specific examples, numbers, and outcomes for better evaluation
//                 </p>
//               </div>

//               <button
//                 onClick={submitAnswer}
//                 disabled={loading}
//                 style={{
//                   ...styles.submitButton,
//                   ...(loading ? styles.buttonDisabled : {})
//                 }}
//               >
//                 {loading ? 'Analyzing Response...' : '🚀 Submit & Get Next Question'}
//               </button>
//             </div>
//           </div>
//         )}

//         {step === 'completed' && (
//           <div style={{...styles.card, ...styles.completedContainer}}>
//             <CheckCircle style={{margin: '0 auto 24px', color: '#10b981'}} size={64} />
//             <h2 style={styles.completedTitle}>🎉 Adaptive Interview Completed!</h2>
            
//             <div style={styles.feedbackBox}>
//               <h3 style={styles.feedbackLabel}>📊 Comprehensive Feedback:</h3>
//               <p style={styles.feedbackText}>{feedback}</p>
//             </div>

//             <div style={{
//               ...styles.feedbackBox,
//               backgroundColor: '#f0f9ff',
//               marginBottom: '24px'
//             }}>
//               <h4 style={{...styles.feedbackLabel, fontSize: '16px'}}>✨ What Made This Interview Special:</h4>
//               <ul style={{
//                 color: '#374151',
//                 fontSize: '14px',
//                 lineHeight: '1.5',
//                 paddingLeft: '20px',
//                 margin: '0'
//               }}>
//                 <li>Questions were dynamically generated based on your resume and the job description</li>
//                 <li>Each question adapted based on the quality of your previous responses</li>
//                 <li>AI analyzed your answers in real-time for depth and relevance</li>
//                 <li>The difficulty and focus areas adjusted to your demonstrated competency</li>
//               </ul>
//             </div>

//             <button
//               onClick={resetInterview}
//               style={styles.button}
//             >
//               🔄 Start New Adaptive Interview
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InterviewPlatform;









// // import React, { useState, useRef } from 'react';
// // import { Upload, FileText, Link, Play, Clock, CheckCircle, AlertCircle, Brain, Users, Code, Target } from 'lucide-react';
// // const AIInterviewPlatform = () => {
// //   const [currentStep, setCurrentStep] = useState(1);
// //   const [uploadedFiles, setUploadedFiles] = useState([]);
// //   const [jobDescription, setJobDescription] = useState('');
// //   const [companyLinks, setCompanyLinks] = useState(['']);
// //   const [additionalDocs, setAdditionalDocs] = useState([]);
// //   const [assessmentConfig, setAssessmentConfig] = useState({
// //     includeResume: true,
// //     includeAdaptive: true,
// //     includeInterview: true,
// //     maxTime: 90
// //   });
// //   const [analysisResults, setAnalysisResults] = useState(null);
// //   const [isProcessing, setIsProcessing] = useState(false);
  
// //   const fileInputRef = useRef();

// //   const handleFileUpload = (event, type) => {
// //     const files = Array.from(event.target.files);
// //     if (type === 'resume') {
// //       setUploadedFiles(files);
// //     } else if (type === 'additional') {
// //       setAdditionalDocs([...additionalDocs, ...files]);
// //     }
// //   };

// //   const addCompanyLink = () => {
// //     setCompanyLinks([...companyLinks, '']);
// //   };

// //   const updateCompanyLink = (index, value) => {
// //     const newLinks = [...companyLinks];
// //     newLinks[index] = value;
// //     setCompanyLinks(newLinks);
// //   };

// //   const generateDynamicAssessment = async () => {
// //     setIsProcessing(true);
    
// //     // Simulate processing time
// //     await new Promise(resolve => setTimeout(resolve, 3000));
    
// //     // Mock analysis results based on inputs
// //     const mockResults = {
// //       resumeAnalysis: {
// //         skillsExtracted: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
// //         experienceLevel: 'Mid-Senior (4.5 years)',
// //         keyStrengths: ['Full-stack development', 'Cloud technologies', 'Team leadership'],
// //         improvementAreas: ['System design', 'Advanced algorithms']
// //       },
// //       jobMatching: {
// //         overallMatch: 84,
// //         criticalSkillsMatch: 78,
// //         experienceMatch: 92,
// //         cultureMatch: 76,
// //         missingSkills: ['Kubernetes', 'GraphQL', 'Docker Swarm']
// //       },
// //       assessmentPlan: {
// //         totalQuestions: 45,
// //         timeAllocation: {
// //           technical: 35,
// //           behavioral: 25,
// //           cognitive: 20,
// //           cultural: 10
// //         },
// //         difficultyAdaptation: 'Medium to Hard progression',
// //         focusAreas: ['System Design', 'React Advanced Patterns', 'Leadership Scenarios']
// //       }
// //     };
    
// //     setAnalysisResults(mockResults);
// //     setIsProcessing(false);
// //     setCurrentStep(3);
// //   };

// //   const renderStepIndicator = () => (
// //     <div className="flex items-center justify-center mb-8">
// //       {[1, 2, 3, 4].map((step) => (
// //         <div key={step} className="flex items-center">
// //           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
// //             currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
// //           }`}>
// //             {step}
// //           </div>
// //           {step < 4 && (
// //             <div className={`w-20 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
// //           )}
// //         </div>
// //       ))}
// //     </div>
// //   );

// //   const renderStep1 = () => (
// //     <div className="max-w-4xl mx-auto space-y-8">
// //       <div className="text-center">
// //         <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Candidate Materials</h2>
// //         <p className="text-gray-600">Provide the resume and job-related documents for analysis</p>
// //       </div>

// //       {/* Resume Upload */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h3 className="text-xl font-semibold mb-4 flex items-center">
// //           <FileText className="mr-2 text-blue-600" />
// //           Candidate Resume
// //         </h3>
// //         <div 
// //           className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
// //           onClick={() => fileInputRef.current?.click()}
// //         >
// //           <Upload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
// //           <p className="text-lg font-medium text-gray-700">Click to upload resume</p>
// //           <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
// //           <input
// //             ref={fileInputRef}
// //             type="file"
// //             accept=".pdf,.doc,.docx"
// //             onChange={(e) => handleFileUpload(e, 'resume')}
// //             className="hidden"
// //           />
// //         </div>
// //         {uploadedFiles.length > 0 && (
// //           <div className="mt-4 p-3 bg-green-50 rounded-lg">
// //             <p className="text-green-800 font-medium">✓ Resume uploaded: {uploadedFiles[0].name}</p>
// //           </div>
// //         )}
// //       </div>

// //       {/* Job Description */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h3 className="text-xl font-semibold mb-4 flex items-center">
// //           <Target className="mr-2 text-green-600" />
// //           Job Description
// //         </h3>
// //         <textarea
// //           value={jobDescription}
// //           onChange={(e) => setJobDescription(e.target.value)}
// //           placeholder="Paste the complete job description here..."
// //           className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //         />
// //       </div>

// //       {/* Company Information Links */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h3 className="text-xl font-semibold mb-4 flex items-center">
// //           <Link className="mr-2 text-purple-600" />
// //           Company Information Sources
// //         </h3>
// //         <p className="text-gray-600 mb-4">Add links to gather comprehensive company context</p>
// //         {companyLinks.map((link, index) => (
// //           <div key={index} className="mb-3">
// //             <input
// //               type="url"
// //               value={link}
// //               onChange={(e) => updateCompanyLink(index, e.target.value)}
// //               placeholder="https://company-website.com or LinkedIn/Glassdoor links"
// //               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
// //             />
// //           </div>
// //         ))}
// //         <button
// //           onClick={addCompanyLink}
// //           className="text-purple-600 hover:text-purple-800 font-medium"
// //         >
// //           + Add another link
// //         </button>
// //       </div>

// //       {/* Additional Documents */}
// //       <div className="bg-white rounded-lg shadow-md p-6">
// //         <h3 className="text-xl font-semibold mb-4">Additional Documents (Optional)</h3>
// //         <p className="text-gray-600 mb-4">Company culture PDFs, technical requirements, etc.</p>
// //         <input
// //           type="file"
// //           multiple
// //           accept=".pdf,.doc,.docx"
// //           onChange={(e) => handleFileUpload(e, 'additional')}
// //           className="w-full p-3 border border-gray-300 rounded-lg"
// //         />
// //         {additionalDocs.length > 0 && (
// //           <div className="mt-3 space-y-2">
// //             {additionalDocs.map((doc, index) => (
// //               <div key={index} className="text-sm text-gray-600">✓ {doc.name}</div>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       <div className="text-center">
// //         <button
// //           onClick={() => setCurrentStep(2)}
// //           disabled={!uploadedFiles.length || !jobDescription.trim()}
// //           className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
// //         >
// //           Next: Configure Assessment
// //         </button>
// //       </div>
// //     </div>
// //   );

// //   const renderStep2 = () => (
// //     <div className="max-w-3xl mx-auto space-y-8">
// //       <div className="text-center">
// //         <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Configuration</h2>
// //         <p className="text-gray-600">Customize the evaluation based on uploaded materials</p>
// //       </div>

// //       <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //           <div className="space-y-4">
// //             <h3 className="text-lg font-semibold">Assessment Components</h3>
            
// //             <label className="flex items-center space-x-3">
// //               <input
// //                 type="checkbox"
// //                 checked={assessmentConfig.includeResume}
// //                 onChange={(e) => setAssessmentConfig({...assessmentConfig, includeResume: e.target.checked})}
// //                 className="w-4 h-4 text-blue-600"
// //               />
// //               <div>
// //                 <span className="font-medium">Resume Analysis</span>
// //                 <p className="text-sm text-gray-600">Detailed skills and experience evaluation</p>
// //               </div>
// //             </label>

// //             <label className="flex items-center space-x-3">
// //               <input
// //                 type="checkbox"
// //                 checked={assessmentConfig.includeAdaptive}
// //                 onChange={(e) => setAssessmentConfig({...assessmentConfig, includeAdaptive: e.target.checked})}
// //                 className="w-4 h-4 text-blue-600"
// //               />
// //               <div>
// //                 <span className="font-medium">Adaptive Assessment</span>
// //                 <p className="text-sm text-gray-600">Tailored technical and cognitive evaluation</p>
// //               </div>
// //             </label>

// //             <label className="flex items-center space-x-3">
// //               <input
// //                 type="checkbox"
// //                 checked={assessmentConfig.includeInterview}
// //                 onChange={(e) => setAssessmentConfig({...assessmentConfig, includeInterview: e.target.checked})}
// //                 className="w-4 h-4 text-blue-600"
// //               />
// //               <div>
// //                 <span className="font-medium">AI Virtual Interview</span>
// //                 <p className="text-sm text-gray-600">Live behavioral and technical interview</p>
// //               </div>
// //             </label>
// //           </div>

// //           <div className="space-y-4">
// //             <h3 className="text-lg font-semibold">Time Configuration</h3>
            
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Maximum Assessment Time (minutes)
// //               </label>
// //               <select
// //                 value={assessmentConfig.maxTime}
// //                 onChange={(e) => setAssessmentConfig({...assessmentConfig, maxTime: parseInt(e.target.value)})}
// //                 className="w-full p-3 border border-gray-300 rounded-lg"
// //               >
// //                 <option value={60}>60 minutes</option>
// //                 <option value={90}>90 minutes</option>
// //                 <option value={120}>120 minutes</option>
// //               </select>
// //             </div>

// //             <div className="bg-blue-50 p-4 rounded-lg">
// //               <h4 className="font-medium text-blue-900 mb-2">Estimated Breakdown:</h4>
// //               <div className="text-sm text-blue-800 space-y-1">
// //                 <div>• Resume Analysis: ~5 minutes</div>
// //                 <div>• Adaptive Assessment: ~{Math.floor(assessmentConfig.maxTime * 0.6)} minutes</div>
// //                 <div>• Virtual Interview: ~{Math.floor(assessmentConfig.maxTime * 0.4)} minutes</div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="text-center space-x-4">
// //         <button
// //           onClick={() => setCurrentStep(1)}
// //           className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
// //         >
// //           Back
// //         </button>
// //         <button
// //           onClick={generateDynamicAssessment}
// //           className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
// //         >
// //           Generate Assessment Plan
// //         </button>
// //       </div>
// //     </div>
// //   );

// //   const renderStep3 = () => (
// //     <div className="max-w-5xl mx-auto space-y-8">
// //       <div className="text-center">
// //         <h2 className="text-3xl font-bold text-gray-900 mb-4">Dynamic Assessment Plan</h2>
// //         <p className="text-gray-600">Customized evaluation based on your uploaded materials</p>
// //       </div>

// //       {isProcessing ? (
// //         <div className="text-center py-12">
// //           <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
// //           <p className="text-lg text-gray-600">Analyzing resume and job requirements...</p>
// //         </div>
// //       ) : analysisResults && (
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //           {/* Resume Analysis Results */}
// //           <div className="bg-white rounded-lg shadow-md p-6">
// //             <h3 className="text-xl font-semibold mb-4 flex items-center">
// //               <FileText className="mr-2 text-blue-600" />
// //               Resume Analysis Results
// //             </h3>
// //             <div className="space-y-4">
// //               <div>
// //                 <h4 className="font-medium text-gray-800">Extracted Skills:</h4>
// //                 <div className="flex flex-wrap gap-2 mt-2">
// //                   {analysisResults.resumeAnalysis.skillsExtracted.map((skill, index) => (
// //                     <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
// //                       {skill}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>
// //               <div>
// //                 <h4 className="font-medium text-gray-800">Experience Level:</h4>
// //                 <p className="text-gray-600">{analysisResults.resumeAnalysis.experienceLevel}</p>
// //               </div>
// //               <div>
// //                 <h4 className="font-medium text-gray-800">Key Strengths:</h4>
// //                 <ul className="list-disc list-inside text-gray-600">
// //                   {analysisResults.resumeAnalysis.keyStrengths.map((strength, index) => (
// //                     <li key={index}>{strength}</li>
// //                   ))}
// //                 </ul>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Job Matching Results */}
// //           <div className="bg-white rounded-lg shadow-md p-6">
// //             <h3 className="text-xl font-semibold mb-4 flex items-center">
// //               <Target className="mr-2 text-green-600" />
// //               Job Matching Analysis
// //             </h3>
// //             <div className="space-y-4">
// //               <div className="text-center">
// //                 <div className="text-3xl font-bold text-green-600">{analysisResults.jobMatching.overallMatch}%</div>
// //                 <p className="text-gray-600">Overall Match Score</p>
// //               </div>
// //               <div className="grid grid-cols-2 gap-4 text-sm">
// //                 <div>
// //                   <span className="font-medium">Skills Match:</span>
// //                   <div className="bg-gray-200 rounded-full h-2 mt-1">
// //                     <div className="bg-blue-600 h-2 rounded-full" style={{width: `${analysisResults.jobMatching.criticalSkillsMatch}%`}}></div>
// //                   </div>
// //                 </div>
// //                 <div>
// //                   <span className="font-medium">Experience Match:</span>
// //                   <div className="bg-gray-200 rounded-full h-2 mt-1">
// //                     <div className="bg-green-600 h-2 rounded-full" style={{width: `${analysisResults.jobMatching.experienceMatch}%`}}></div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div>
// //                 <h4 className="font-medium text-red-800">Skills to Focus On:</h4>
// //                 <div className="flex flex-wrap gap-2 mt-2">
// //                   {analysisResults.jobMatching.missingSkills.map((skill, index) => (
// //                     <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
// //                       {skill}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Assessment Plan */}
// //           <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
// //             <h3 className="text-xl font-semibold mb-4 flex items-center">
// //               <Brain className="mr-2 text-purple-600" />
// //               Customized Assessment Plan
// //             </h3>
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //               <div>
// //                 <h4 className="font-medium text-gray-800 mb-3">Time Allocation:</h4>
// //                 <div className="space-y-2">
// //                   {Object.entries(analysisResults.assessmentPlan.timeAllocation).map(([area, time]) => (
// //                     <div key={area} className="flex justify-between items-center">
// //                       <span className="capitalize">{area}:</span>
// //                       <span className="font-medium">{time} min</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //               <div>
// //                 <h4 className="font-medium text-gray-800 mb-3">Focus Areas:</h4>
// //                 <ul className="space-y-1">
// //                   {analysisResults.assessmentPlan.focusAreas.map((area, index) => (
// //                     <li key={index} className="flex items-center">
// //                       <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
// //                       {area}
// //                     </li>
// //                   ))}
// //                 </ul>
// //               </div>
// //             </div>
// //             <div className="mt-6 p-4 bg-purple-50 rounded-lg">
// //               <p className="text-purple-800">
// //                 <strong>Assessment Strategy:</strong> {analysisResults.assessmentPlan.difficultyAdaptation} based on resume analysis and job requirements matching.
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <div className="text-center space-x-4">
// //         <button
// //           onClick={() => setCurrentStep(2)}
// //           className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
// //         >
// //           Back to Configuration
// //         </button>
// //         <button
// //           onClick={() => setCurrentStep(4)}
// //           disabled={isProcessing}
// //           className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center mx-auto"
// //         >
// //           <Play className="mr-2 w-5 h-5" />
// //           Start Assessment
// //         </button>
// //       </div>
// //     </div>
// //   );

// //   const renderStep4 = () => (
// //     <div className="max-w-4xl mx-auto text-center space-y-8">
// //       <div>
// //         <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Ready to Begin</h2>
// //         <p className="text-gray-600">Your personalized evaluation has been configured</p>
// //       </div>

// //       <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //           <div className="text-center">
// //             <Code className="w-12 h-12 text-blue-600 mx-auto mb-3" />
// //             <h3 className="font-semibold text-gray-800">Technical Assessment</h3>
// //             <p className="text-sm text-gray-600">Tailored coding challenges based on job requirements</p>
// //           </div>
// //           <div className="text-center">
// //             <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
// //             <h3 className="font-semibold text-gray-800">Behavioral Evaluation</h3>
// //             <p className="text-sm text-gray-600">Scenarios relevant to company culture and role</p>
// //           </div>
// //           <div className="text-center">
// //             <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
// //             <h3 className="font-semibold text-gray-800">AI Interview</h3>
// //             <p className="text-sm text-gray-600">Dynamic questions based on resume analysis</p>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
// //         <div className="flex items-start">
// //           <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 mr-3" />
// //           <div className="text-left">
// //             <h3 className="font-semibold text-yellow-800 mb-2">Before You Begin:</h3>
// //             <ul className="text-sm text-yellow-700 space-y-1">
// //               <li>• Ensure stable internet connection</li>
// //               <li>• Close unnecessary applications</li>
// //               <li>• Find a quiet, well-lit environment</li>
// //               <li>• Keep a glass of water nearby</li>
// //               <li>• Assessment will be proctored for integrity</li>
// //             </ul>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="space-y-4">
// //         <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center mx-auto">
// //           <Play className="mr-3 w-6 h-6" />
// //           Begin Assessment Journey
// //         </button>
// //         <p className="text-sm text-gray-500">
// //           Estimated completion time: {assessmentConfig.maxTime} minutes
// //         </p>
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
// //       <div className="container mx-auto px-4 py-8">
// //         {/* Header */}
// //         <div className="text-center mb-12">
// //           <h1 className="text-4xl font-bold text-gray-900 mb-4">
// //             AI Interviewing Platform
// //           </h1>
// //           <p className="text-xl text-gray-600">
// //             Dynamic Assessment Generation Based on Your Materials
// //           </p>
// //         </div>

// //         {/* Step Indicator */}
// //         {renderStepIndicator()}

// //         {/* Step Content */}
// //         {currentStep === 1 && renderStep1()}
// //         {currentStep === 2 && renderStep2()}
// //         {currentStep === 3 && renderStep3()}
// //         {currentStep === 4 && renderStep4()}
// //       </div>
// //     </div>
// //   );
// // };

// // export default AIInterviewPlatform;










// // import React, { useState, useRef, useEffect } from 'react';
// // import { Mic, MicOff, Play, Pause, Upload, Volume2, VolumeX, RotateCcw } from 'lucide-react';

// // const VoiceInterview = () => {
// //   const [interviewState, setInterviewState] = useState('setup'); // setup, active, finished
// //   const [isRecording, setIsRecording] = useState(false);
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [currentQuestion, setCurrentQuestion] = useState(null);
// //   const [questionNumber, setQuestionNumber] = useState(0);
// //   const [totalQuestions, setTotalQuestions] = useState(5);
// //   const [transcript, setTranscript] = useState('');
// //   const [feedback, setFeedback] = useState('');
// //   const [audioUrl, setAudioUrl] = useState(null);
// //   const [voiceSettings, setVoiceSettings] = useState({
// //     language: 'en-US',
// //     voiceType: 'FEMALE',
// //     speakingRate: 1.0,
// //     pitch: 0.0,
// //     volumeGainDb: 0.0
// //   });
  
// //   // Form data
// //   const [jobDescription, setJobDescription] = useState('');
// //   const [resumeFile, setResumeFile] = useState(null);
  
// //   // Loading states
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [processingAudio, setProcessingAudio] = useState(false);
  
// //   // Refs
// //   const mediaRecorderRef = useRef(null);
// //   const audioChunksRef = useRef([]);
// //   const audioPlayerRef = useRef(null);
// //   const streamRef = useRef(null);
  
// //   // Audio visualization
// //   const [audioLevel, setAudioLevel] = useState(0);
// //   const analyserRef = useRef(null);
// //   const animationRef = useRef(null);

// //   // Initialize audio context for visualization
// //   useEffect(() => {
// //     return () => {
// //       if (animationRef.current) {
// //         cancelAnimationFrame(animationRef.current);
// //       }
// //       if (streamRef.current) {
// //         streamRef.current.getTracks().forEach(track => track.stop());
// //       }
// //     };
// //   }, []);

// //   // Start recording
// //   const startRecording = async () => {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ 
// //         audio: {
// //           echoCancellation: true,
// //           noiseSuppression: true,
// //           autoGainControl: true
// //         } 
// //       });
      
// //       streamRef.current = stream;
      
// //       // Setup audio visualization
// //       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
// //       const analyser = audioContext.createAnalyser();
// //       const source = audioContext.createMediaStreamSource(stream);
// //       source.connect(analyser);
// //       analyser.fftSize = 256;
// //       analyserRef.current = analyser;
      
// //       // Start visualization
// //       const dataArray = new Uint8Array(analyser.frequencyBinCount);
// //       const updateAudioLevel = () => {
// //         analyser.getByteFrequencyData(dataArray);
// //         const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
// //         setAudioLevel(average);
// //         animationRef.current = requestAnimationFrame(updateAudioLevel);
// //       };
// //       updateAudioLevel();

// //       const mediaRecorder = new MediaRecorder(stream, {
// //         mimeType: 'audio/webm;codecs=opus'
// //       });
      
// //       mediaRecorderRef.current = mediaRecorder;
// //       audioChunksRef.current = [];

// //       mediaRecorder.ondataavailable = (event) => {
// //         if (event.data.size > 0) {
// //           audioChunksRef.current.push(event.data);
// //         }
// //       };

// //       mediaRecorder.onstop = async () => {
// //         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
// //         await submitVoiceAnswer(audioBlob);
        
// //         // Stop visualization
// //         if (animationRef.current) {
// //           cancelAnimationFrame(animationRef.current);
// //         }
// //         setAudioLevel(0);
// //       };

// //       mediaRecorder.start();
// //       setIsRecording(true);
// //     } catch (error) {
// //       console.error('Error starting recording:', error);
// //       alert('Could not access microphone. Please check permissions.');
// //     }
// //   };

// //   // Stop recording
// //   const stopRecording = () => {
// //     if (mediaRecorderRef.current && isRecording) {
// //       mediaRecorderRef.current.stop();
// //       setIsRecording(false);
      
// //       if (streamRef.current) {
// //         streamRef.current.getTracks().forEach(track => track.stop());
// //       }
// //     }
// //   };

// //   // Submit voice answer
// //   const submitVoiceAnswer = async (audioBlob) => {
// //     setProcessingAudio(true);
// //     try {
// //       const formData = new FormData();
// //       formData.append('audio', audioBlob, 'answer.webm');

// //       const response = await fetch('http://localhost:3001/submit-voice-answer', {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       const data = await response.json();
      
// //       if (data.finished) {
// //         setInterviewState('finished');
// //         setFeedback(data.feedback);
// //         setTranscript(data.transcript);
        
// //         if (data.feedbackAudio) {
// //           playAudioFromBase64(data.feedbackAudio);
// //         }
// //       } else if (data.success) {
// //         setCurrentQuestion(data.nextQuestion);
// //         setQuestionNumber(data.questionNumber);
// //         setTranscript(data.transcript);
        
// //         if (data.questionAudio) {
// //           playAudioFromBase64(data.questionAudio);
// //         }
// //       } else {
// //         alert('Error processing your answer. Please try again.');
// //       }
// //     } catch (error) {
// //       console.error('Error submitting voice answer:', error);
// //       alert('Network error. Please check your connection.');
// //     } finally {
// //       setProcessingAudio(false);
// //     }
// //   };

// //   // Play audio from base64
// //   const playAudioFromBase64 = (base64Audio) => {
// //     try {
// //       const audioBlob = new Blob([
// //         new Uint8Array(atob(base64Audio).split('').map(char => char.charCodeAt(0)))
// //       ], { type: 'audio/mp3' });
      
// //       const url = URL.createObjectURL(audioBlob);
// //       setAudioUrl(url);
      
// //       if (audioPlayerRef.current) {
// //         audioPlayerRef.current.src = url;
// //         audioPlayerRef.current.play();
// //         setIsPlaying(true);
// //       }
// //     } catch (error) {
// //       console.error('Error playing audio:', error);
// //     }
// //   };

// //   // Start interview
// //   const startInterview = async () => {
// //     if (!jobDescription.trim()) {
// //       alert('Please enter a job description');
// //       return;
// //     }

// //     setIsLoading(true);
// //     try {
// //       const formData = new FormData();
// //       formData.append('jobDescription', jobDescription);
// //       formData.append('voiceSettings', JSON.stringify(voiceSettings));
      
// //       if (resumeFile) {
// //         formData.append('resume', resumeFile);
// //       }

// //       const response = await fetch('http://localhost:3001/start-voice-interview', {
// //         method: 'POST',
// //         body: formData,
// //       });

// //       const data = await response.json();
      
// //       if (data.success) {
// //         setCurrentQuestion(data.question);
// //         setQuestionNumber(data.questionNumber);
// //         setTotalQuestions(data.totalQuestions);
// //         setInterviewState('active');
        
// //         if (data.audioContent) {
// //           playAudioFromBase64(data.audioContent);
// //         }
// //       } else {
// //         alert('Error starting interview');
// //       }
// //     } catch (error) {
// //       console.error('Error starting interview:', error);
// //       alert('Network error. Please try again.');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Reset interview
// //   const resetInterview = async () => {
// //     try {
// //       await fetch('http://localhost:3001/reset-interview', {
// //         method: 'POST',
// //       });
      
// //       setInterviewState('setup');
// //       setCurrentQuestion(null);
// //       setQuestionNumber(0);
// //       setTranscript('');
// //       setFeedback('');
// //       setAudioUrl(null);
// //       setIsRecording(false);
// //       setIsPlaying(false);
// //     } catch (error) {
// //       console.error('Error resetting interview:', error);
// //     }
// //   };

// //   // Handle audio player events
// //   const handleAudioEnd = () => {
// //     setIsPlaying(false);
// //   };

// //   const handleAudioPlay = () => {
// //     setIsPlaying(true);
// //   };

// //   const handleAudioPause = () => {
// //     setIsPlaying(false);
// //   };

// //   // Replay current question
// //   const replayQuestion = async () => {
// //     if (currentQuestion) {
// //       try {
// //         const response = await fetch('http://localhost:3001/get-question-audio', {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //           },
// //           body: JSON.stringify({
// //             text: currentQuestion.question,
// //             voiceSettings: voiceSettings
// //           }),
// //         });

// //         const data = await response.json();
// //         if (data.success && data.audioContent) {
// //           playAudioFromBase64(data.audioContent);
// //         }
// //       } catch (error) {
// //         console.error('Error replaying question:', error);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
// //       <div className="max-w-4xl mx-auto">
// //         <header className="text-center mb-8">
// //           <h1 className="text-4xl font-bold text-gray-800 mb-2">
// //             🎙️ AI Voice Interview
// //           </h1>
// //           <p className="text-gray-600">
// //             Practice your interview skills with AI-powered voice interactions
// //           </p>
// //         </header>

// //         {interviewState === 'setup' && (
// //           <div className="bg-white rounded-xl shadow-lg p-8">
// //             <h2 className="text-2xl font-semibold mb-6 text-gray-800">
// //               Setup Your Interview
// //             </h2>
            
// //             {/* Voice Settings */}
// //             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
// //               <h3 className="text-lg font-medium mb-4">Voice Settings</h3>
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Voice Type
// //                   </label>
// //                   <select
// //                     value={voiceSettings.voiceType}
// //                     onChange={(e) => setVoiceSettings({...voiceSettings, voiceType: e.target.value})}
// //                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
// //                   >
// //                     <option value="FEMALE">Female</option>
// //                     <option value="MALE">Male</option>
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Speaking Rate: {voiceSettings.speakingRate}x
// //                   </label>
// //                   <input
// //                     type="range"
// //                     min="0.5"
// //                     max="2.0"
// //                     step="0.1"
// //                     value={voiceSettings.speakingRate}
// //                     onChange={(e) => setVoiceSettings({...voiceSettings, speakingRate: parseFloat(e.target.value)})}
// //                     className="w-full"
// //                   />
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Resume Upload */}
// //             <div className="mb-6">
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Upload Resume (PDF - Optional)
// //               </label>
// //               <div className="flex items-center justify-center w-full">
// //                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
// //                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
// //                     <Upload className="w-8 h-8 mb-4 text-gray-500" />
// //                     <p className="mb-2 text-sm text-gray-500">
// //                       <span className="font-semibold">Click to upload</span> your resume
// //                     </p>
// //                     <p className="text-xs text-gray-500">PDF files only</p>
// //                   </div>
// //                   <input
// //                     type="file"
// //                     accept=".pdf"
// //                     onChange={(e) => setResumeFile(e.target.files[0])}
// //                     className="hidden"
// //                   />
// //                 </label>
// //               </div>
// //               {resumeFile && (
// //                 <p className="mt-2 text-sm text-green-600">
// //                   ✓ {resumeFile.name} uploaded
// //                 </p>
// //               )}
// //             </div>

// //             {/* Job Description */}
// //             <div className="mb-8">
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Job Description *
// //               </label>
// //               <textarea
// //                 value={jobDescription}
// //                 onChange={(e) => setJobDescription(e.target.value)}
// //                 placeholder="Paste the job description here..."
// //                 className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               />
// //             </div>

// //             <button
// //               onClick={startInterview}
// //               disabled={isLoading || !jobDescription.trim()}
// //               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
// //             >
// //               {isLoading ? 'Starting Interview...' : 'Start Voice Interview'}
// //             </button>
// //           </div>
// //         )}

// //         {interviewState === 'active' && (
// //           <div className="bg-white rounded-xl shadow-lg p-8">
// //             {/* Progress */}
// //             <div className="mb-6">
// //               <div className="flex justify-between items-center mb-2">
// //                 <span className="text-sm font-medium text-gray-700">
// //                   Question {questionNumber} of {totalQuestions}
// //                 </span>
// //                 <span className="text-sm text-gray-500">
// //                   {Math.round((questionNumber / totalQuestions) * 100)}% Complete
// //                 </span>
// //               </div>
// //               <div className="w-full bg-gray-200 rounded-full h-2">
// //                 <div
// //                   className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// //                   style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
// //                 />
// //               </div>
// //             </div>

// //             {/* Current Question */}
// //             {currentQuestion && (
// //               <div className="mb-8 p-6 bg-blue-50 rounded-lg">
// //                 <div className="flex justify-between items-start mb-4">
// //                   <h3 className="text-lg font-semibold text-gray-800">
// //                     Current Question:
// //                   </h3>
// //                   <button
// //                     onClick={replayQuestion}
// //                     className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
// //                   >
// //                     <Volume2 className="w-4 h-4" />
// //                     <span>Replay</span>
// //                   </button>
// //                 </div>
// //                 <p className="text-gray-700 text-lg leading-relaxed">
// //                   {currentQuestion.question}
// //                 </p>
// //                 <div className="mt-3 flex flex-wrap gap-2">
// //                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
// //                     {currentQuestion.type}
// //                   </span>
// //                   <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
// //                     {currentQuestion.focus_area}
// //                   </span>
// //                 </div>
// //               </div>
// //             )}

// //             {/* Audio Player */}
// //             {audioUrl && (
// //               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
// //                 <div className="flex items-center space-x-4">
// //                   <div className="flex items-center space-x-2">
// //                     {isPlaying ? (
// //                       <Pause className="w-5 h-5 text-blue-600" />
// //                     ) : (
// //                       <Play className="w-5 h-5 text-blue-600" />
// //                     )}
// //                     <span className="text-sm text-gray-600">
// //                       {isPlaying ? 'Playing...' : 'Audio Ready'}
// //                     </span>
// //                   </div>
// //                 </div>
// //                 <audio
// //                   ref={audioPlayerRef}
// //                   onEnded={handleAudioEnd}
// //                   onPlay={handleAudioPlay}
// //                   onPause={handleAudioPause}
// //                   controls
// //                   className="w-full mt-2"
// //                 />
// //               </div>
// //             )}

// //             {/* Voice Recording */}
// //             <div className="mb-6">
// //               <div className="flex flex-col items-center space-y-4">
// //                 {/* Audio Level Visualizer */}
// //                 {isRecording && (
// //                   <div className="flex items-center space-x-2 mb-4">
// //                     <div className="flex space-x-1">
// //                       {[...Array(20)].map((_, i) => (
// //                         <div
// //                           key={i}
// //                           className="w-1 bg-red-500 rounded-full transition-all duration-100"
// //                           style={{
// //                             height: `${Math.max(4, (audioLevel / 255) * 40 + Math.random() * 10)}px`
// //                           }}
// //                         />
// //                       ))}
// //                     </div>
// //                     <span className="text-sm text-red-600 font-medium">
// //                       Recording...
// //                     </span>
// //                   </div>
// //                 )}

// //                 {/* Recording Button */}
// //                 <button
// //                   onClick={isRecording ? stopRecording : startRecording}
// //                   disabled={processingAudio}
// //                   className={`flex items-center justify-center w-20 h-20 rounded-full text-white font-semibold transition-all duration-200 ${
// //                     isRecording
// //                       ? 'bg-red-500 hover:bg-red-600 animate-pulse'
// //                       : 'bg-blue-600 hover:bg-blue-700'
// //                   } ${processingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
// //                 >
// //                   {processingAudio ? (
// //                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
// //                   ) : isRecording ? (
// //                     <MicOff className="w-8 h-8" />
// //                   ) : (
// //                     <Mic className="w-8 h-8" />
// //                   )}
// //                 </button>

// //                 <p className="text-sm text-gray-600 text-center">
// //                   {processingAudio
// //                     ? 'Processing your answer...'
// //                     : isRecording
// //                     ? 'Click to stop recording'
// //                     : 'Click to start recording your answer'}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* Transcript */}
// //             {transcript && (
// //               <div className="mb-6 p-4 bg-green-50 rounded-lg">
// //                 <h4 className="font-medium text-green-800 mb-2">
// //                   Your Answer (Transcribed):
// //                 </h4>
// //                 <p className="text-green-700 italic">"{transcript}"</p>
// //               </div>
// //             )}

// //             {/* Controls */}
// //             <div className="flex justify-center space-x-4">
// //               <button
// //                 onClick={resetInterview}
// //                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
// //               >
// //                 <RotateCcw className="w-4 h-4" />
// //                 <span>Reset</span>
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {interviewState === 'finished' && (
// //           <div className="bg-white rounded-xl shadow-lg p-8">
// //             <div className="text-center mb-8">
// //               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
// //                 <span className="text-3xl">🎉</span>
// //               </div>
// //               <h2 className="text-3xl font-bold text-gray-800 mb-2">
// //                 Interview Completed!
// //               </h2>
// //               <p className="text-gray-600">
// //                 Great job! Here's your feedback:
// //               </p>
// //             </div>

// //             {/* Audio Player for Feedback */}
// //             {audioUrl && (
// //               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
// //                 <div className="flex items-center justify-between mb-2">
// //                   <span className="font-medium text-gray-700">Audio Feedback:</span>
// //                   <div className="flex items-center space-x-2">
// //                     {isPlaying ? (
// //                       <VolumeX className="w-5 h-5 text-blue-600" />
// //                     ) : (
// //                       <Volume2 className="w-5 h-5 text-blue-600" />
// //                     )}
// //                   </div>
// //                 </div>
// //                 <audio
// //                   ref={audioPlayerRef}
// //                   onEnded={handleAudioEnd}
// //                   onPlay={handleAudioPlay}
// //                   onPause={handleAudioPause}
// //                   controls
// //                   className="w-full"
// //                 />
// //               </div>
// //             )}

// //             {/* Written Feedback */}
// //             <div className="mb-8 p-6 bg-blue-50 rounded-lg">
// //               <h3 className="text-xl font-semibold text-gray-800 mb-4">
// //                 Detailed Feedback:
// //               </h3>
// //               <p className="text-gray-700 leading-relaxed">
// //                 {feedback}
// //               </p>
// //             </div>

// //             {/* Final transcript */}
// //             {transcript && (
// //               <div className="mb-8 p-4 bg-gray-50 rounded-lg">
// //                 <h4 className="font-medium text-gray-700 mb-2">
// //                   Your Final Answer:
// //                 </h4>
// //                 <p className="text-gray-600 italic">"{transcript}"</p>
// //               </div>
// //             )}

// //             {/* Action Buttons */}
// //             <div className="flex flex-col sm:flex-row gap-4 justify-center">
// //               <button
// //                 onClick={resetInterview}
// //                 className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
// //               >
// //                 <RotateCcw className="w-5 h-5" />
// //                 <span>Start New Interview</span>
// //               </button>
// //             </div>
// //           </div>
// //         )}

// //         {/* Footer */}
// //         <footer className="text-center mt-8 text-gray-500 text-sm">
// //           <p>Powered by AI Voice Engine • Real-time Speech Processing</p>
// //         </footer>
// //       </div>
// //     </div>
// //   );
// // };

// // export default VoiceInterview;