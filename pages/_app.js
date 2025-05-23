import '../styles/globals.css';
import '../styles/frosted-glass.css';
import { PlayerProvider } from '../components/context/SimplePlayerContext';
import { LibraryProvider } from '../components/context/LibraryContext';
import { ThemeProvider } from '../components/context/ThemeContext';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LibraryProvider>
        <PlayerProvider>
          <Component {...pageProps} />
        </PlayerProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
}

export default MyApp;
