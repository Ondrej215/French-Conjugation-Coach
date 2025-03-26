"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function test() {
  const [allData, setAllData] = useState<any[]>([]); // Stores everything from the infinitive table
  const [allConjugations, setAllConjugations] = useState<any[]>([]); // Stores everything from the conjugations table
  const [allStems, setAllStems] = useState<any[]>([]); // Stores everything from the stems table
  const [infinitives, setInfinitives] = useState<string[]>([]); // Stores just the "infinitive" column
  const [selectedInfinitive, setSelectedInfinitive] = useState<string>("");
  const [selectedPronoun, setSelectedPronoun] = useState<string>("Je");
  const [selectedTense, setSelectedTense] = useState<string>("Present");
  // Pronouns List
  const pronouns = ["Je", "Tu", "Il", "Nous", "Vous", "Ils"];

  // Tenses List
  const tenses = ["Present", "Past Participle", "Imperfect", "Future Simple", "Conditional", "Subjunctive", "Present Participle", "Imperative"];

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      // Fetch infinitives
      const { data: infinitiveData, error: infinitiveError } = await supabase.from("TBLinfinitive").select("*");
  
      if (infinitiveError) {
        console.error("Error fetching infinitives:", infinitiveError);
      } else if (infinitiveData) {
        setAllData(infinitiveData);
        const infinitiveList = infinitiveData.map((row) => row.infinitive);
        setInfinitives(infinitiveList);
        setSelectedInfinitive(infinitiveList[0] || "");
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
  }, []);

  // Alerts all data from the infinitives database
  const alertAllData = () => {
    alert(JSON.stringify(allData));
    console.log(allData)
  }

  const getConjugation = (pronounConjugation: string, tenseID: number, infinitiveID: number) => {

    let pronounID;
        switch (selectedPronoun){
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
  const conjugateOptions = () => {
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

    alert(conjugation);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <br></br>
      {/* Infinitive Dropdown */}
      <select
        className="p-2 border rounded-lg"
        value={selectedInfinitive}
        onChange={(e) => setSelectedInfinitive(e.target.value)}
      >
        {infinitives.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Pronoun Dropdown */}
      <select
        className="p-2 border rounded-lg"
        value={selectedPronoun}
        onChange={(e) => setSelectedPronoun(e.target.value)}
      >
        {pronouns.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Tense Dropdown */}
      <select
        className="p-2 border rounded-lg"
        value={selectedTense}
        onChange={(e) => setSelectedTense(e.target.value)}
      >
        {tenses.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button onClick={conjugateOptions} className="px-4 py-2 bg-blue-500 text-white rounded">
        Conjugate
      </button>
      <br></br>
      <button onClick={alertAllData} className="px-4 py-2 bg-blue-500 text-white rounded">
        Show all data
      </button>
    </div>
  );
}
