import logo from './assets/logo.png';
import './App.css';
import YoutubePlayer from './components/YoutubePlayer/YoutubePlayer';
import Answers, { type Answer } from './components/Answers/Answers';

function App() {
  const answers: Answer[] = [
    { key: 'Song', value: 'Darude - Sandstorm', show: false },
    { key: 'Artist', value: 'Darude', show: false },
    { key: 'Year', value: '1999', show: true },
  ];

  return (
    <div className="h-screen p-20 flex items-center justify-center">
      <div className="h-full w-full max-w-400 custom-gradient custom-border z-10 flex flex-col">
        <header className="p-4">
          <img src={logo} alt="Logo" className="h-40" />
        </header>
        <main className="flex items-center justify-center m-8 mt-0 grow-1 overflow-hidden">
          <div className="flex items-center justify-center flex-row grow-1 h-full gap-5">
            <div className="h-full max-w-100 min-w-50 grow-1 overflow-hidden">
              <Answers answers={answers} />
            </div>
            <div className="h-full grow-1">
              <YoutubePlayer youtubeId='D0W6ubDI-64' showOverlay={false} overlayText='30' />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
