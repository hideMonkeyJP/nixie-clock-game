'use client'
import React, { useState, useEffect } from 'react'

const NixieDigit = ({ value }: { value: string }) => (
  <div className="nixie-digit">
    {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
      <span key={num} className={`digit ${num === value ? 'active' : ''}`}>
        {num}
      </span>
    ))}
  </div>
)

export default function NixieClock() {
  const [time, setTime] = useState('01450213')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0').slice(0, 2)
      setTime(`${hours}${minutes}${seconds}${milliseconds}`)
    }, 10)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="nixie-clock-container">
      <div className="nixie-clock">
        {time.split('').map((digit, index) => (
          <NixieDigit key={index} value={digit} />
        ))}
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');

        .nixie-clock-container {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #000;
          padding: 40px;
          min-height: 100vh;
        }

        .nixie-clock {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #000;
          padding: 10px;
          border-radius: 5px;
        }

        .nixie-digit {
          width: 60px;
          height: 110px;
          margin: 0 2px;
          position: relative;
          background-color: rgba(0, 0, 0, 0.8);
          border-radius: 3px;
          overflow: hidden;
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
      `}</style>
    </div>
  )
}
