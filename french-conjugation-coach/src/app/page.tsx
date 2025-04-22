"use client";
import styles from './styles.module.css';
import { useState, useEffect , useRef} from "react";
import Image from "next/image";
import ProgressBar from "../../components/ProgressBar";
import { supabase } from "../../lib/supabaseClient";
import { useSession } from '../../hooks/useSession';

export default function Home() {
  const [selectedNum, setSelectedNum] = useState<number>(10);
  const question_num_choices = [10, 20, 30, 40, 50];
  const [unlimitedPractice, setUnlimitedPractice] = useState<boolean>(false);
  const [strictAccents, setStrictAccents] = useState<boolean>(true);
  const [leaderboardMode, setLeaderboardMode] = useState<boolean>(true);
  const [menu, setMenu] = useState<string>('home');

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
  const [correctHeight, setCorrectHeight] = useState<number>(1);
  const [incorrectHeight, setIncorrectHeight] = useState<number>(1);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const [endWarning, setEndWarning] = useState<boolean>(false);
  const { session, loading, role, accountInfo } = useSession();

  const [mostQuestions, setMostQuestions] = useState({ name: '', value: 0 });
const [mostAccurate, setMostAccurate] = useState({ name: '', value: 0 });
const [leastAccurate, setLeastAccurate] = useState({ name: '', value: 0 });
const [answerMessage, setAnswerMessage] = useState<string>('');

const presentCorrectMessages = ["You've mastered the present tense, here's your present: points!", "Living in the moment!", "You really are thriving in the present!", "You're so in the now, it's incroyable!", "You're so in the now, it's incroyable!", "You've mastered the present tense, here's your present: points!"];
const presentIncorrectMessages = ["Present tense? No presents here, not for that answer.", "Don't expect presents from the present tense.", "Looks like that one présented a bit of a problem.", "Looks like that one présented a bit of a problem.", "Present tense? No presents here, not for that answer."];
const imperfectCorrectMessages = ["It's called imperfect, but your answer is totally perfect!", "Back in time, and you still nailed it!", "Back in time, and you still nailed it!", "It's called imperfect, but your answer is totally perfect!", "It's called imperfect, but your answer is totally perfect!"];
const imperfectIncorrectMessages = ["Yeah... that was imperfect alright, just in the wrong way.", "That was imperfect in every way, let's try again!", "Yeah... that was imperfect alright, just in the wrong way.", "Yeah... that was imperfect alright, just in the wrong way.", "That was imperfect in every way, let's try again!"];
const pastCorrectMessages = ['You have got that correct!', "Great job! Now let's leave the past behind.", "Great job! Now let's leave the past behind.", 'You have got that correct!'];
const pastIncorrectMessages = ["Rough past? Good thing the future's bright!", "That answer is history... and not in a good way.", "That answer is history... and not in a good way.", "Rough past? Good thing the future's bright!"];
const participleCorrectMessages = ["You're do-ing great, just like the verb form!", "That participle was particu-larly awesome!", "You're participating perfectly in this drill!", "You're do-ing great, just like the verb form!", "That participle was particu-larly awesome!"];
const participleIncorrectMessages = ["Not quite do-ing it right. Onto the next!", "Not quite do-ing it right. Onto the next!"];
const futureCorrectMessages = ["Proof that your future in French is bright.", "You will be racking up points at this rate!", "Proof that your future in French is bright.", "Proof that your future in French is bright.", "You will be racking up points at this rate!"];
const futureIncorrectMessages = ["At least you'll now get it right in the future.", "At least you'll now get it right in the future.", "At least you'll now get it right in the future."];
const subjunctiveCorrectMessages = ["May your next answer be this correct!", "Que tu sois brilliant!", "Even if it were hard, you made it look easy.", "Even if it were hard, you made it look easy.", "May your next answer be this correct!"];
const subjunctiveIncorrectMessages = ['I wish that answer had been right.', "So many hopes in the subjunctive, yet so far from correct!", "So many hopes in the subjunctive, yet so far from correct!", 'I wish that answer had been right.'];
const conditionalCorrectMessages = ["These points you earned were conditional on you getting the answer.", "If you always answered like that, you would be perfect!", "That was unconditionally awesome!", "These points you earned were conditional on you getting the answer.", "That was unconditionally awesome!", "If you always answered like that, you would be perfect!", "If you always answered like that, you would be perfect!"];
const conditionalIncorrectMessages = ["Would've, could've, should've... didn't.", "You would've scored points, if that was right.", "Under no condition was that answer correct.", "Would've, could've, should've... didn't.", "You would've scored points, if that was right."]
const imperativeCorrectMessages = ["It was imperative you got that correct to earn these points!", "You followed the command, and correct you were!", "Imperative? I'm starting to think you're the boss of it!", "It was imperative you got that correct to earn these points!", "Imperative? I'm starting to think you're the boss of it!"]
const imperativeIncorrectMessages = ["Not quite what the imperative demanded...", " The imperative demanded better!", "Not quite what the imperative demanded...", " The imperative demanded better!"]

const generalCorrectMessages = ["That was parfait! Good travail.", "That was textbook, or should I say cahier?", "Correct! L'Académie Française applaud you.", "Incroyable! That was parfait.", "I tip my chapeau to you!", "Très bien!", "You: 1, French verbs: 0. Next round!"]
const generalIncorrectMessages = ["That was close. Onto the next one!", "French verbs: 1, You: 0. Next round!", "That answer had a certain... je ne sais quoi... of incorrectness.",  "That answer leaves something to be désiré."]

  // track user stats for each tense
  const [present, setPresent] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [imperfect, setImperfect] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [past, setPast] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [future, setFuture] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [conditional, setConditional] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [imperative, setImperative] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [participle, setParticiple] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const [subjunctive, setSubjunctive] = useState({
    numQuestions: 0,
    numCorrect: 0
  })

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

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
      if (e.key === "Enter" && menu === "drill" && (progress.questionsAnswered < selectedNum || unlimitedPractice)) {
        nextQuestion();
      }
      if (e.getModifierState("CapsLock")) {
        setCapsLockOn(true);
      }
    };
  
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.getModifierState("CapsLock")) {
        setCapsLockOn(false);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [nextQuestion]);

  const focusInput = () => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

