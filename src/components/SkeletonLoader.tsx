import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-secondary border border-base-border/5 rounded-[2rem] overflow-hidden flex flex-col p-6 h-full relative cursor-wait min-h-[350px]">
    <div className="absolute top-6 left-6 w-24 h-5 bg-primary/5 rounded-full animate-pulse"></div>
    
    <div className="flex-1 flex items-center justify-center my-8">
      <div className="w-40 h-40 bg-primary/5 rounded-full animate-pulse blur-sm"></div>
    </div>
    
    <div className="mt-auto">
      <div className="w-16 h-3 bg-primary/10 rounded mb-2 animate-pulse"></div>
      <div className="w-3/4 h-4 bg-primary/10 rounded animate-pulse"></div>
      <div className="w-1/2 h-4 bg-primary/10 rounded mt-1 animate-pulse"></div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="flex-1 flex flex-col md:flex-row h-full min-h-[600px] bg-primary rounded-[2rem] overflow-hidden border border-base-border/5 relative">
    <div className="w-full md:w-3/5 flex items-center justify-center p-12 lg:p-24 bg-gradient-to-r from-secondary to-transparent">
        <div className="w-full max-w-[400px] aspect-square bg-primary/5 rounded-full animate-pulse blur-xl"></div>
    </div>
    <div className="w-full md:w-2/5 p-10 lg:p-16 flex flex-col justify-center">
      <div className="w-24 h-6 bg-primary/10 rounded-full mb-6 animate-pulse"></div>
      <div className="w-16 h-3 bg-primary/10 rounded mb-2 animate-pulse"></div>
      <div className="w-4/5 h-12 bg-primary/10 rounded mb-4 animate-pulse"></div>
      <div className="w-full h-24 bg-primary/5 rounded mb-10 animate-pulse"></div>
      
      <div className="flex items-end gap-4 mb-12">
        <div className="w-24 h-8 bg-primary/10 rounded animate-pulse"></div>
        <div className="w-16 h-3 bg-primary/5 rounded mb-1 animate-pulse"></div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-14 bg-primary/10 rounded-full animate-pulse"></div>
        <div className="w-14 h-14 bg-primary/10 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);
