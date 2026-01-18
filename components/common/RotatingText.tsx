"use client";

import { useState, useEffect, useRef } from "react";

interface RotatingTextProps {
  words: string[];
  className?: string;
  duration?: number;
}

/**
 * Rotating text animation component
 * Cycles through words with letter-by-letter spinning animation
 */
export function RotatingText({
  words,
  className = "",
  duration = 4000,
}: RotatingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const wordsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Split each word into letter spans
    wordsRef.current.forEach((wordEl, wordIndex) => {
      if (!wordEl) return;
      
      const text = words[wordIndex];
      const letters = text.split("");
      wordEl.textContent = "";
      
      letters.forEach((letter) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.className = "letter";
        wordEl.appendChild(span);
      });
    });

    // Set first word to visible
    if (wordsRef.current[0]) {
      (wordsRef.current[0] as HTMLElement).style.opacity = "1";
    }
  }, [words]);

  useEffect(() => {
    const rotateText = () => {
      const currentWord = wordsRef.current[currentWordIndex];
      if (!currentWord) return;

      const nextWordIndex = currentWordIndex === words.length - 1 ? 0 : currentWordIndex + 1;
      const nextWord = wordsRef.current[nextWordIndex];
      if (!nextWord) return;

      // Rotate out letters of current word
      Array.from(currentWord.children).forEach((letter, i) => {
        setTimeout(() => {
          (letter as HTMLElement).className = "letter out";
        }, i * 80);
      });

      // Reveal and rotate in letters of next word
      (nextWord as HTMLElement).style.opacity = "1";
      Array.from(nextWord.children).forEach((letter, i) => {
        (letter as HTMLElement).className = "letter behind";
        setTimeout(() => {
          (letter as HTMLElement).className = "letter in";
        }, 340 + i * 80);
      });

      // Hide current word after animation
      setTimeout(() => {
        (currentWord as HTMLElement).style.opacity = "0";
      }, words[currentWordIndex].length * 80 + 340);

      setCurrentWordIndex(nextWordIndex);
    };

    const interval = setInterval(rotateText, duration);

    return () => clearInterval(interval);
  }, [currentWordIndex, words, duration]);

  return (
    <div className={`rotating-text ${className}`}>
      {words.map((word, index) => (
        <div
          key={`${word}-${index}`}
          ref={(el) => {
            wordsRef.current[index] = el;
          }}
          className="word"
          style={{ opacity: 0 }}
        >
          {word}
        </div>
      ))}
    </div>
  );
}
