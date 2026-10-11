import React from 'react';
import { VelocityTracker } from './VelocityTracker';
import { DiagnosticCard } from './DiagnosticCard';
import { useAppContext } from '../lib/AppContext';

export const AnalyticsPage: React.FC = () => {
  const { totalSolved, totalActiveMins, accuracyPercent, timeBreakdown } = useAppContext();

  return (
    <div className="space-y-6">
      <VelocityTracker
        totalSolved={totalSolved}
        totalActiveMins={totalActiveMins}
        accuracyPercent={accuracyPercent}
        timeBreakdown={timeBreakdown}
      />

      <DiagnosticCard
        totalSolved={totalSolved}
        totalMins={totalActiveMins}
        accuracyPercent={accuracyPercent}
      />
    </div>
  );
};
