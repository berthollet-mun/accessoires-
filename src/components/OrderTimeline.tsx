import React from 'react';

interface OrderTimelineProps {
  status: string;
}

export const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const steps = ['pending', 'paid', 'shipped', 'delivered'];
  const stepLabels: Record<string, string> = {
    pending: 'en attente',
    paid: 'payé',
    shipped: 'expédié',
    delivered: 'livré'
  };
  
  // Find current step index, default to 0 if unknown
  const currentIndex = steps.indexOf(status.toLowerCase());
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="relative pt-6 pb-2">
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/10 -z-10 -translate-y-1/2"></div>
      <div 
        className="absolute top-1/2 left-0 h-[1px] bg-accent-500 -z-10 -translate-y-1/2 transition-all duration-700 ease-out"
        style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
      ></div>

      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-3 h-3 rounded-full mb-3 flex items-center justify-center transition-colors duration-500 ${
                  isCompleted ? 'bg-accent-500 shadow-[0_0_10px_rgba(0,163,255,0.5)]' : 'bg-tertiary border border-base-border/20'
                }`}
              >
                {isCompleted && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
              <span className={`text-[9px] uppercase tracking-widest font-mono ${
                isCurrent ? 'text-accent-500 font-bold' : isCompleted ? 'text-primary-text' : 'text-primary-text/30'
              }`}>
                {stepLabels[step] || step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
