import { useEffect, useState } from 'react';
import { usePlayer } from '../context/SimplePlayerContext';
import DJPurple from './DJPurple';

// Component that automatically activates the DJ when the page loads
export default function AutoDJ() {
  const [autoStarted, setAutoStarted] = useState(false);
  const { userHasInteracted } = usePlayer();
  
  // Auto-start DJ based on environment variable and user interaction
  useEffect(() => {
    // Only run once
    if (autoStarted) return;
    
    // Check if auto DJ is enabled
    const autoDJEnabled = process.env.NEXT_PUBLIC_AUTO_DJ === 'true';
    
    if (autoDJEnabled && userHasInteracted) {
      console.log('Auto DJ enabled and user has interacted, starting DJ automatically');
      
      // Find the DJ start button and click it
      setTimeout(() => {
        const djButton = document.querySelector('.dj-purple button');
        if (djButton) {
          console.log('Auto-starting DJ');
          djButton.click();
          setAutoStarted(true);
        }
      }, 1000); // Wait for component to be fully rendered
    }
  }, [autoStarted, userHasInteracted]);
  
  return <DJPurple />;
}