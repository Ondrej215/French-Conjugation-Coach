"use client";
import styles from './styles.module.css';
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [selectedNum, setSelectedNum] = useState<number>(10);
  const question_num_choices = [10, 20, 30, 40, 50];
  const [unlimitedPractice, setUnlimitedPractice] = useState<boolean>(false);
  const [strictAccents, setStrictAccents] = useState<boolean>(true);
  const [leaderboardMode, setLeaderboardMode] = useState<boolean>(true);

  return (
    <div className={`${styles.container} ${styles.wrapper}`}>
      <Image src="/images/FranceFlag.jpeg" alt="France Flag" width={60} height={35}></Image>

      <br></br>
      
      <div className={styles.background}>
        <p>Verb Conjugation Drill</p>

        <br></br>

        <div className="flex justify-center items-center">
          <p style={{ fontSize: "1.2rem" }} className="mr-4">Num Questions</p>

          <select
            className={styles.dropdown}
            value={selectedNum}
            onChange={(e) => setSelectedNum(Number(e.target.value))}
          >
            {question_num_choices.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <span style={{ fontSize: "1.2rem" }} className="ml-4 text-white">
            Max Points: {(selectedNum-10)*5 + 100}
          </span>
        </div>
        <br></br>

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

        <br></br>

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

        <br></br>

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

        <br></br>
        <button>Start</button>

      </div>
    </div>
  );
}