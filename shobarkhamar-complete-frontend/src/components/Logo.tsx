export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background - Rounded Square */}
      <rect x="5" y="5" width="90" height="90" rx="16" fill="#38BDF8" />
      
      {/* Left Curve (Fish) */}
      <path 
        d="M 20 25 Q 15 50 20 75" 
        stroke="#0369A1" 
        strokeWidth="5" 
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Right Curve (Bird) */}
      <path 
        d="M 80 25 Q 85 50 80 75" 
        stroke="#0369A1" 
        strokeWidth="5" 
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Medical Cross - White */}
      <g>
        {/* Vertical bar */}
        <rect x="43" y="30" width="14" height="40" rx="1" fill="white" />
        {/* Horizontal bar */}
        <rect x="30" y="43" width="40" height="14" rx="1" fill="white" />
      </g>
    </svg>
  );
}