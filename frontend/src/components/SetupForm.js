import React from 'react';
import { Upload, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetupForm = ({ onAssessmentStart }) => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = React.useState(null);
  const [jobDescription, setJobDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '32px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '18px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px'
    },
    icon: {
      marginRight: '8px'
    },
    uploadBox: {
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      padding: '24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.3s',
      backgroundColor: '#f9fafb'
    },
    hiddenInput: {
      display: 'none'
    },
    uploadText: {
      color: '#6b7280',
      marginTop: '12px'
    },
    textarea: {
      width: '100%',
      height: '160px',
      padding: '16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'none',
      outline: 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    },
    button: {
      width: '100%',
      color: 'white',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '16px',
      minWidth: '180px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      pointerEvents: 'none'
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const generateAssessment = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('http://localhost:3001/start-assessment', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        // Call the parent component's handler instead of navigating
        onAssessmentStart(data);
      }
    } catch (error) {
      alert('Error generating assessment. Make sure backend is running.');
    }
    setLoading(false);
  };

  const handleGenerateInterview = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      alert('Please upload a resume and enter a job description');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      setLoading(true);

      const response = await fetch('http://localhost:3001/start-interview', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        navigate('/interview', {
          state: {
            interviewData: data,
            resumeFile: resumeFile?.name,
            jobDescription: jobDescription
          }
        });
      } else {
        alert('Failed to generate interview');
      }

    } catch (error) {
      alert('Error generating interview. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <span style={{
      width: '16px',
      height: '16px',
      border: '2px solid #ffffff40',
      borderTop: '2px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block',
      marginRight: '8px'
    }}></span>
  );

  return (
    <div style={styles.card}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Resume Upload */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <FileText style={styles.icon} size={20} />
          Upload Resume (PDF - Optional)
        </label>
        <div style={styles.uploadBox}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            style={styles.hiddenInput}
            id="resume-upload"
          />
          <label htmlFor="resume-upload" style={{cursor: 'pointer'}}>
            <Upload style={{margin: '0 auto 12px', display: 'block', color: '#9ca3af'}} size={48} />
            <p style={styles.uploadText}>
              {resumeFile ? resumeFile.name : 'Click to upload or drag and drop your PDF resume'}
            </p>
          </label>
        </div>
      </div>

      {/* Job Description */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <MessageSquare style={styles.icon} size={20} />
          Job Description *
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          style={styles.textarea}
        />
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={generateAssessment}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
            background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #667eea 100%)',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Generating Assessment...
            </>
          ) : 'Generate Assessment'}
        </button>

        <button
          onClick={handleGenerateInterview}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
            background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #f093fb 0%, #667eea 100%)',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(240, 147, 251, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.3)';
            }
          }}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Generating Interview...
            </>
          ) : 'Generate Interview'}
        </button>
      </div>

      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          💡 What's the difference?
        </h4>
        <ul style={{
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: '1.5',
          paddingLeft: '20px',
          margin: '0'
        }}>
          <li><strong>Assessment:</strong> Quick evaluation with analysis and feedback</li>
          <li><strong>Interview:</strong> Full interactive interview experience with adaptive questions</li>
        </ul>
      </div>
    </div>
  );
};

export default SetupForm;