useEffect(() => {
    focusInput();
  }, [inputDisabled]);

  if (isPortrait === null || loading) {
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
          if (selectedTense == "Imperative" && selectedPronoun == "Tu" && ['er', 'ger', 'cer', 'yer'].includes(infinitiveData.ending_type)){
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

    setCheckButton(!checkButton);
    if (!checkButton){

        // clear verb input
        setInputValue("");
        setInputDisabled(false);
        setAnswerMessage('');

        if (inputRef.current) {
            inputRef.current.focus();
        }

        setCorrectHeight(1);
        setIncorrectHeight(1);

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

            let answerMessages;

            if (verbInfo.tense === "Present"){
                setPresent(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  // assigns incorrect before being overwritten with correct if answer is correct
                  answerMessages = [...generalIncorrectMessages, ...presentIncorrectMessages];
            }else if (verbInfo.tense === "Imperfect"){
                setImperfect(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...imperfectIncorrectMessages];
            }else if (verbInfo.tense === "Past Participle"){
                setPast(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...pastIncorrectMessages];
            }else if (verbInfo.tense === "Future Simple"){
                setFuture(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...futureIncorrectMessages];
            }else if (verbInfo.tense === "Conditional"){
                setConditional(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...conditionalIncorrectMessages];
            }else if (verbInfo.tense === "Subjunctive"){
                setSubjunctive(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...subjunctiveIncorrectMessages];
            }else if (verbInfo.tense === "Present Participle"){
                setParticiple(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...participleIncorrectMessages];
            }else  if (verbInfo.tense === "Imperative"){
                setImperative(prev => ({
                    ...prev,
                    numQuestions: prev.numQuestions + 1
                  }));
                  answerMessages = [...generalIncorrectMessages, ...imperativeIncorrectMessages];
            }

            let answer:string = normaliseInput(inputValue)

            if (!strictAccents){
                answer = removeAccents(normaliseInput(inputValue))
            }

            if (answer === (strictAccents?verbInfo.answer:removeAccents(verbInfo.answer))){

                setCorrectHeight(isPortrait?3:2);

                setProgress(prevProgress => ({
                    ...prevProgress,
                    correctAnswers: prevProgress.correctAnswers + 1,
                    questionsAnswered: prevProgress.questionsAnswered + 1,
                    percentage: Math.round((prevProgress.correctAnswers + 1) / (prevProgress.questionsAnswered + 1) * 100),
                    points: prevProgress.points + ((prevProgress.questionsAnswered < 10)?10:5)
                }))

                if (verbInfo.tense === "Present"){
                    setPresent(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1,
                      }));
                    answerMessages = [...generalCorrectMessages, ...presentCorrectMessages];
                }else if (verbInfo.tense === "Imperfect"){
                    setImperfect(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...imperfectCorrectMessages];
                }else if (verbInfo.tense === "Past Participle"){
                    setPast(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...pastCorrectMessages];
                }else if (verbInfo.tense === "Future Simple"){
                    setFuture(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...futureCorrectMessages];
                }else if (verbInfo.tense === "Conditional"){
                    setConditional(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...conditionalCorrectMessages];
                }else if (verbInfo.tense === "Subjunctive"){
                    setSubjunctive(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...subjunctiveCorrectMessages];
                }else if (verbInfo.tense === "Present Participle"){
                    setParticiple(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...participleCorrectMessages];
                }else  if (verbInfo.tense === "Imperative"){
                    setImperative(prev => ({
                        ...prev,
                        numCorrect: prev.numCorrect + 1
                      }));
                      answerMessages = [...generalCorrectMessages, ...imperativeCorrectMessages];
                }
    
            }else {

                setIncorrectHeight(isPortrait?3:2);

                setProgress(prevProgress => ({
                    ...prevProgress,
                    questionsAnswered: prevProgress.questionsAnswered + 1,
                    percentage: Math.round((prevProgress.correctAnswers) / (prevProgress.questionsAnswered + 1) * 100)
                }))
            }

            setAnswerMessage(answerMessages![Math.floor(Math.random() * answerMessages!.length)]);
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

    function addAccent(accent:string) {
        if (!inputDisabled) {
            setInputValue(inputValue + (capsLockOn ? capitalise(accent) : accent))
            focusInput();
        }  
    } 

    function resetStats(){
        setMenu('home');
        setAnswerMessage('');
        setProgress({
            points: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            percentage: 100,
          });

        setPresent({
            numQuestions: 0,
            numCorrect:0
        });

        setImperfect({
            numQuestions: 0,
            numCorrect:0
        });

        setPast({
            numQuestions: 0,
            numCorrect:0
        });

        setFuture({
            numQuestions: 0,
            numCorrect:0
        });

        setConditional({
            numQuestions: 0,
            numCorrect:0
        });

        setParticiple({
            numQuestions: 0,
            numCorrect:0
        });

        setImperative({
            numQuestions: 0,
            numCorrect:0
        });

        setSubjunctive({
            numQuestions: 0,
            numCorrect:0
        });
    }

    const updateTenseStats = async () => {
  const tenses = {
    present,
    imperfect,
    past,
    future,
    conditional,
    imperative,
    participle,
    subjunctive
  };

  const sortedTenses = Object.entries(tenses).sort(
    (a, b) => b[1].numQuestions - a[1].numQuestions
  );
  
  let mostQ = { name: '', value: -Infinity };
  let mostA = { name: '', value: -Infinity };
  let leastA = { name: '', value: Infinity };
  
  // First pass: go through sortedTenses (from most to least questions)
  for (const [name, data] of sortedTenses) {
    const { numQuestions, numCorrect } = data;
  
    if (numQuestions > mostQ.value) {
      mostQ = { name, value: numQuestions };
    }
  
    const accuracy = numQuestions > 0 ? (numCorrect / numQuestions) * 100 : 0;
  
    if (numQuestions > 0 && accuracy > mostA.value) {
      mostA = { name, value: Math.round(accuracy) };
    }
  }
  
  // Second pass: sort from least to most questions, then get leastA
  const ascendingTenses = [...sortedTenses].sort(
    (a, b) => a[1].numQuestions - b[1].numQuestions
  );
  
  for (const [name, data] of ascendingTenses) {
    const { numQuestions, numCorrect } = data;
  
    if (numQuestions === 0) continue;

  
    const accuracy = (numCorrect / numQuestions) * 100;
  
    if (accuracy < leastA.value) {
      leastA = { name, value: Math.round(accuracy) };
    }
  }

  setMostQuestions(mostQ);
  setMostAccurate(mostA);
  setLeastAccurate(leastA);

  // update database, fetch data then update it by adding on new score
  if (!!session && role==='student'){
    const { data, error: fetchError } = await supabase
  .from('TBLstudent')
  .select('*')
  .eq('student_id', session.user.id)
  .single();

  if (fetchError) {
    console.error('Fetch failed:', fetchError);
  } else {
    const newScore = data.total_score + progress.points;
    const newPresentQs = data.present_questions + present.numQuestions;
    const newPresentAs = data.present_corrects + present.numCorrect;
    const newImperfectQs = data.imperfect_questions + imperfect.numQuestions;
    const newImperfectAs = data.imperfect_corrects + imperfect.numCorrect;
    const newPastQs = data.past_questions + past.numQuestions;
    const newPastAs = data.past_corrects + past.numCorrect;
    const newFutureQs = data.future_questions + future.numQuestions;
    const newFutureAs = data.future_corrects + future.numCorrect;
    const newParticipleQs = data.participle_questions + participle.numQuestions;
    const newParticipleAs = data.participle_corrects + participle.numCorrect;
    const newImperativeQs = data.imperative_questions + imperative.numQuestions;
    const newImperativeAs = data.imperative_corrects + imperative.numCorrect;
    const newSubjunctiveQs = data.subjunctive_questions + subjunctive.numQuestions;
    const newSubjunctiveAs = data.subjunctive_corrects + subjunctive.numCorrect;
    const newConditionalQs = data.conditional_questions + conditional.numQuestions;
    const newConditionalAs = data.conditional_corrects + conditional.numCorrect;

    const { error: updateError } = await supabase
    .from('TBLstudent')
    .update({ 
      total_score: newScore,
      present_questions: newPresentQs,
      present_corrects: newPresentAs,
      imperfect_questions: newImperfectQs,
      imperfect_corrects: newImperfectAs,
      past_questions: newPastQs,
      past_corrects: newPastAs,
      future_questions: newFutureQs,
      future_corrects: newFutureAs,
      participle_questions: newParticipleQs,
      participle_corrects: newParticipleAs,
      imperative_questions: newImperativeQs,
      imperative_corrects: newImperativeAs,
      subjunctive_questions: newSubjunctiveQs,
      subjunctive_corrects: newSubjunctiveAs,
      conditional_questions: newConditionalQs,
      conditional_corrects: newConditionalAs,
     })
    .eq('student_id', session.user.id);

    if (updateError) console.error('Update failed:', updateError);
  }

  const { data: classRows, error: fetchClassError } = await supabase
  .from('TBLstudentclass')
  .select('*')
  .eq('student_id', session.user.id);

if (fetchClassError) {
  console.error('Fetch class rows failed:', fetchClassError);
} else {
  for (const row of classRows) {
    // check class rules

    const newScore = row.score + progress.points;
    const newPresentQs = row.present_questions + present.numQuestions;
    const newPresentAs = row.present_corrects + present.numCorrect;
    const newImperfectQs = row.imperfect_questions + imperfect.numQuestions;
    const newImperfectAs = row.imperfect_corrects + imperfect.numCorrect;
    const newPastQs = row.past_questions + past.numQuestions;
    const newPastAs = row.past_corrects + past.numCorrect;
    const newFutureQs = row.future_questions + future.numQuestions;
    const newFutureAs = row.future_corrects + future.numCorrect;
    const newParticipleQs = row.participle_questions + participle.numQuestions;
    const newParticipleAs = row.participle_corrects + participle.numCorrect;
    const newImperativeQs = row.imperative_questions + imperative.numQuestions;
    const newImperativeAs = row.imperative_corrects + imperative.numCorrect;
    const newSubjunctiveQs = row.subjunctive_questions + subjunctive.numQuestions;
    const newSubjunctiveAs = row.subjunctive_corrects + subjunctive.numCorrect;
    const newConditionalQs = row.conditional_questions + conditional.numQuestions;
    const newConditionalAs = row.conditional_corrects + conditional.numCorrect;


    const { error: updateClassError } = await supabase
      .from('TBLstudentclass')
      .update({ 
        score: newScore, 
        present_questions: newPresentQs,
        present_corrects: newPresentAs,
        imperfect_questions: newImperfectQs,
        imperfect_corrects: newImperfectAs,
        past_questions: newPastQs,
        past_corrects: newPastAs,
        future_questions: newFutureQs,
        future_corrects: newFutureAs,
        participle_questions: newParticipleQs,
        participle_corrects: newParticipleAs,
        imperative_questions: newImperativeQs,
        imperative_corrects: newImperativeAs,
        subjunctive_questions: newSubjunctiveQs,
        subjunctive_corrects: newSubjunctiveAs,
        conditional_questions: newConditionalQs,
        conditional_corrects: newConditionalAs, })
      .eq('student_id', session.user.id)
      .eq('class_id', row.class_id);

    if (updateClassError) {
      console.error(`Update failed for class_id ${row.class_id}:`, updateClassError);
    }
  }
}

  }
};

    return (
      <div className={`${styles.container} ${styles.wrapper}`}>

      {(session === null)?
        <p style={{ fontSize: isPortrait ? '2vw' : '1vw', alignContent:'center', borderRadius:'10px', backgroundColor:'red', position:'absolute', top:isPortrait?'68vh':'75vh', left:isPortrait?'7vw':'15vw', height:isPortrait?'20vh':'10vh', width:isPortrait?'18vw':'20vw', textAlign:'center'}}>You are not logged in! Progress will not be saved.</p>:<></>}
      
      {(role === 'teacher')? <p style={{ fontSize: isPortrait ? '2vw' : '1vw', alignContent:'center', borderRadius:'10px', backgroundColor:'red', position:'absolute', top:isPortrait?'68vh':'75vh', left:isPortrait?'7vw':'15vw', height:isPortrait?'20vh':'10vh', width:isPortrait?'18vw':'20vw', textAlign:'center'}}>Your progress will not be saved on a teacher account.</p>:<></>}
          
      {menu === 'home' && (
        <div className={styles.background}>
          <p style={{fontSize:isPortrait?'5vw':'2.5vw'}}>Verb Conjugation Drill</p>
      
          {!isPortrait && <br />}
      
          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-4 w-full text-white text-[isPortrait ? '2.4vw' : '1.2vw']">
            <div className="flex justify-center">
              <p style={{fontSize:isPortrait?'3.6vw':'1.8vw'}}>Total Questions</p>
            </div>
      
            <div className="flex justify-center">
              <select
                className={`${unlimitedPractice ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <span style={{fontSize:isPortrait?'3.6vw':'1.8vw'}}>
                {unlimitedPractice
                  ? "Maximum of unlimited points"
                  : `Maximum of ${(selectedNum - 10) * 5 + 100} points`}
              </span>
            </div>
          </div>
      
          <br />
      
          <label style={{fontSize:isPortrait?'3.6vw':'1.8vw'}} className="flex items-center justify-center text-white text-[isPortrait ? '2.8vw' : '1.4vw'] mr-4 cursor-pointer">
            <input
              type="checkbox"
              checked={unlimitedPractice}
              onChange={(e) => setUnlimitedPractice(e.target.checked)}
              className="peer hidden"
            />
            <span style={{fontSize:isPortrait?'3.6vw':'1.8vw'}} className="w-5 h-5 mr-2 border-2 border-white rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors"></span>
            Unlimited Practice
          </label>
      
          <br />
      
          <label style={{fontSize:isPortrait?'3.6vw':'1.8vw'}} className="flex items-center justify-center text-white text-[isPortrait ? '2.8vw' : '1.4vw'] mr-4 cursor-pointer">
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
      
          <label style={{fontSize:isPortrait?'3.6vw':'1.8vw'}} className="flex items-center justify-center text-white text-[isPortrait ? '2.8vw' : '1.4vw'] mr-4 cursor-pointer">
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
      
          <button
            onClick={() => {
              setMenu('drill');
              nextQuestion();
            }}
            style={{
              position: 'absolute',
              top: isPortrait ? '78vh' : '75vh',
              left: isPortrait ? '32.5vw' : '42.5vw',
              width: isPortrait ? '35vw' : '15vw',
              height: isPortrait ? '7vh' : '9vh',
              fontSize:isPortrait?'3.6vw':'1.8vw'
            }}
          >
            Start
          </button>
        </div>
      )}
      
      {menu === 'drill' && (
        <div>
          <ProgressBar percentage={progress.percentage} />
          <p className={styles.pointsText}>
            {progress.points} points ({progress.correctAnswers}/{progress.questionsAnswered})
          </p>
      
          <div className={styles.verbDrillContainer}>
            <div
              className={styles.verbDrillBackground}
              style={{
                width: isPortrait ? '84vw' : '30vw',
                height: isPortrait ? '27vh' : '50vh',
                left: isPortrait ? '8vw' : '14vw',
                top: '25vh',
              }}
            >
              {!isPortrait && <div style={{ height: "5vh" }} />}
              <p style={{ fontSize: isPortrait ? '4.8vw' : '2.4vw', fontWeight: '500' }}>
                {capitalise(verbInfo.infinitive)}
              </p>
              <p style={{ fontSize: isPortrait ? '2.4vw' : '1.2vw', fontWeight: '50' }}>{verbInfo.translation}</p>
              <br />
              <p style={{
                fontSize: isPortrait ? '3.8vw' : '1.9vw',
                backgroundColor: '#191A27',
                borderRadius: '15px'
              }}>
                {verbInfo.tense}
              </p>
              {!isPortrait && <br />}
              <p style={{ fontSize: isPortrait ? '4.8vw' : '2.4vw', fontWeight: '400' }}>
                {checkButton ? '' : (verbInfo.tense !== "Imperative" ? capitalise(verbInfo.pronoun) : '') + ' ' + capitalise(verbInfo.answer)}
              </p>
            </div>
      
            <p style={{
              fontSize: isPortrait ? '3.2vw' : '1.6vw',
              position: 'absolute',
              left: isPortrait ? '2vw' : '46vw',
              top: isPortrait ? '61vh' : '47.5vh'
            }}>
              {verbInfo.pronoun}
            </p>
      
            <input
              ref={inputRef}
              type="text"
              style={{
                position: "absolute",
                width: isPortrait ? "65vw" : "25vw",
                height: isPortrait ? '8vh' : "12vh",
                left: isPortrait ? "20vw" : "52vw",
                top: isPortrait ? "60vh" : "44vh",
                fontSize: isPortrait ? '3.2vw' : '1.6vw'
              }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={inputDisabled}
              onMouseEnter={handleMouseEnter}
            />
      
            {(progress.questionsAnswered < selectedNum || unlimitedPractice)?
            <button
              onClick={nextQuestion}
              onKeyDown={handleKeyDown}
              style={{
                width: isPortrait ? '40vw' : '20vw',
                height: isPortrait ? '8vh' : '10vh',
                position: 'absolute',
                top: '80vh',
                left: isPortrait ? '30vw' : '54.5vw',
                fontSize: isPortrait ? '3.2vw' : '1.6vw'
              }}
            >
              {checkButton ? 'Check' : 'Next'}
            </button>:<></>}
      
            {!checkButton ? (
              <button
                onClick={() => setEndWarning(true)}
                style={{
                  width: isPortrait ? '20vw' : '20vw',
                  height: isPortrait ? '8vh' : '10vh',
                  position: 'absolute',
                  top: '80vh',
                  left: isPortrait ? '75vw' : '78vw',
                  background: '#B85353',
                  fontSize: isPortrait ? '3.2vw' : '1.6vw'
                }}
                className={styles.endButton}
              >
                End
              </button>
            ) : (
              <></>
            )}
      
            <p style={{fontSize: isPortrait ? '2.6vw' : '1.3vw', position:'absolute', top:'73.5vh', left:isPortrait?'5vw':'30vw', width:isPortrait?'95vw':'70vw', textAlign:'center'}}>{answerMessage}</p>
      
            <div className={styles.correctPopup} style={{
              alignItems: 'center',
              display: "flex",
              flexDirection: 'column',
              position: "absolute",
              width: isPortrait ? "65vw" : "25vw",
              height: isPortrait ? `${3 * correctHeight}vh` : `${6 * correctHeight}vh`,
              left: isPortrait ? "20vw" : "52vw",
              top: isPortrait ? "63vh" : "50vh"
            }}>
              <Image
                src="/images/greenCheck.png"
                alt="Correct"
                width={30}
                height={30}
                style={{ marginTop: 'auto', paddingBottom: isPortrait ? '0vh' : '1vh' }}
              />
            </div>
      
            <div className={styles.incorrectPopup} style={{
              alignItems: 'center',
              display: "flex",
              flexDirection: 'column',
              position: "absolute",
              width: isPortrait ? "65vw" : "25vw",
              height: isPortrait ? `${3 * incorrectHeight}vh` : `${6 * incorrectHeight}vh`,
              left: isPortrait ? "20vw" : "52vw",
              top: isPortrait ? "63vh" : "50vh"
            }}>
              <Image
                src="/images/redCross.png"
                alt="Incorrect"
                width={30}
                height={30}
                style={{ marginTop: 'auto', paddingBottom: isPortrait ? '0vh' : '1vh' }}
              />
            </div>
      
            {["é", "è", "ê", "î", "û", "ç"].map((accent, i) => (
              <button
                key={accent}
                onClick={() => addAccent(accent)}
                style={{
                  position: 'absolute',
                  top: isPortrait ? '54vh' : '30vh',
                  left: isPortrait
                    ? `${16 + i * 12.5}vw`
                    : `${50 + i * 5}vw`,
                  height: isPortrait ? '4.5vh' : '6vh',
                  width: isPortrait ? '10vw' : '4vw',
                  borderRadius: '180px',
                  padding: '0rem 0rem',
                  backgroundColor: '#1852B1',
                  fontSize: isPortrait ? '2vw' : '1vw'
                }}
              >
                {accent}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {menu === "end" && (
        <>
          <p style={{fontSize: isPortrait ? '6vw' : '3vw', position:'absolute', top:'7vh'}}>Drill Completed!</p>
          <div style={{backgroundColor:'#1c1e28', borderRadius:'15px', position:'absolute', left:isPortrait?'10vw':'5vw', top:isPortrait?'18vh':'20vh', width:isPortrait?'80vw':'42vw', height:isPortrait?'25vh':'48vh', textAlign:'center', boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)'}}>
            <p className={styles.statNumber} style={{fontSize: isPortrait ? '10vw' : '5vw', fontWeight:'500', position:'absolute', top:isPortrait?'4vh':'10vh', left:isPortrait?'6vw':'3vw'}}>{progress.percentage}%</p>
            <p style={{fontSize: isPortrait ? '4vw' : '2vw', fontWeight:'300', position:'absolute', top:isPortrait?'15vh':'28vh', left:isPortrait?'7.5vw':'4vw'}}>Accuracy</p>
      
            <p className={styles.statNumber} style={{fontSize: isPortrait ? '10vw' : '5vw', fontWeight:'500', position:'absolute', top:isPortrait?'4vh':'10vh', left:isPortrait?'35vw':'18vw'}}>{progress.points}</p>
            <p style={{fontSize: isPortrait ? '4vw' : '2vw', fontWeight:'300', position:'absolute', top:isPortrait?'15vh':'28vh', left:isPortrait?'37.5vw':'19.2vw'}}>Points</p>
      
            <p className={styles.statNumber} style={{fontSize: isPortrait ? '10vw' : '5vw', fontWeight:'500', position:'absolute', top:isPortrait?'4vh':'10vh', left:isPortrait?'64vw':'33vw'}}>{progress.questionsAnswered}</p>
            <p style={{fontSize: isPortrait ? '4vw' : '2vw', fontWeight:'300', position:'absolute', top:isPortrait?'15vh':'28vh', left:isPortrait?'58vw':'29vw'}}>Verbs Practiced</p>
          </div>
      
          <div style={{backgroundColor:'#1c1e28', borderRadius:'15px', position:'absolute', left:isPortrait?'10vw':'53vw', top:isPortrait?'46vh':'20vh', width:isPortrait?'80vw':'42vw', height:isPortrait?'25vh':'48vh', textAlign:'center', boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)'}}>
            <p style={{fontSize: isPortrait ? '1.8vw' : '1.4vw', fontWeight:'300'}}>Most Practiced Tense</p>
      
            <p className={styles.statNumber} style={{fontSize: isPortrait ? '3vw' : '2.6vw', fontWeight:'500'}}>{capitalise(mostQuestions.name)} ({mostQuestions.value} Qs)</p>
      
            <br></br>
      
            <p style={{fontSize: isPortrait ? '1.8w' : '1.4vw', fontWeight:'300'}}>Most Accurate Tense</p>
      
            <p className={styles.statNumber} style={{fontSize: isPortrait ? '3vw' : '2.6vw', fontWeight:'500'}}>{capitalise(mostAccurate.name)} ({mostAccurate.value}%)</p>
      
            <br></br>
      
            <p style={{fontSize: isPortrait ? '1.8vw' : '1.4vw', fontWeight:'300'}}>Least Accurate Tense</p>
      
            <p className={styles.statNumber} style={{fontSize: isPortrait ? '3vw' : '2.6vw', fontWeight:'500'}}>{capitalise(leastAccurate.name)} ({leastAccurate.value}%)</p>
          </div>
      
          <button style={{position:'absolute', top:'75vh', left:isPortrait?'25vw':'40vw', height:'8vh', width:isPortrait?'50vw':'20vw', fontSize: isPortrait ? '2.8vw' : '1.4vw'}} onClick={() => resetStats()}>Start New Drill</button>
        </>
      )}
      
      {endWarning?(<div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      >
      <div 
        style={{
          height: '50vh',
          width: isPortrait ? '60vw' : '40vw',
          backgroundColor: '#303142',
          borderRadius: '15px',
          padding: '1rem',
          zIndex: 60
        }}
      >
          <br></br>
        <p style={{ fontSize: isPortrait ? '3vw' : '1.5vw', textAlign: 'center', fontWeight:'600'}}>Are you sure you want to end the drill?</p>
        <p style={{ fontSize: isPortrait ? '2.4vw' : '1.2vw', textAlign: 'center', fontWeight:'400'}}>Your current progress will be saved.</p>
        <br></br>
        <br></br>
      <button style={{position:'absolute', top:'58vh', left:isPortrait?'26vw':'36vw', width:isPortrait?'20vw':'11vw', height:isPortrait?'7vh':'9vh', padding:'0px 0px'}} onClick={() => {setMenu('end'); setEndWarning(false); updateTenseStats();}}>Yes</button>
      <button style={{position:'absolute', top:'58vh', left:isPortrait?'54vw':'53vw', width:isPortrait?'20vw':'11vw', height:isPortrait?'7vh':'9vh', padding:'0px 0px'}} onClick={() => setEndWarning(false)}>Cancel</button>
      </div>
      </div>)
      :<></>}
      </div>
      )};