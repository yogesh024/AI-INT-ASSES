import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Star, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  Target, 
  Clock, 
  MessageSquare,
  Award,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader,
  BookOpen,
  Users,
  Zap,
  Calendar
} from 'lucide-react';

const CandidateFeedbackPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const conversationHistory = state?.conversationHistory || [];
  const interviewData = state?.interviewData || {};
  const totalQuestions = state?.totalQuestions || 5;
  const questionsAnswered = state?.questionsAnswered || 0;
  const interviewDuration = state?.interviewDuration || 0;

  // Component state
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    communication: true,
    strengths: true,
    development: false,
    behavioral: false,
    actionPlan: false,
    tips: false
  });

  // Generate feedback on component mount
  useEffect(() => {
    generateFeedback();
  }, []);

  const generateFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/generate-candidate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory: conversationHistory,
          interviewData: {
            ...interviewData,
            candidateName: 'Candidate', // You can get this from user context
            role: interviewData.jobTitle || 'Software DEV',
            company: interviewData.company || 'TechCorp'
          },
          duration: Math.floor(interviewDuration / 60) // Convert to minutes
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setFeedback(data.feedback);
      } else {
        throw new Error(data.error || 'Failed to generate feedback');
      }

    } catch (error) {
      console.error('Error generating feedback:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#f59e0b';
    if (score >= 65) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 65) return 'Developing';
    return 'Needs Improvement';
  };

  const getLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'excellent': return '#10b981';
      case 'strong': return '#10b981';
      case 'good': return '#f59e0b';
      case 'developing': return '#f97316';
      default: return '#6b7280';
    }
  };

  const ScoreCircle = ({ score, size = 80 }) => {
    const radius = size / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: size > 60 ? '16px' : '12px', fontWeight: 'bold', color: getScoreColor(score) }}>
            {score}
          </div>
          <div style={{ fontSize: size > 60 ? '10px' : '8px', color: '#9ca3af' }}>
            /100
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} className="animate-spin" style={{ margin: '0 auto 16px', color: '#3b82f6' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Analyzing Your Interview Performance</h2>
          <p style={{ margin: 0, color: '#9ca3af' }}>AI is reviewing your responses and generating personalized feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#ef4444' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Error Generating Feedback</h2>
          <p style={{ margin: '0 0 16px 0', color: '#9ca3af' }}>{error}</p>
          <button
            onClick={generateFeedback}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', sans-serif"
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#f3f4f6',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151'
    },
    title: {
      margin: 0,
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    scoreHeader: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      marginBottom: '24px'
    },
    scoreGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '20px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      cursor: 'pointer'
    },
    strengthCard: {
      border: '1px solid #10b981',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#f0fdf4'
    },
    developmentCard: {
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fffbeb'
    },
    behavioralCard: {
      border: '1px solid #8b5cf6',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#faf5ff'
    },
    actionCard: {
      border: '1px solid #3b82f6',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#eff6ff'
    },
    tipCard: {
      border: '1px solid #6b7280',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#f9fafb'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              style={styles.backButton}
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
            <h1 style={styles.title}>🎯 Your Interview Feedback</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Score Header */}
        <div style={styles.scoreHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Award size={32} />
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                🎥 AI Interview Performance Report
              </h1>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                Personalized feedback to help you excel in future interviews
              </p>
            </div>
          </div>
          
          <div style={styles.scoreGrid}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                {feedback?.overallScore?.score || 78}/100
              </div>
              <div>🎯 Overall Performance</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {feedback?.overallScore?.level || 'Good'} Level
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                {feedback?.metadata?.interviewDuration || Math.floor(interviewDuration / 60)}
              </div>
              <div>⏱️ Interview Duration</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>minutes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                {feedback?.metadata?.questionsAnswered || questionsAnswered}/{feedback?.metadata?.totalQuestions || totalQuestions}
              </div>
              <div>💬 Questions Completed</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {Math.round(((feedback?.metadata?.questionsAnswered || questionsAnswered) / (feedback?.metadata?.totalQuestions || totalQuestions)) * 100)}% completion
              </div>
            </div>
          </div>
        </div>

        {/* Communication Breakdown */}
        <div style={styles.card}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('communication')}
          >
            <MessageSquare size={24} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              📊 Communication Skills Breakdown
            </h2>
            {expandedSections.communication ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.communication && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                <ScoreCircle score={feedback?.communicationBreakdown?.technicalExplanation?.score || 82} size={60} />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Technical Explanation</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {feedback?.communicationBreakdown?.technicalExplanation?.feedback || 'Strong technical communication skills demonstrated'}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                <ScoreCircle score={feedback?.communicationBreakdown?.problemSolvingArticulation?.score || 76} size={60} />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Problem-Solving Articulation</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {feedback?.communicationBreakdown?.problemSolvingArticulation?.feedback || 'Good logical approach to problem-solving'}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                <ScoreCircle score={feedback?.communicationBreakdown?.behavioralResponses?.score || 74} size={60} />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Behavioral Responses</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {feedback?.communicationBreakdown?.behavioralResponses?.feedback || 'Solid examples with room for better structure'}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                <ScoreCircle score={feedback?.communicationBreakdown?.culturalFitIndicators?.score || 80} size={60} />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Cultural Fit</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {feedback?.communicationBreakdown?.culturalFitIndicators?.feedback || 'Good alignment with company values'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Strengths */}
        <div style={styles.card}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('strengths')}
          >
            <CheckCircle size={24} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              ✨ Your Key Strengths
            </h2>
            {expandedSections.strengths ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.strengths && (
            <>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                🌟 What You Excelled At:
              </div>

              {(feedback?.strengths || []).map((strength, index) => (
                <div key={index} style={styles.strengthCard}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>
                    {strength.category}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                    <strong>What you did well:</strong> {strength.description}
                  </p>
                  <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px' }}>
                    <strong>Evidence:</strong> {strength.evidence}
                  </p>
                  <p style={{ margin: 0, color: '#059669', fontSize: '14px' }}>
                    <strong>Why it matters:</strong> {strength.impact}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Development Areas */}
        <div style={styles.card}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('development')}
          >
            <TrendingUp size={24} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              🚀 Growth Opportunities
            </h2>
            {expandedSections.development ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.development && (
            <>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
                📈 Areas to Strengthen:
              </div>

              {(feedback?.developmentAreas || []).map((area, index) => (
                <div key={index} style={styles.developmentCard}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#d97706' }}>
                    {area.category}
                  </h3>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                      <strong style={{ color: '#7c2d12' }}>Current Level:</strong> {area.currentLevel}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                      <strong style={{ color: '#dc2626' }}>Challenge:</strong> {area.challenge}
                    </p>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                      <strong style={{ color: '#059669' }}>Improvement Strategy:</strong> {area.improvement}
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px' }}>
                      🎯 Practice Activities:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563' }}>
                      {(area.practiceActivities || []).map((activity, i) => (
                        <li key={i}>{activity}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1d4ed8', marginBottom: '4px' }}>
                      📚 Recommended Resources:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563' }}>
                      {(area.resources || []).map((resource, i) => (
                        <li key={i}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Behavioral Insights */}
        <div style={styles.card}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('behavioral')}
          >
            <Brain size={24} color="#8b5cf6" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              🧠 Behavioral Assessment
            </h2>
            {expandedSections.behavioral ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.behavioral && (
            <>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', color: '#8b5cf6' }}>
                🎭 Key Behavioral Traits:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {Object.entries(feedback?.behavioralInsights || {}).map(([key, value]) => {
                  if (key === 'leadershipPotential' || key === 'teamCollaboration' || key === 'adaptability' || key === 'innovationMindset') {
                    const iconMap = {
                      leadershipPotential: '👑',
                      teamCollaboration: '🤝',
                      adaptability: '🔄',
                      innovationMindset: '💡'
                    };
                    
                    const titleMap = {
                      leadershipPotential: 'Leadership Potential',
                      teamCollaboration: 'Team Collaboration',
                      adaptability: 'Adaptability',
                      innovationMindset: 'Innovation Mindset'
                    };

                    return (
                      <div key={key} style={styles.behavioralCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '20px' }}>{iconMap[key]}</span>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                            {titleMap[key]}
                          </h3>
                        </div>
                        
                        <div style={{ 
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: getLevelColor(value.level),
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '8px'
                        }}>
                          {value.level}
                        </div>
                        
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
                            Evidence:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#4b5563' }}>
                            {(value.evidence || []).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px' }}>
                            Development Suggestions:
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#4b5563' }}>
                            {(value.developmentSuggestions || []).map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </>
          )}
        </div>

        {/* Action Plan */}
        <div style={styles.card}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('actionPlan')}
          >
            <Target size={24} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              📅 Your Personalized Action Plan
            </h2>
            {expandedSections.actionPlan ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.actionPlan && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {Object.entries(feedback?.actionPlan || {}).map(([timeframe, plan]) => {
                const iconMap = {
                  immediate: '⚡',
                  shortTerm: '📈', 
                  longTerm: '🎯'
                };

                const colorMap = {
                  immediate: '#ef4444',
                  shortTerm: '#f59e0b',
                  longTerm: '#10b981'
                };

                return (
                  <div key={timeframe} style={{
                    ...styles.actionCard,
                    borderColor: colorMap[timeframe],
                    backgroundColor: timeframe === 'immediate' ? '#fef2f2' : timeframe === 'shortTerm' ? '#fffbeb' : '#f0fdf4'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{iconMap[timeframe]}</span>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: colorMap[timeframe] }}>
                        {plan.title}
                      </h3>
                    </div>
                    
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#4b5563' }}>
                      {(plan.actions || []).map((action, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{action}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interview Tips */}
        <div style={styles.card}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('tips')}
          >
            <Lightbulb size={24} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              💡 Pro Interview Tips
            </h2>
            {expandedSections.tips ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedSections.tips && (
            <>
              <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>
                🎯 Expert Advice for Your Next Interview:
              </div>

              {(feedback?.interviewTips || []).map((tip, index) => {
                const iconMap = {
                  'Preparation': '📋',
                  'Communication': '🗣️',
                  'Technical Discussion': '💻',
                  'Behavioral Questions': '🎭',
                  'Follow-up': '✉️'
                };

                return (
                  <div key={index} style={styles.tipCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{iconMap[tip.category] || '💡'}</span>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
                        {tip.category}
                      </h3>
                    </div>
                    
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563' }}>
                      <strong>Tip:</strong> {tip.tip}
                    </p>
                    
                    <div style={{ 
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#374151',
                      borderLeft: '3px solid #6b7280'
                    }}>
                      <strong>Example:</strong> {tip.example}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Encouragement */}
        <div style={{
          ...styles.card,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Star size={24} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              🌟 Keep Going - You've Got This!
            </h2>
            <Star size={24} />
          </div>
          
          <p style={{ 
            margin: 0, 
            fontSize: '16px', 
            lineHeight: '1.6',
            opacity: 0.95
          }}>
            {feedback?.encouragement || 
            "You demonstrated strong technical skills and genuine enthusiasm for the role. With focused practice on the areas we've identified, you'll be an even stronger candidate. Your problem-solving approach and collaborative mindset are definite assets. Keep building on these strengths and stay confident in your abilities!"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            🎯 AI-Powered Interview Analysis Complete
          </p>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
            Generated on {new Date().toLocaleDateString()} • Personal Development Report • Keep practicing and improving!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateFeedbackPage;