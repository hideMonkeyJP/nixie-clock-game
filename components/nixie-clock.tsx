'use client'
import React, { useState, useEffect, useCallback } from 'react'

const GAME_DURATION = 60; // seconds
const INITIAL_DIGITS = 3;
const MAX_DIGITS = 8;
const SCORE_PER_MATCH = 100;

// Props の型定義
interface NixieDigitProps {
  value: string;
  targetValue: string;
  isTarget?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// Game Mode Props の型定義
interface GameModeProps {
  onReturnToClock: () => void;
}

// Shared NixieDigit component
const NixieDigit: React.FC<NixieDigitProps> = ({ 
  value, 
  targetValue, 
  isTarget = false, 
  onClick, 
  disabled = false 
}) => {
  const isMatch = value === targetValue;
  // colorClass の判定を修正
  const colorClass = isTarget ? 'target' : 'normal';  // 'match' の条件を削除
  
  return (
    <div className={`nixie-digit ${disabled ? 'disabled' : ''}`} onClick={!disabled && !isTarget ? onClick : undefined}>
      {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
        <span key={num} className={`digit ${num === value ? 'active' : ''} ${colorClass}`}>
          {num}
        </span>
      ))}
    </div>
  );
};

const GameMode: React.FC<GameModeProps> = ({ onReturnToClock }) => {
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentDigits, setCurrentDigits] = useState(Array(MAX_DIGITS).fill('0'));
  const [targetDigits, setTargetDigits] = useState(Array(MAX_DIGITS).fill('0'));
  const [activeDigits, setActiveDigits] = useState(INITIAL_DIGITS);
  const [combo, setCombo] = useState(0);

  const generateTarget = useCallback(() => {
    return Array(MAX_DIGITS).fill(0).map((_, i) => 
      i < activeDigits ? Math.floor(Math.random() * 10).toString() : '0'
    );
  }, [activeDigits]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentDigits(Array(MAX_DIGITS).fill('0'));
    setActiveDigits(INITIAL_DIGITS);
    setCombo(0);
    setTargetDigits(generateTarget());
  };

  const handleDigitClick = (index: number) => {  // index に型を指定
    if (gameState !== 'playing') return;
    
    const newDigits = [...currentDigits];
    newDigits[index] = ((parseInt(currentDigits[index]) + 1) % 10).toString();
    setCurrentDigits(newDigits);

    const allMatch = targetDigits
      .slice(0, activeDigits)
      .every((digit, i) => digit === newDigits[i]);

    if (allMatch) {
      setScore(prev => {
        const timeBonus = Math.floor(timeLeft / GAME_DURATION * 50);
        const comboBonus = Math.floor(combo * 20);
        const newScore = prev + SCORE_PER_MATCH + timeBonus + comboBonus;
        
        if (newScore > 1000 && activeDigits < MAX_DIGITS) {
          setActiveDigits(prev => Math.min(prev + 1, MAX_DIGITS));
        }
        
        return newScore;
      });
      setCombo(prev => prev + 1);
      setTargetDigits(generateTarget());
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setGameState('ended');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="time-score">
          <div>Time: {timeLeft}s</div>
          <div>Score: {score}</div>
          <div>Combo: {combo}x</div>
        </div>
        {gameState === 'ready' && (
          <button className="start-button" onClick={startGame}>Start Game</button>
        )}
        {gameState === 'ended' && (
          <div className="game-over">
            <div className="final-score">Final Score: {score}</div>
            <button className="start-button" onClick={startGame}>Play Again</button>
            <button className="return-button" onClick={onReturnToClock}>Return to Clock</button>
          </div>
        )}
      </div>
      
      <div className="nixie-displays">
        <div className="nixie-row target-row">
          {targetDigits.map((digit, index) => (
            <NixieDigit 
              key={`target-${index}`}
              value={digit}
              targetValue={digit}
              isTarget={true}
              disabled={true}
            />
          ))}
        </div>
        <div className="nixie-row">
          {currentDigits.map((digit, index) => (
            <NixieDigit
              key={`current-${index}`}
              value={digit}
              targetValue={targetDigits[index]}
              onClick={() => handleDigitClick(index)}
              disabled={index >= activeDigits || gameState !== 'playing'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Component
const NixieClockGame: React.FC = () => {
  const [mode, setMode] = useState<'clock' | 'game'>('clock');
  const [time, setTime] = useState<string>('00000000');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0').slice(0, 2);
      setTime(`${hours}${minutes}${seconds}${milliseconds}`);
    }, 10);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="main-container">
      {mode === 'clock' ? (
        <>
          <div className="nixie-displays">
            <div className="nixie-row">
              {time.split('').map((digit, index) => (
                <NixieDigit 
                  key={index} 
                  value={digit} 
                  targetValue={digit}
                  isTarget={false}
                  disabled={false}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
          <button className="start-button" onClick={() => setMode('game')}>
            Play Nixie Game
          </button>
        </>
      ) : (
        <GameMode onReturnToClock={() => setMode('clock')} />
      )}
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');

        .main-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #000;
          padding: 40px;
          min-height: 100vh;
          color: #ff6400;
        }

        .nixie-displays {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .nixie-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }

        .target-row .nixie-digit {
          transform: scale(0.8);
          opacity: 0.8;
        }

        .nixie-digit {
          width: 60px;
          height: 110px;
          margin: 0 2px;
          position: relative;
          background-color: rgba(0, 0, 0, 0.8);
          border-radius: 3px;
          overflow: hidden;
          cursor: pointer;
        }

        .nixie-digit.disabled {
          cursor: default;
          opacity: 0.5;
        }

        .digit {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Roboto', sans-serif;
          font-size: 90px;
          font-weight: 300;
          color: rgba(255, 100, 0, 0.05);
          transition: all 0.1s ease;
        }

        .digit.active {
          color: #ff6400;
          text-shadow: 0 0 10px rgba(255, 100, 0, 0.8),
                       0 0 20px rgba(255, 100, 0, 0.5),
                       0 0 30px rgba(255, 100, 0, 0.3);
          z-index: 1;
          animation: flicker 0.1s infinite, fluctuate 4s infinite ease-in-out;
        }

        .digit.active.target {
          color: #ff9900;
          text-shadow: 0 0 10px rgba(255, 153, 0, 0.8),
                       0 0 20px rgba(255, 153, 0, 0.5),
                       0 0 30px rgba(255, 153, 0, 0.3);
        }

        .digit.active.match {
          color: #00ff00;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.8),
                       0 0 20px rgba(0, 255, 0, 0.5),
                       0 0 30px rgba(0, 255, 0, 0.3);
        }

        .nixie-digit::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 100, 0, 0.05),
            rgba(255, 100, 0, 0) 10%,
            rgba(255, 100, 0, 0) 90%,
            rgba(255, 100, 0, 0.05)
          );
          pointer-events: none;
          z-index: 2;
        }

        .nixie-digit::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 100, 0, 0.1) 0%,
            rgba(255, 100, 0, 0) 70%
          );
          pointer-events: none;
          z-index: 3;
          animation: glow 2s infinite ease-in-out;
        }

        .start-button, .return-button {
          background: #ff6400;
          color: #000;
          border: none;
          padding: 10px 20px;
          font-size: 20px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 10px;
        }

        .return-button {
          background: #666;
          color: #fff;
        }

        .start-button:hover, .return-button:hover {
          transform: scale(1.05);
        }

        .start-button:hover {
          background: #ff8533;
        }

        .return-button:hover {
          background: #888;
        }

        @keyframes flicker {
          0% { opacity: 1; }
          50% { opacity: 0.98; }
          100% { opacity: 1; }
        }

        @keyframes fluctuate {
          0% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
          25% { transform: translate(-50.1%, -50.1%) scale(1.01); filter: brightness(1.02); }
          50% { transform: translate(-49.9%, -49.9%) scale(0.99); filter: brightness(0.98); }
          75% { transform: translate(-50.2%, -50%) scale(1.02); filter: brightness(1.01); }
          100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
        }

        @keyframes glow {
          0% { opacity: 1; }
          50% { opacity: 0.95; }
          100% { opacity: 1; }
        }

        .game-info {
          margin-bottom: 20px;
          text-align: center;
          font-family: 'Roboto', sans-serif;
        }

        .time-score {
          font-size: 36px;  // 24px から 36px に変更
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;  // 追加：項目間の間隔
        }
      `}</style>
    </div>
  );
};

export default NixieClockGame;
