"use client";
import styles from './styles.module.css';
import { useState } from "react";
import Image from "next/image";
import ProgressBar from "../../components/ProgressBar";

export default function Home() {
  const [selectedNum, setSelectedNum] = useState<number>(10);
  const question_num_choices = [10, 20, 30, 40, 50];
  const [unlimitedPractice, setUnlimitedPractice] = useState<boolean>(false);
  const [strictAccents, setStrictAccents] = useState<boolean>(true);
  const [leaderboardMode, setLeaderboardMode] = useState<boolean>(true);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [progress, setProgress] = useState({
    points: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    percentage: 100
  });

  return (
    <div className={`${styles.container} ${styles.wrapper}`}>
      {/*This always appears*/}
      <div className={styles.topWrapper}>
        <Image 
          src="/images/FranceFlag.jpeg" 
          alt="France Flag" 
          width={60} 
          height={35}
        />
      </div>

      {!practiceStarted ? (
        <div className={styles.background}>
          <p>Verb Conjugation Drill</p>

          <br />

          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-4 w-full text-white text-[1.2rem]">
            <div className="flex justify-center">
              <p>Total Questions</p>
            </div>

            <div className="flex justify-center">
              <select
                className={`${styles.dropdown} ${unlimitedPractice ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={selectedNum}
                onChange={(e) => setSelectedNum(Number(e.target.value))}
                disabled={unlimitedPractice}
              >
                {question_num_choices.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <span>
                {unlimitedPractice
                  ? "Maximum of unlimited points"
                  : `Maximum of ${(selectedNum - 10) * 5 + 100} points`}
              </span>
            </div>
          </div>

          <br />

          <label className="flex items-center justify-center text-white text-[1.4rem] mr-4">
            <input
              type="checkbox"
              checked={unlimitedPractice}
              onChange={(e) => setUnlimitedPractice(e.target.checked)}
              className="peer hidden"
            />
            <span className="w-5 h-5 mr-2 border-2 border-white rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></span>
            Unlimited Practice
          </label>

          <br />

          <label className="flex items-center justify-center text-white text-[1.4rem] mr-4">
            <input
              type="checkbox"
              checked={strictAccents}
              onChange={(e) => setStrictAccents(e.target.checked)}
              className="peer hidden"
            />
            <span className="w-5 h-5 mr-2 border-2 border-white rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></span>
            Strict Accents
          </label>

          <br />

          <label className="flex items-center justify-center text-white text-[1.4rem] mr-4">
            <input
              type="checkbox"
              checked={leaderboardMode}
              onChange={(e) => setLeaderboardMode(e.target.checked)}
              className="peer hidden"
            />
            <span className="w-5 h-5 mr-2 border-2 border-white rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></span>
            Leaderboard Mode
          </label>

          <br />
          <button onClick={() => setPracticeStarted(true)}>Start</button>
        </div>
      ) : (
        /*Verb drill UI*/
        <div>
        <ProgressBar percentage={progress.percentage}></ProgressBar>
        <p className={styles.pointsText}>{progress.points} points ({progress.correctAnswers}/{progress.questionsAnswered})</p>

        <input
  type="range"
  min="0"
  max="100"
  value={progress.percentage}
  onChange={(e) => setProgress((prevProgress) => ({
    ...prevProgress,
    percentage: Number(e.target.value) // Use the slider's value
  }))}
  style={{ width: '100%', marginTop: '20px' }}
/>
        </div>
      )}
    </div>
  );
}