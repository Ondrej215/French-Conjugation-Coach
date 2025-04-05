"use client";
import styles from './styles.module.css';
import { useState, useEffect , useRef} from "react";
import Image from "next/image";
import ProgressBar from "../../components/ProgressBar";
import { supabase } from "../../lib/supabaseClient";

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

  const [verbInfo, setVerbInfo] = useState({
    infinitive:'manger',
    translation:'To eat',
    pronoun:'Je',
    tense:'Present',
    answer:''
  })

  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [allData, setAllData] = useState<any[]>([]); // Stores everything from the infinitive table
  const [allConjugations, setAllConjugations] = useState<any[]>([]); // Stores everything from the conjugations table
  const [allStems, setAllStems] = useState<any[]>([]); // Stores everything from the stems table
  const [infinitives, setInfinitives] = useState<string[]>([]); // Stores just the "infinitive" column
  const pronouns = ["Je", "Tu", "Il", "Nous", "Vous", "Ils"];
  const tenses = ["Present", "Past Participle", "Imperfect", "Future Simple", "Conditional", "Subjunctive", "Present Participle", "Imperative"];
  const [shuffledInfinitives, setShuffledInfinitives] = useState<any[]>([]);
  const [checkButton, setCheckButton] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function capitalise(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function normaliseInput(input: string): string {
    return input.trim().toLowerCase();
  }

  function getRandomElement<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }

  useEffect(() => {
    const handleResize = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      };
    
      if (typeof window !== "undefined") {
        handleResize();
        window.addEventListener('resize', handleResize);
      }

    async function fetchData() {
          // Fetch infinitives
          const { data: infinitiveData, error: infinitiveError } = await supabase.from("TBLinfinitive").select("*");
      
          if (infinitiveError) {
            console.error("Error fetching infinitives:", infinitiveError);
          } else if (infinitiveData) {
            setAllData(infinitiveData);
            const infinitiveList = infinitiveData.map((row) => row.infinitive);
            setInfinitives(infinitiveList);
          }

      
          // Fetch conjugations
          const { data: conjugationData, error: conjugationError } = await supabase.from("TBLconjugation").select("*");
      
          if (conjugationError) {
            console.error("Error fetching conjugations:", conjugationError);
          } else if (conjugationData) {
            setAllConjugations(conjugationData);
          }
      
          // Fetch stems
          const { data: stemData, error: stemError } = await supabase.from("TBLstem").select("*");
      
          if (stemError) {
            console.error("Error fetching stems:", stemError);
          } else if (stemData) {
            setAllStems(stemData);
          }
        }
      
        fetchData();

        return () => {
            if (typeof window !== "undefined") {
              window.removeEventListener('resize', handleResize);
            }
          };
  }, []);

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      nextQuestion();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [nextQuestion]);

