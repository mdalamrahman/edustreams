// src/components/CareerSalaryAndJobEnginePage.tsx
import React from 'react';
import { CareerSalaryAndJobEngine } from './CareerSalaryAndJobEngine';

export const CareerSalaryAndJobEnginePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-[98%] xl:max-w-7xl mx-auto">
        <CareerSalaryAndJobEngine />
      </div>
    </div>
  );
};
export default CareerSalaryAndJobEnginePage;
