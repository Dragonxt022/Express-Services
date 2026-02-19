
import React, { createContext, useContext, useState, useCallback } from 'react';
import AnimatedFeedback from '../components/AnimatedFeedback';

type FeedbackType = 'success' | 'error';

interface FeedbackState {
  type: FeedbackType;
  message: string;
}

interface FeedbackContextType {
  showFeedback: (type: FeedbackType, message: string) => void;
  hideFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const showFeedback = useCallback((type: FeedbackType, message: string) => {
    setFeedback({ type, message });
  }, []);

  const hideFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback }}>
      {children}
      {feedback && (
        <AnimatedFeedback
          type={feedback.type}
          message={feedback.message}
          onClose={hideFeedback}
        />
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
