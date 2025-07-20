import { useEffect, useState } from 'react';

// Component that automatically starts the DJ when the page loads
export default function AutoStartDJ() {
  const [attempted, setAttempted] = useState(false);
  
  useEffect(() => {
    // Only run once
    if (attempted) return;
    
    // Check if auto DJ is enabled via environment variable
    const autoDJEnabled = process.env.NEXT_PUBLIC_AUTO_DJ === 'true';
    
    if (autoDJEnabled) {
      console.log('Auto DJ enabled, will start DJ automatically');
      
      // Find the DJ start button and click it after a delay
      const startDJ = () => {
        const djButton = document.querySelector('.dj-purple button');
        if (djButton && !djButton.textContent.includes('Stop DJ')) {
          console.log('Auto-starting DJ');
          djButton.click();
          setAttempted(true);
        } else {
          console.log('DJ button not found or already active, will retry');
          // Retry after a short delay
          setTimeout(startDJ, 1000);
        }
      };
      
      // Wait for component to be fully rendered
      setTimeout(startDJ, 2000);
    }
  }, [attempted]);
  
  // This component doesn't render anything
  return null;
}