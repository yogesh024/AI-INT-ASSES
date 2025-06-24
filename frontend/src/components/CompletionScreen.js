import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Award, Trophy, Target, TrendingUp, Clock, CheckCircle, AlertTriangle, 
  BookOpen, Code, Brain, MessageSquare, BarChart3, Lightbulb, 
  ArrowRight, Star, Users, Zap, ChevronRight, Download, Share2,
  LineChart, PieChart, Activity, Gauge, Medal, Flag
} from 'lucide-react';

const CompletionScreen = ({ 
  feedback,        // ← Feedback from InterviewPlatform
  onRestart,       // ← Restart function
  type = "assessment"
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  // Define styles first before using them
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      flexDirection: 'column',
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
    header: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      zIndex: 2,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      margin: 0,
      marginLeft: '16px'
    },
    headerScore: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      textAlign: 'right'
    },
    scoreDisplay: {
      fontSize: '48px',
      fontWeight: 'bold',
      lineHeight: 1,
      marginBottom: '8px'
    },
    scoreLabel: {
      fontSize: '16px',
      opacity: 0.9,
      fontWeight: '600'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      position: 'relative',
      zIndex: 2,
      overflow: 'hidden'
    },
    sidebar: {
      width: '280px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid #e2e8f0',
      padding: '24px 0',
      overflowY: 'auto'
    },
    tabItem: {
      padding: '16px 24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderLeft: '4px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#64748b'
    },
    tabItemActive: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      borderLeftColor: '#3b82f6',
      color: '#1e40af'
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(5px)'
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      position: 'relative',
      overflow: 'hidden'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    statTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '700',
      color: '#374151'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    statSubtext: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '4px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '12px'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 1.5s ease-out',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
    },
    feedbackCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      marginBottom: '24px'
    },
    feedbackContent: {
      fontSize: '15px',
      lineHeight: '1.7',
      color: '#374151'
    },
    strengthsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    strengthItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      borderRadius: '12px',
      border: '1px solid #10b981'
    },
    improvementItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderRadius: '12px',
      border: '1px solid #f59e0b'
    },
    itemText: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#374151',
      fontWeight: '500'
    },
    scoresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px'
    },
    scoreCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
    },
    scoreHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    scoreName: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    scoreNumber: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    actionButtons: {
      display: 'flex',
      gap: '16px',
      marginTop: '32px',
      flexWrap: 'wrap'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
    },
    secondaryButton: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      color: '#374151',
      padding: '16px 32px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    },
    noDataCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      padding: '40px',
      textAlign: 'center',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)'
    }
  };

  // Process feedback data - handle both new structured format and old text format
  const processedData = React.useMemo(() => {
    if (!feedback) {
      return {
        overallScore: 5,
        performanceLevel: 'Assessment Complete',
        overallFeedback: 'Thank you for completing the assessment. Your results are being processed.',
        strengths: ['Completed the assessment', 'Engaged with questions', 'Participated actively'],
        improvements: ['Review the topics covered', 'Practice more examples', 'Continue learning'],
        detailedScores: {
          communication: 5,
          technical: 5,
          problemSolving: 5,
          clarity: 5
        },
        nextSteps: 'Continue practicing and learning to improve your skills.'
      };
    }

    // If feedback is already structured (from new LLM response)
    if (typeof feedback === 'object' && feedback.overallScore !== undefined) {
      return {
        overallScore: feedback.overallScore || 5,
        performanceLevel: feedback.performanceLevel || 'Complete',
        overallFeedback: feedback.overallFeedback || 'Assessment completed successfully.',
        strengths: feedback.strengths || ['Assessment completed'],
        improvements: feedback.improvements || ['Continue learning'],
        detailedScores: feedback.detailedScores || {
          communication: feedback.overallScore || 5,
          technical: feedback.overallScore || 5,
          problemSolving: feedback.overallScore || 5,
          clarity: feedback.overallScore || 5
        },
        nextSteps: feedback.nextSteps || 'Continue practicing to improve your skills.'
      };
    }

    // If feedback is text (from old format), create structure
    return {
      overallScore: 7,
      performanceLevel: 'Good',
      overallFeedback: typeof feedback === 'string' ? feedback : 'Assessment completed successfully.',
      strengths: [
        'Successfully completed the assessment',
        'Demonstrated problem-solving abilities',
        'Showed consistent engagement'
      ],
      improvements: [
        'Continue practicing core concepts',
        'Focus on detailed explanations',
        'Expand knowledge in weak areas'
      ],
      detailedScores: {
        communication: 7,
        technical: 7,
        problemSolving: 7,
        clarity: 7
      },
      nextSteps: 'Continue studying and practicing to strengthen your skills in the identified areas.'
    };
  }, [feedback]);

  const handleRetake = () => {
    if (onRestart) {
      onRestart();
    }
    navigate('/');
  };

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPerformanceColor = (score) => {
    if (score >= 8) return '#10b981'; // Green
    if (score >= 6) return '#3b82f6'; // Blue  
    if (score >= 4) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getPerformanceLevel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

 const renderOverview = () => (
  <div>
    <div style={styles.overviewGrid}>
      <div style={styles.statCard}>
        <div style={styles.statHeader}>
          <div style={styles.statTitle}>
            <Trophy color="#f59e0b" size={20} />
            Overall Score
          </div>
        </div>
        <div style={{...styles.statValue, color: getPerformanceColor(processedData.overallScore)}}>
          {processedData.overallScore}/10
        </div>
        <div style={styles.statSubtext}>{processedData.performanceLevel} Performance</div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill, 
              width: animationComplete ? `${processedData.overallScore * 10}%` : '0%',
              backgroundColor: getPerformanceColor(processedData.overallScore)
            }}
          />
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statHeader}>
          <div style={styles.statTitle}>
            <CheckCircle color="#10b981" size={20} />
            Assessment Status
          </div>
        </div>
        <div style={styles.statValue}>Complete</div>
        <div style={styles.statSubtext}>All questions answered</div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill, 
              width: animationComplete ? '100%' : '0%',
              backgroundColor: '#10b981'
            }}
          />
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={styles.statHeader}>
          <div style={styles.statTitle}>
            <Brain color="#3b82f6" size={20} />
            Performance Level
          </div>
        </div>
        <div style={styles.statValue}>{processedData.performanceLevel}</div>
        <div style={styles.statSubtext}>Based on overall score</div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill, 
              width: animationComplete ? `${processedData.overallScore * 10}%` : '0%',
              backgroundColor: '#3b82f6'
            }}
          />
        </div>
      </div>
    </div>

    <div style={styles.feedbackCard}>
      <h3 style={{margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937'}}>
        Comprehensive Assessment Feedback
      </h3>
      {/* ✅ CHANGED: Use dangerouslySetInnerHTML instead of text display */}
      <div 
        style={styles.feedbackContent}
        dangerouslySetInnerHTML={{ 
          __html: typeof processedData.overallFeedback === 'string' 
            ? processedData.overallFeedback
            : 'Assessment completed successfully. Thank you for your participation.'
        }}
      />
    </div>
  </div>
);

  const renderStrengths = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937'}}>
        🎯 Key Strengths Demonstrated
      </h3>
      <div style={styles.strengthsList}>
        {processedData.strengths.map((strength, index) => (
          <div key={index} style={styles.strengthItem}>
            <CheckCircle color="#10b981" size={20} style={{marginTop: '2px', flexShrink: 0}} />
            <div style={styles.itemText}>{strength}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderImprovements = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937'}}>
        📈 Development Opportunities
      </h3>
      <div style={styles.strengthsList}>
        {processedData.improvements.map((improvement, index) => (
          <div key={index} style={styles.improvementItem}>
            <TrendingUp color="#f59e0b" size={20} style={{marginTop: '2px', flexShrink: 0}} />
            <div style={styles.itemText}>{improvement}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailedScores = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937'}}>
        📊 Detailed Performance Breakdown
      </h3>
      <div style={styles.scoresGrid}>
        {Object.entries(processedData.detailedScores).map(([area, score]) => {
          const iconMap = {
            communication: MessageSquare,
            technical: Code,
            problemSolving: Lightbulb,
            clarity: Target
          };
          const IconComponent = iconMap[area] || BarChart3;
          
          return (
            <div key={area} style={styles.scoreCard}>
              <div style={styles.scoreHeader}>
                <div style={styles.scoreName}>
                  <IconComponent color={getPerformanceColor(score)} size={18} />
                  {area.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
                <div style={{...styles.scoreNumber, color: getPerformanceColor(score)}}>
                  {score}/10
                </div>
              </div>
              <div style={{fontSize: '12px', color: '#6b7280', fontWeight: '600'}}>
                {getPerformanceLevel(score)}
              </div>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill, 
                    width: animationComplete ? `${score * 10}%` : '0%',
                    backgroundColor: getPerformanceColor(score)
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderNextSteps = () => (
    <div>
      <h3 style={{margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937'}}>
        🚀 Your Next Steps
      </h3>
      <div style={styles.feedbackCard}>
        <div style={styles.feedbackContent}>
          {processedData.nextSteps}
        </div>
      </div>
      
      <div style={styles.actionButtons}>
        <button 
          style={styles.primaryButton}
          onClick={() => navigate('/')}
          className="button-hover"
        >
          <ArrowRight size={18} />
          Start New Assessment
        </button>
        <button 
          style={styles.secondaryButton}
          onClick={handleRetake}
          className="button-hover"
        >
          <Target size={18} />
          Retake Assessment
        </button>
        <button 
          style={styles.secondaryButton}
          className="button-hover"
        >
          <Share2 size={18} />
          Share Results
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'strengths', label: 'Strengths', icon: Star },
    { id: 'improvements', label: 'Growth Areas', icon: TrendingUp },
    { id: 'scores', label: 'Detailed Scores', icon: BarChart3 },
    { id: 'nextsteps', label: 'Next Steps', icon: Flag }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'strengths': return renderStrengths();
      case 'improvements': return renderImprovements();
      case 'scores': return renderDetailedScores();
      case 'nextsteps': return renderNextSteps();
      default: return renderOverview();
    }
  };

  // No feedback available
  if (!feedback) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundPattern}></div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={styles.noDataCard}>
            <AlertTriangle size={48} color="#f59e0b" style={{marginBottom: '20px'}} />
            <h2 style={{margin: '0 0 16px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937'}}>
              No Feedback Available
            </h2>
            <p style={{margin: '0 0 24px 0', color: '#6b7280', fontSize: '16px'}}>
              Please complete an assessment to receive detailed feedback.
            </p>
            <button 
              onClick={() => navigate('/')}
              style={styles.primaryButton}
            >
              <Target size={18} />
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        .button-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      }
      
      .tab-hover:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #1e40af;
      }
      
      /* Custom scrollbar */
      *::-webkit-scrollbar {
        width: 6px;
      }
      
      *::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      
      *::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      
      *::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      /* ✅ ADD THESE CSS STYLES FOR THE HTML FEEDBACK */
      .comprehensive-feedback {
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        line-height: 1.6;
        color: #374151;
        max-width: 100%;
      }

      .section {
        margin-bottom: 24px;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .overview-section {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-color: #0ea5e9;
      }

      .strengths-section {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-color: #22c55e;
      }

      .improvements-section {
        background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
        border-color: #eab308;
      }

      .performance-section {
        background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
        border-color: #a855f7;
      }

      .job-fit-section {
        background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
        border-color: #ea580c;
      }

      .next-steps-section {
        background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
        border-color: #3b82f6;
      }

      .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid rgba(0, 0, 0, 0.1);
      }

      .summary-text, .job-fit-text {
        font-size: 15px;
        line-height: 1.7;
        color: #374151;
        margin: 0;
        font-weight: 500;
      }

      .content-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .strength-item, .improvement-item, .next-step-item {
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.6;
        border-left: 4px solid;
      }

      .strength-item {
        background: rgba(34, 197, 94, 0.1);
        border-left-color: #22c55e;
      }

      .improvement-item {
        background: rgba(234, 179, 8, 0.1);
        border-left-color: #eab308;
      }

      .next-step-item {
        background: rgba(59, 130, 246, 0.1);
        border-left-color: #3b82f6;
      }

      .format-performance {
        display: grid;
        gap: 12px;
      }

      .performance-metric {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
      }

      .metric-highlight {
        font-weight: 700;
        color: #059669;
        background: rgba(16, 185, 129, 0.15);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 14px;
      }

      .comprehensive-feedback strong {
        color: #1f2937;
        font-weight: 700;
      }
    `}</style>

      <div style={styles.backgroundPattern}></div>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <Award size={32} />
            <h1 style={styles.headerTitle}>Assessment Complete</h1>
          </div>
          <div style={styles.headerScore}>
            <div style={styles.scoreDisplay}>{processedData.overallScore}/10</div>
            <div style={styles.scoreLabel}>{processedData.performanceLevel} Performance</div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Sidebar Navigation */}
        <div style={styles.sidebar}>
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabItem,
                  ...(activeTab === tab.id ? styles.tabItemActive : {})
                }}
                className="tab-hover"
              >
                <IconComponent size={18} />
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;