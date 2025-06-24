import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  return (
    <InterviewContext.Provider value={{ resume, setResume, jobDescription, setJobDescription }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => useContext(InterviewContext);
