"use client";
import styles from './styles.module.css';
import { useState, useEffect } from "react";
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
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null); // Initially set to null

  useEffect(() => {
    if (typeof window !== "undefined") {  // Ensure this code only runs client-side
      const handleResize = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      };

      // Initial check for portrait mode when the component mounts
      handleResize();

      // Add event listener for resize events
      window.addEventListener('resize', handleResize);

      // Clean up the event listener on component unmount
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Optional: Prevent rendering UI until isPortrait is determined
  if (isPortrait === null) {
    return <div>Loading...</div>; // Show loading state while determining the initial layout
  }

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

          <label className="flex items-center justify-center text-white text-[1.4rem] mr-4 cursor-pointer">
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

          <label className="flex items-center justify-center text-white text-[1.4rem] mr-4 cursor-pointer">
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

          <label className="flex items-center justify-center text-white text-[1.4rem] mr-4 cursor-pointer">
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
          <button onClick={() => setPracticeStarted(true)} style={{position:'absolute', top:isPortrait?'78vh': '70vh', left:isPortrait?'32.5vw':'42.5vw',width:isPortrait?'35vw':'15vw', height:isPortrait?'7vh':'9vh'}}>Start</button>
        </div>
      ) : (
        /*Verb drill UI*/
        <div>
            <ProgressBar percentage={progress.percentage}></ProgressBar>
            <p className={styles.pointsText}>{progress.points} points ({progress.correctAnswers}/{progress.questionsAnswered})</p>
            <div className={styles.verbDrillContainer}>
                <div className={styles.verbDrillBackground} style={{width:isPortrait?'90vw':'30vw', height:isPortrait?'30vh':'50vh', left:isPortrait?'5vw': '14vw', top:'25vh'}}>
                    <p>Hello</p>
                </div>

                <p style={{fontSize: '1.8rem'}}>Je</p>
                <input
                    type="text"
                    className={styles.verbDrillInput}
                    style={{position:"absolute", width:isPortrait?"70vw":"25vw", height:"12vh", left:isPortrait?"20vw":"52vw", top:isPortrait?"60vh":"44vh"}}
                />

                <button style={{width:isPortrait?'40vw':'20vw', height:'10vh', position:'absolute', top:isPortrait? '78vh': '75vh', left:isPortrait?'30vw': '54.5vw'}}>Check</button>
                <button style={{width:isPortrait?'20vw':'20vw', height:'10vh', position:'absolute', top:isPortrait? '78vh': '75vh', left:isPortrait?'75vw': '78vw', background:'#B85353'}} className={styles.endButton}>End</button>
            </div>
        </div>
      )}
    </div>
  );
}