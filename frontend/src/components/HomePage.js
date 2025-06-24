// import React, { useState } from 'react';
// import { Upload, FileText, MessageSquare, CheckCircle } from 'lucide-react';
// import { Link,useNavigate } from 'react-router-dom';

// import { useInterview } from '../context/InterviewContext';


// const InterviewPlatform = () => {
// const navigate = useNavigate();
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
//   const [interviewData,setInterviewData]=useState('');
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
//       const response = await fetch('http://localhost:3001/start-assesment', {
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
// const handleGenerateInterview = async () => {
//   if (!resumeFile || !jobDescription.trim()) {
//     alert('Please upload a resume and enter a job description');
//     return;
//   }

//   const formData = new FormData();
//   formData.append('resume', resumeFile);
//   formData.append('jobDescription', jobDescription);

//   try {
//     setLoading(true);

//     const response = await fetch('http://localhost:3001/start-interview', {
//       method: 'POST',
//       body: formData
//     });

//     const data = await response.json();
//     console.log('Interview Data:', data);

//     if (data.success) {
//       // Optional: set local state if needed
//       setInterviewData(data);
//       setCurrentQuestion(data.question);
//       setTotalQuestions(data.totalQuestions);
//       setQuestionNumber(data.questionNumber);
//       setStep('interview');

//       // Navigate with data
//       navigate('/interview', {
//         state: {
//           interviewData: data
//         }
//       });
//     } else {
//       alert('Failed to generate interview');
//     }

//   } catch (error) {
//     alert('Error generating interview. Make sure backend is running.');
//   } finally {
//     setLoading(false);
//   }
// };

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

//     <div style={{
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
//   onClick={handleGenerateInterview}
//     to='/interview'
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
//       opacity: loading ? 0.6 : 1,
//       textDecoration: 'none',
//       display: 'inline-flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       pointerEvents: loading ? 'none' : 'auto'
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






import React, { useState } from 'react';
import SetupForm from './SetupForm';
import AssessmentScreen from './AssessmentScreen.js';
import CompletionScreen from './CompletionScreen.js';

const InterviewPlatform = () => {
  const [step, setStep] = useState('setup'); // setup, assessment, completed
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [responseQuality, setResponseQuality] = useState('');
  const [adaptiveFeedback, setAdaptiveFeedback] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    maxWidth: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '10px',
      margin: '0'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '16px'
    }
  };

  // Handle assessment start from SetupForm
  const handleAssessmentStart = (assessmentData) => {
    setCurrentQuestion(assessmentData.question);
    setTotalQuestions(assessmentData.totalQuestions);
    setQuestionNumber(assessmentData.questionNumber);
    setStep('assessment');
  };

  // Handle answer submission in assessment
  const handleSubmitAnswer = async (answer) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
      });

      const data = await response.json();
      
      if (data.finished) {
        setFeedback(data.feedback);
        setStep('completed');
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionNumber(data.questionNumber);
        
        // Show adaptive feedback
        if (data.previousAnalysis) {
          setResponseQuality(data.previousAnalysis.quality);
          setAdaptiveFeedback(data.previousAnalysis.feedback || data.previousAnalysis.ui_feedback);
        }
      }
    } catch (error) {
      alert('Error submitting answer');
    }
    
    setLoading(false);
  };

  // Handle assessment restart
  const handleRestart = () => {
    setStep('setup');
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setFeedback('');
    setResponseQuality('');
    setAdaptiveFeedback('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <header style={styles.header}>
          <h1 style={styles.title}>AI Interview Platform</h1>
          <p style={styles.subtitle}>
            Upload your resume, enter job description, and practice interviews
          </p>
        </header>

        {step === 'setup' && (
          <SetupForm onAssessmentStart={handleAssessmentStart} />
        )}

        {step === 'assessment' && (
          <AssessmentScreen
            currentQuestion={currentQuestion}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            adaptiveFeedback={adaptiveFeedback}
            responseQuality={responseQuality}
            onSubmitAnswer={handleSubmitAnswer}
            loading={loading}
          />
        )}

        {step === 'completed' && (
          <CompletionScreen
            feedback={feedback}
            onRestart={handleRestart}
            type="assessment"
          />
        )}
      </div>
    </div>
  );
};

export default InterviewPlatform;