useEffect(() => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputDisabled]);

  if (isPortrait === null) {
    return <div>Loading...</div>; // Show loading state while determining the initial layout
  }

  const getConjugation = (pronounConjugation: string, tenseID: number, infinitiveID: number) => {

    let pronounID;
        switch (pronounConjugation){
          case "Je":
            pronounID = 1;
            break;
          case "Tu":
            pronounID = 2;
            break;
          case "Il":
            pronounID = 3;
            break;
          case "Nous":
            pronounID = 4;
            break;
          case "Vous":
            pronounID = 5;
            break;
          case "Ils":
            pronounID = 6;
            break;
          default:
            pronounID = 1;
            break;
        }

    const conjugationEntry = allConjugations.find(
      (entry) =>
        entry.infinitive_id === infinitiveID &&
        entry.tense_id === tenseID &&
        entry.pronoun_id === pronounID
    );
  
    return conjugationEntry ? conjugationEntry.conjugation : "Not found";
  }

  const getStem = (tenseID: number, infinitiveID: number) => {
    const stemEntry = allStems.find(
      (entry) =>
        entry.infinitive_id === infinitiveID &&
        entry.tense_id === tenseID
    );

    return stemEntry ? stemEntry.stem : "Not found";
  }

  // Conjugates selected options
  const conjugateOptions = (selectedInfinitive:string, selectedPronoun:string, selectedTense:string) => {
    const infinitiveData = allData.find((row) => row.infinitive === selectedInfinitive);

    let conjugation = selectedInfinitive;
    let conjugationTense = selectedTense
    // use of each group and ending type is documented
    if (conjugationTense == "Imperative"){
        if (["Tu", "Nous", "Vous"].includes(selectedPronoun)){
          // regular imperative is just the relevant present conjugation, but only exists for tu, nous, vous
          if (infinitiveData.type < 12){
            conjugationTense = "Present"
          }else{
            conjugation = getConjugation(selectedPronoun, 8, infinitiveData.infinitive_id)
          }
  
        }else{
          conjugation = "None"
        }
      }

      if (conjugationTense == "Present"){

        if (infinitiveData.type == "1" || infinitiveData.type == "2"){
  
          if (infinitiveData.ending_type == "er"){
            // removes infinitive ending
            conjugation = conjugation.slice(0, -2);
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "e";
            }else if (selectedPronoun == "Tu"){
              if (selectedTense == "Present"){
                conjugation = conjugation + "es";
              }else{
                conjugation = conjugation + "e";
              }
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ons";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "ez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ent";
            }
  
          }else if (infinitiveData.ending_type == "ir"){
            // removes infinitive ending
            conjugation = conjugation.slice(0, -1);
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "s";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "t";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ssons";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "ssez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ssent";
            }
  
          }else if (infinitiveData.ending_type == "re"){
            // removes infinitive ending
            conjugation = conjugation.slice(0, -2);
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "s";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ons";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "ez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ent";
            }
  
          }else if (infinitiveData.ending_type == "ger"){
            // removes infinitive ending
            conjugation = conjugation.slice(0, -1);
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "";
            }else if (selectedPronoun == "Tu"){
              if (selectedTense == "Present"){
                conjugation = conjugation + "s";
              }
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ons";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "z";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "nt";
            }
  
          }else if (infinitiveData.ending_type == "cer"){
            // removes infinitive ending
            conjugation = conjugation.slice(0, -3);
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "ce";
            }else if (selectedPronoun == "Tu"){
              if (selectedTense == "Present"){
                conjugation = conjugation + "ces";
              }else{
                conjugation = conjugation + "ce";
              }
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "çons";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "cez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "cent";
            }
  
          }else if (infinitiveData.ending_type == "yer"){
            // removes infinitive ending
            conjugation = conjugation.slice(0, -3);
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "ie";
            }else if (selectedPronoun == "Tu"){
              if (selectedTense == "Present"){
                conjugation = conjugation + "ies";
              }else{
                conjugation = conjugation + "ie";
              }
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "yons";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "yez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ient";
            }
  
          }
        }
        else{
          conjugation = getConjugation(selectedPronoun, 1, infinitiveData.infinitive_id);
          if (selectedTense == "Imperative" && selectedPronoun == "Tu"){
            conjugation = conjugation.slice(0, -1)
          }
        }
      }else if (conjugationTense == "Imperfect"){
        // regular groups in imperfect
        if ([1, 2, 3, 4, 5, 10, 11, 13, 14, 15, 16].includes(infinitiveData.type)){
  
          if (["er", "re", "yer"].includes(infinitiveData.ending_type)){
            conjugation = conjugation.slice(0, -2);
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "ais";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "ait";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "iez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "aient";
            }
  
          }else if (infinitiveData.ending_type == "ir"){
            conjugation = conjugation.slice(0, -1);
            conjugation = conjugation + "ss";
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "ais";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "ait";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "iez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "aient";
            }
  
          }else if (infinitiveData.ending_type == "ger"){
            conjugation = conjugation.slice(0, -2);
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "eais";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "eait";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "iez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "eaient";
            }
  
          }else if (infinitiveData.ending_type == "cer"){
            conjugation = conjugation.slice(0, -3);
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "çais";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "çait";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "cions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "ciez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "çaient";
            }
  
          }else {
            conjugation = conjugation.slice(0, -2);
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
              conjugation = conjugation + "ais";
            }else if (selectedPronoun == "Il"){
              conjugation = conjugation + "ait";
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "iez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "aient";
            }
          }
  
        }else{
          conjugation = getStem(2, infinitiveData.infinitive_id);
          // add endings
          if (selectedPronoun == "Je" || selectedPronoun == "Tu"){
            conjugation = conjugation + "ais";
          }else if (selectedPronoun == "Il"){
            conjugation = conjugation + "ait";
          }else if (selectedPronoun == "Nous"){
            conjugation = conjugation + "ions";
          }else if (selectedPronoun == "Vous"){
            conjugation = conjugation + "iez";
          }else if (selectedPronoun == "Ils"){
            conjugation = conjugation + "aient";
          }
        }
  
      }else if (conjugationTense == "Conditional"){
        if ([1, 3, 4, 6, 7, 10, 13, 14, 17, 18].includes(infinitiveData.type)){
          // change stem based on rules
          if (infinitiveData.ending_type == "re"){
            conjugation = conjugation.slice(0, -1);
  
          }else if(infinitiveData.ending_type == "yer") {
            conjugation = conjugation.slice(0, -3)
            conjugation = conjugation +"ier"
          }
  
        }else{
          conjugation = getStem(6, infinitiveData.infinitive_id);
        }
  
        // add endings
        if (selectedPronoun == "Je"){
          conjugation = conjugation + "ais";
        }else if (selectedPronoun == "Tu"){
          conjugation = conjugation + "ais"
        }else if (selectedPronoun == "Il"){
          conjugation = conjugation + "ait";
        }else if (selectedPronoun == "Nous"){
          conjugation = conjugation + "ions";
        }else if (selectedPronoun == "Vous"){
          conjugation = conjugation + "iez";
        }else if (selectedPronoun == "Ils"){
          conjugation = conjugation + "aient";
        }
      }else if (conjugationTense == "Past Participle"){
        conjugation = infinitiveData.past_participle;
  
      }else if (conjugationTense == "Present Participle"){
        conjugation = infinitiveData.present_participle;
  
      }else if (conjugationTense == "Future Simple"){
        if ([1, 3, 4, 6, 7, 10, 13, 14, 17, 18].includes(infinitiveData.type)){
          // change stem based on rules
          if (infinitiveData.ending_type == "re"){
            conjugation = conjugation.slice(0, -1);
  
          }else if(infinitiveData.ending_type == "yer") {
            conjugation = conjugation.slice(0, -3)
            conjugation = conjugation +"ier"
          }
  
        }else{
          conjugation = getStem(6, infinitiveData.infinitive_id);
        }
  
        // add endings
        if (selectedPronoun == "Je"){
          conjugation = conjugation + "ai";
        }else if (selectedPronoun == "Tu"){
          conjugation = conjugation + "as"
        }else if (selectedPronoun == "Il"){
          conjugation = conjugation + "a";
        }else if (selectedPronoun == "Nous"){
          conjugation = conjugation + "ons";
        }else if (selectedPronoun == "Vous"){
          conjugation = conjugation + "ez";
        }else if (selectedPronoun == "Ils"){
          conjugation = conjugation + "ont";
        }
  
      }else if (conjugationTense == "Subjunctive"){
        // update yer endings, add rules for none ending types
        if ([1, 2, 3].includes(infinitiveData.type)){
          if (infinitiveData.ending_type == "ir"){
            conjugation = conjugation.slice(0, -1);
            conjugation = conjugation + "ss";
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "e";
            }else if (selectedPronoun == "Tu"){
              conjugation = conjugation + "es"
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "iez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ent";
            }
  
          }else if(infinitiveData.ending_type == "yer"){
            conjugation = conjugation.slice(0, -3);
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "ie";
            }else if (selectedPronoun == "Tu"){
              conjugation = conjugation + "ies"
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "yions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "yiez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ient";
            }
  
          }else{
            conjugation = conjugation.slice(0, -2);
  
            // add endings
            if (selectedPronoun == "Je" || selectedPronoun == "Il"){
              conjugation = conjugation + "e";
            }else if (selectedPronoun == "Tu"){
              conjugation = conjugation + "es"
            }else if (selectedPronoun == "Nous"){
              conjugation = conjugation + "ions";
            }else if (selectedPronoun == "Vous"){
              conjugation = conjugation + "iez";
            }else if (selectedPronoun == "Ils"){
              conjugation = conjugation + "ent";
            }
  
          }
        }else if([4, 6, 8, 11, 13, 15, 17, 19].includes(infinitiveData.type)){
          conjugation = getStem(7, infinitiveData.infinitive_id);
  
          // add endings
          if (selectedPronoun == "Je" || selectedPronoun == "Il"){
            conjugation = conjugation + "e";
          }else if (selectedPronoun == "Tu"){
            conjugation = conjugation + "es"
          }else if (selectedPronoun == "Nous"){
            conjugation = conjugation + "ions";
          }else if (selectedPronoun == "Vous"){
            conjugation = conjugation + "iez";
          }else if (selectedPronoun == "Ils"){
            conjugation = conjugation + "ent";
          }
  
        }else if([5, 7, 9, 10, 12, 14, 16, 18].includes(infinitiveData.type)){
          conjugation = getConjugation(selectedPronoun, 7, infinitiveData.infinitive_id);
        }
      }
  
      return conjugation;
  
  };

  function nextQuestion() {

    console.log(shuffledInfinitives);
    setCheckButton(!checkButton);
    if (!checkButton){

        // clear verb input
        setInputValue("");
        setInputDisabled(false)

        if (inputRef.current) {
            inputRef.current.focus();
        }

        const numVerbs = allData.length;

        // decides which verb to use from shuffledInfinitives, goes through the list then repeats
        // if repeating list then it is reshuffled
        const index = progress.questionsAnswered % numVerbs;

        const randomTense = getRandomElement(tenses);
        let randomPronoun: string;

        if (index === 0){
            const shuffled = [...allData].sort(() => Math.random() - 0.5);

            setShuffledInfinitives(shuffled);

            if (randomTense == "Present Participle"){
                randomPronoun = "En";
            }else if (randomTense == "Past Participle"){
                randomPronoun = capitalise(shuffled[0].auxilary);
            }else if (randomTense == "Imperative"){
                randomPronoun = getRandomElement(['Tu', 'Nous', 'Vous']);
            }else {
                randomPronoun = getRandomElement(pronouns);
            }

            setVerbInfo((prev) => ({
                ...prev,
                infinitive: shuffled[0].infinitive,
                translation: shuffled[0].translation,
                tense: randomTense,
                pronoun: randomPronoun,
                answer: conjugateOptions(shuffled[0].infinitive, randomPronoun, randomTense)
            }));

        }else{

            if (randomTense == "Present Participle"){
                randomPronoun = "En";
            }else if (randomTense == "Past Participle"){
                randomPronoun = capitalise(shuffledInfinitives[index].auxilary);
            }else if (randomTense == "Imperative"){
                randomPronoun = getRandomElement(['Tu', 'Nous', 'Vous']);
            }else {
                randomPronoun = getRandomElement(pronouns);
            }

            setVerbInfo((prev) => ({
                ...prev,
                infinitive: shuffledInfinitives[index].infinitive,
                translation: shuffledInfinitives[index].translation,
                tense: randomTense,
                pronoun: randomPronoun,
                answer: conjugateOptions(shuffledInfinitives[index].infinitive, randomPronoun, randomTense)
            }));
        }   

        }else {
            setInputDisabled(true);

            const answer = normaliseInput(inputValue);

            if (answer === verbInfo.answer){
                setProgress(prevProgress => ({
                    ...prevProgress,
                    correctAnswers: prevProgress.correctAnswers + 1,
                    questionsAnswered: prevProgress.questionsAnswered + 1,
                    percentage: Math.round((prevProgress.correctAnswers + 1) / (prevProgress.questionsAnswered + 1) * 100)
                }))
            }else {
                setProgress(prevProgress => ({
                    ...prevProgress,
                    questionsAnswered: prevProgress.questionsAnswered + 1,
                    percentage: Math.round((prevProgress.correctAnswers) / (prevProgress.questionsAnswered + 1) * 100)
                }))
            }
        }
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === "Enter") {
          nextQuestion();
        }
      }

      const handleMouseEnter = (event: React.MouseEvent) => {
        const input = event.target as HTMLInputElement;
        input.focus(); // Focus the input when hovered
      };

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
          <button onClick={() => {setPracticeStarted(true); nextQuestion();}} style={{position:'absolute', top:isPortrait?'78vh': '75vh', left:isPortrait?'32.5vw':'42.5vw',width:isPortrait?'35vw':'15vw', height:isPortrait?'7vh':'9vh'}}>Start</button>
        </div>
      ) : (
        /*Verb drill UI*/
        <div>
            <ProgressBar percentage={progress.percentage}></ProgressBar>
            <p className={styles.pointsText}>{progress.points} points ({progress.correctAnswers}/{progress.questionsAnswered})</p>
            <div className={styles.verbDrillContainer}>
                <div className={styles.verbDrillBackground} style={{width:isPortrait?'84vw':'30vw', height:isPortrait?'30vh':'50vh', left:isPortrait?'8vw': '14vw', top:'25vh'}}>
                    {!isPortrait && <div style={{ height: "5vh" }} />}
                    <p style={{fontSize:isPortrait?'1.8rem':'2.4rem', fontWeight:'500'}}>{capitalise(verbInfo.infinitive)}</p>
                    <p style={{fontSize:'1.2rem', fontWeight:'50'}}>{verbInfo.translation}</p>
                    <br></br>
                    <p style={{fontSize:isPortrait?'1.4rem':'1.9rem', backgroundColor:'#191A27', borderRadius:'15px'}}>{verbInfo.tense}</p>
                </div>

                <p style={{fontSize: '1.9rem', position:'absolute', left:isPortrait?'2vw':'46vw', top:isPortrait?'61vh':'47vh'}}>{verbInfo.pronoun}</p>
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.verbDrillInput}
                    style={{position:"absolute", width:isPortrait?"65vw":"25vw", height:isPortrait?'8vh':"12vh", left:isPortrait?"20vw":"52vw", top:isPortrait?"60vh":"44vh"}}
                    value={inputValue} // Controlled input
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={inputDisabled}
                    onMouseEnter={handleMouseEnter}/>

                <button onClick={() => {nextQuestion();}} onKeyDown={handleKeyDown} style={{width:isPortrait?'40vw':'20vw', height:isPortrait?'8vh':'10vh', position:'absolute', top:'76vh', left:isPortrait?'30vw': '54.5vw'}}>{checkButton?'Check':'Next'}</button>
                <button onClick={() => {console.log(verbInfo.answer)}} style={{width:isPortrait?'20vw':'20vw', height:isPortrait?'8vh':'10vh', position:'absolute', top:'76vh', left:isPortrait?'75vw': '78vw', background:'#B85353'}} className={styles.endButton}>End</button>
            </div>
        </div>
      )}
    </div>
  );
}