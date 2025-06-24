const FeedbackModal = ({ feedback, isOpen, onClose }) => {
  if (!isOpen || !feedback) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    },
    modal: {
      backgroundColor: '#1f2937',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto',
      color: 'white',
      position: 'relative'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #374151'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ffffff',
      margin: 0
    },
    closeButton: {
      backgroundColor: '#374151',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '14px'
    },
    section: {
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: '#374151',
      borderRadius: '8px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#60a5fa'
    },
    scoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '16px'
    },
    score: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#10b981'
    },
    scoreLabel: {
      fontSize: '14px',
      color: '#9ca3af'
    },
    feedbackText: {
      lineHeight: '1.6',
      color: '#e5e7eb'
    },
    strengthsList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    strengthItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      color: '#10b981'
    },
    improvementItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      color: '#f59e0b'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎯 Interview Feedback</h2>
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        {/* Overall Score */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Overall Performance</h3>
          <div style={styles.scoreContainer}>
            <div style={styles.score}>{feedback.overallScore}/10</div>
            <div>
              <div style={styles.scoreLabel}>Overall Score</div>
              <div style={{...styles.scoreLabel, marginTop: '4px'}}>
                {feedback.performanceLevel}
              </div>
            </div>
          </div>
          <p style={styles.feedbackText}>{feedback.overallFeedback}</p>
        </div>

        {/* Strengths */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>✅ Strengths</h3>
          <ul style={styles.strengthsList}>
            {feedback.strengths.map((strength, index) => (
              <li key={index} style={styles.strengthItem}>
                <span>✅</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔍 Areas for Improvement</h3>
          <ul style={styles.strengthsList}>
            {feedback.improvements.map((improvement, index) => (
              <li key={index} style={styles.improvementItem}>
                <span>💡</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detailed Analysis */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Detailed Analysis</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
            <div>
              <div style={styles.scoreLabel}>Communication</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#3b82f6'}}>
                {feedback.detailedScores.communication}/10
              </div>
            </div>
            <div>
              <div style={styles.scoreLabel}>Technical Knowledge</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#3b82f6'}}>
                {feedback.detailedScores.technical}/10
              </div>
            </div>
            <div>
              <div style={styles.scoreLabel}>Problem Solving</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#3b82f6'}}>
                {feedback.detailedScores.problemSolving}/10
              </div>
            </div>
            <div>
              <div style={styles.scoreLabel}>Clarity</div>
              <div style={{fontSize: '20px', fontWeight: 'bold', color: '#3b82f6'}}>
                {feedback.detailedScores.clarity}/10
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🚀 Next Steps</h3>
          <p style={styles.feedbackText}>{feedback.nextSteps}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;