import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Brain, Target, Lightbulb, ChevronRight, MessageSquare, Code, Type, Maximize, Minimize } from 'lucide-react';

const AssessmentScreen = ({ 
  currentQuestion, 
  questionNumber, 
  totalQuestions, 
  adaptiveFeedback, 
  responseQuality,
  onSubmitAnswer,
  onComplete,
  loading 
}) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check for window size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1200);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Use the question from backend or fallback to a default
  const displayQuestion = currentQuestion || {
    question: "Describe your experience with implementing microservices architecture. What challenges did you face and how did you overcome them?",
    type: "open_ended",
    focus_area: "System Design",
    difficulty: "medium",
    estimated_time: "3-5 min",
    reasoning: "This question assesses practical experience with distributed systems and problem-solving skills.",
    ui_hint: "Provide specific examples with metrics and outcomes."
  };

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      flexDirection: isLargeScreen ? 'row' : 'column',
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
      `,
      zIndex: 1
    },
    leftPanel: {
      position: 'relative',
      zIndex: 2,
      width: isLargeScreen ? '55%' : '100%',
      height: isLargeScreen ? '100vh' : '45vh',
      borderRight: isLargeScreen ? '1px solid #e2e8f0' : 'none',
      borderBottom: !isLargeScreen ? '1px solid #e2e8f0' : 'none',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)'
    },
    rightPanel: {
      position: 'relative',
      zIndex: 2,
      width: isLargeScreen ? '45%' : '100%',
      height: isLargeScreen ? '100vh' : '55vh',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px 32px',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    },
    headerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)'
    },
    headerContent: {
      position: 'relative',
      zIndex: 2
    },
    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      margin: 0
    },
    titleIcon: {
      marginRight: '12px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    badge: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '24px',
      fontSize: '14px',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    progressContainer: {
      marginBottom: '12px'
    },
    progressLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      fontSize: '14px',
      opacity: 0.9
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
      position: 'relative'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      borderRadius: '4px',
      transition: 'width 0.8s ease',
      position: 'relative'
    },
    progressShine: {
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: 'shine 2s infinite'
    },
    scrollableContent: {
      flex: 1,
      overflowY: 'auto',
      padding: '28px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    feedbackCard: {
      background: responseQuality === 'high' ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 
                  responseQuality === 'low' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 
                  'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      border: `2px solid ${responseQuality === 'high' ? '#10b981' : 
                           responseQuality === 'low' ? '#f59e0b' : '#3b82f6'}`,
      borderRadius: '16px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
    },
    feedbackHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px'
    },
    feedbackTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: responseQuality === 'high' ? '#065f46' : 
             responseQuality === 'low' ? '#92400e' : '#1e40af',
      marginLeft: '8px'
    },
    feedbackText: {
      fontSize: '14px',
      color: responseQuality === 'high' ? '#047857' : 
             responseQuality === 'low' ? '#d97706' : '#1d4ed8',
      lineHeight: '1.5',
      margin: 0
    },
    questionCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    questionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '2px solid #e2e8f0',
      flexShrink: 0
    },
    questionLabel: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1f2937',
      marginLeft: '8px'
    },
    questionContent: {
      flex: 1,
      overflowY: 'auto',
      paddingRight: '8px'
    },
questionText: {
  fontSize: '16px',
  color: '#374151',
  lineHeight: '1.7',
  marginBottom: '24px',
  fontWeight: '500',
  fontFamily: '"Poppins", "Helvetica Neue", Arial, sans-serif',
  letterSpacing: '0.025em',
  fontStyle: 'italic'
},
    tagContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: '#e0e7ff',
      color: '#3730a3'
    },
    focusTag: {
      background: '#d1fae5',
      color: '#065f46'
    },
    difficultyTag: {
      background: '#fef3c7',
      color: '#92400e'
    },
    metaInfo: {
      background: '#f1f5f9',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '14px',
      color: '#64748b',
      fontStyle: 'italic',
      border: '1px solid #e2e8f0',
      marginTop: '16px'
    },
    answerSection: {
      padding: '28px 32px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    answerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      flexShrink: 0
    },
    answerLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '20px',
      fontWeight: '700',
      color: '#374151'
    },
    modeToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: '#f1f5f9',
      borderRadius: '10px',
      padding: '4px'
    },
    toggleButton: {
      background: 'transparent',
      color: '#6b7280',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    textareaContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    },
    textarea: {
      width: '100%',
      flex: 1,
      padding: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '15px',
      resize: 'none',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily: isCodeMode ? 'Monaco, Consolas, "Courier New", monospace' : 'inherit',
      lineHeight: '1.6',
      background: isCodeMode ? '#1a1a1a' : '#ffffff',
      color: isCodeMode ? '#e5e7eb' : '#374151',
      minHeight: '200px'
    },
    tipBox: {
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      border: '1px solid #a7f3d0',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      flexShrink: 0
    },
    tipText: {
      fontSize: '13px',
      color: '#047857',
      lineHeight: '1.5',
      marginLeft: '8px'
    },
    submitButton: {
      width: '100%',
      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      fontWeight: '700',
      padding: '16px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: loading ? 'none' : '0 8px 32px rgba(16, 185, 129, 0.3)',
      marginTop: '20px',
      flexShrink: 0
    },
    mcqContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      flex: 1
    },
    mcqHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px'
    },
    mcqTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#374151',
      marginLeft: '8px'
    },
    optionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1
    },
    optionItem: {
      background: '#ffffff',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px 20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      position: 'relative'
    },
    optionSelected: {
      borderColor: '#3b82f6',
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)',
      transform: 'translateY(-2px)'
    },
    optionLetter: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#f1f5f9',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '700',
      flexShrink: 0
    },
    optionLetterSelected: {
      background: '#3b82f6',
      color: '#ffffff'
    },
    optionText: {
      fontSize: '15px',
      color: '#374151',
      lineHeight: '1.6',
      flex: 1
    },
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  const handleSubmit = () => {
    const answer = displayQuestion.type === 'mcq' ? selectedOption : currentAnswer;
    
    if (!answer || !answer.trim()) {
      alert(displayQuestion.type === 'mcq' ? 'Please select an option' : 'Please provide an answer');
      return;
    }

    if (onSubmitAnswer) {
      onSubmitAnswer(answer);
    }
    setCurrentAnswer('');
    setSelectedOption('');
  };

  const handleOptionSelect = (optionLetter) => {
    setSelectedOption(optionLetter);
  };

  const handleTextareaChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const progressPercentage = ((questionNumber || 1) / (totalQuestions || 10)) * 100;

  // Safe function to format question type
  const formatQuestionType = (type) => {
    if (!type) return 'Question';
    if (type === 'mcq') return 'Multiple Choice';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .textarea-focus:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        
        .submit-hover:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
        }
        
        .toggle-hover:hover {
          transform: translateY(-1px);
          background: #e5e7eb !important;
        }
        
        .toggle-active {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        .toggle-code-active {
          background: #1f2937 !important;
          color: #ffffff !important;
        }
        
        .option-hover:hover {
          border-color: #94a3b8 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        /* Custom scrollbar */
        .scrollable-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollable-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .scrollable-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      
      <div style={styles.backgroundPattern}></div>
      
      {/* Left Panel - Questions */}
      <div style={styles.leftPanel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerBackground}></div>
          <div style={styles.headerContent}>
            <div style={styles.titleRow}>
              <h1 style={styles.title}>
                <div style={styles.titleIcon}>
                  <Brain size={24} />
                </div>
                AI Assessment
              </h1>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <span style={styles.badge}>
                  Question {questionNumber || 1} of {totalQuestions || 10}
                </span>
                {displayQuestion.estimated_time && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock size={14} />
                    {displayQuestion.estimated_time}
                  </span>
                )}
              </div>
            </div>
            
            <div style={styles.progressContainer}>
              <div style={styles.progressLabel}>
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${progressPercentage}%`}}>
                  <div style={styles.progressShine}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="scrollable-content" style={styles.scrollableContent}>
{/* Adaptive Feedback */}
{/* {adaptiveFeedback && (
  <div style={styles.feedbackCard}>
    <div style={styles.feedbackHeader}>
      <Target size={18} color={responseQuality === 'high' ? '#10b981' : 
                              responseQuality === 'low' ? '#f59e0b' : '#3b82f6'} />
      <span style={styles.feedbackTitle}>
        Previous Response: {responseQuality?.toUpperCase()}
      </span>
    </div>
    <div 
      style={styles.feedbackText}
      dangerouslySetInnerHTML={{ __html: adaptiveFeedback }}
    />
  </div>
)} */}

          {/* Question Card */}
          <div style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <MessageSquare size={24} color="#3b82f6" />
              <h2 style={styles.questionLabel}>Question</h2>
            </div>
            
            <div style={styles.questionContent}>
              <p style={styles.questionText}>{displayQuestion.question}</p>
              
              <div style={styles.tagContainer}>
                <span style={styles.tag}>
                  {formatQuestionType(displayQuestion.type)}
                </span>
                {displayQuestion.focus_area && (
                  <span style={{...styles.tag, ...styles.focusTag}}>
                    {displayQuestion.focus_area}
                  </span>
                )}
                {/* {displayQuestion.difficulty && (
                  <span style={{
                    ...styles.tag, 
                    ...styles.difficultyTag,
                    ...(displayQuestion.difficulty === 'hard' && {background: '#fef2f2', color: '#dc2626'}),
                    ...(displayQuestion.difficulty === 'easy' && {background: '#f0fdf4', color: '#166534'})
                  }}>
                    {displayQuestion.difficulty}
                  </span>
                )} */}
              </div>
              
              {(displayQuestion.reasoning || displayQuestion.ui_hint) && (
                <div style={styles.metaInfo}>
                  {displayQuestion.reasoning && (
                    <div style={{marginBottom: displayQuestion.ui_hint ? '8px' : '0'}}>
                      <strong>Assessment Focus:</strong> {displayQuestion.reasoning}
                    </div>
                  )}
                  {displayQuestion.ui_hint && (
                    <div>
                      <strong>Hint:</strong> {displayQuestion.ui_hint}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Answer Section */}
      <div style={styles.rightPanel}>
        <div style={styles.answerSection}>
          {displayQuestion.type === 'mcq' ? (
            <div style={styles.mcqContainer}>
              <div style={styles.mcqHeader}>
                <Target size={24} color="#10b981" />
                <h2 style={styles.mcqTitle}>Select Your Answer</h2>
              </div>
              
              <div style={styles.optionsList}>
                {displayQuestion.options?.map((option) => (
                  <div
                    key={option.letter}
                    onClick={() => handleOptionSelect(option.letter)}
                    style={{
                      ...styles.optionItem,
                      ...(selectedOption === option.letter ? styles.optionSelected : {})
                    }}
                    className="option-hover"
                  >
                    <div style={{
                      ...styles.optionLetter,
                      ...(selectedOption === option.letter ? styles.optionLetterSelected : {})
                    }}>
                      {option.letter}
                    </div>
                    <span style={styles.optionText}>{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div style={styles.answerHeader}>
                <label style={styles.answerLabel}>
                  <ChevronRight size={20} color="#10b981" />
                  Your Answer
                </label>
                <div style={styles.modeToggle}>
                  <button
                    className={`toggle-hover ${!isCodeMode ? 'toggle-active' : ''}`}
                    onClick={() => setIsCodeMode(false)}
                    style={{
                      ...styles.toggleButton,
                      ...((!isCodeMode) && {background: '#3b82f6', color: '#ffffff'})
                    }}
                  >
                    <Type size={14} />
                    Text
                  </button>
                  <button
                    className={`toggle-hover ${isCodeMode ? 'toggle-code-active' : ''}`}
                    onClick={() => setIsCodeMode(true)}
                    style={{
                      ...styles.toggleButton,
                      ...(isCodeMode && {background: '#1f2937', color: '#ffffff'})
                    }}
                  >
                    <Code size={14} />
                    Code
                  </button>
                </div>
              </div>
              
              <div style={styles.textareaContainer}>
                <textarea
                  className="textarea-focus"
                  value={currentAnswer}
                  onChange={handleTextareaChange}
                  placeholder={isCodeMode ? 
                    "// Write your code solution here...\nfunction solution() {\n  // Your implementation\n  return result;\n}" :
                    "Share your experience with specific examples, metrics, and outcomes. Use the STAR method (Situation, Task, Action, Result) for comprehensive answers..."
                  }
                  style={styles.textarea}
                  disabled={loading}
                />
                
                <div style={styles.tipBox}>
                  <Lightbulb size={14} color="#10b981" />
                  {/* <p style={styles.tipText}>
                    <strong>Pro Tip:</strong> {isCodeMode ? 
                      "Write clean, well-commented code with clear variable names. Explain your approach and time complexity." :
                      "Provide specific examples with quantifiable results. Focus on your role, challenges faced, and the impact of your solutions."
                    }
                  </p> */}
                </div>
              </div>
            </>
          )}

          <button
            className="submit-hover"
            onClick={handleSubmit}
            disabled={loading || (displayQuestion.type === 'mcq' ? !selectedOption : !currentAnswer.trim())}
            style={styles.submitButton}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Analyzing Response...
              </>
            ) : (
              <>
                <ChevronRight size={18} />
                {displayQuestion.type === 'mcq' ? 'Submit Answer' : 'Submit & Continue'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentScreen;