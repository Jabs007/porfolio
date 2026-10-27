import { useState } from 'react';
import useLenis from './hooks/useLenis';
import useScrollReveals from './hooks/useScrollReveals';
import useCinematicScroll from './hooks/useCinematicScroll';
import usePageTitle from './hooks/usePageTitle';
import { ThemeProvider } from './context/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import MainContainer from './components/MainContainer';
import Marquee from './components/Marquee';

import About from './components/About';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Experience from './components/Experience';

import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  useLenis();
  useScrollReveals(isLoadingComplete);
  useCinematicScroll(isLoadingComplete);
  usePageTitle(isLoadingComplete);

  return (
    <ThemeProvider>
      <CustomCursor />
      {!isLoadingComplete && (
        <LoadingScreen onLoadingComplete={() => setIsLoadingComplete(true)} />
      )}
      {isLoadingComplete && (
        <>
          <div className="site-shell">
            <Navbar />
            <main>
              <MainContainer />
              <Marquee />
              <About />
              <Projects />
              <TechStack />
              <Experience />
              <Marquee reverse />
              <Contact />
              <Footer />
            </main>
            <ScrollToTop />
          </div>
        </>
      )}
    </ThemeProvider>
  );
}

export default App;