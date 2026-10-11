## French Conjugation Coach
https://french-conjugation-coach.vercel.app/

Learn French conjugations by practicing verbs endings. Includes selected practice, accounts for progress tracking, classes and teacher accounts for easy tracking of student progress, and leaderboards for some motivation and fun!

## Features
- Randomised verb conjugation drills, including an option to focus on specific tenses
- Points and accuracy tracking with visual feedback for each question and a summary at the end of each drill
- Student accounts for stats tracking long term to spot weaknesses and to build up your points total
- Teacher accounts and classes for tracking the performance of a class overall
- Live points leaderboards in each class

## Running locally

**Prerequisites**: Node.js and npm

**Setup**: Clone the repository and enter the application directory:

```bash
git clone https://github.com/Ondrej215/French-Conjugation-Coach.git
cd French-Conjugation-Coach/french-conjugation-coach
```

Install the dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

Configuration: Depending on the features you want to use, you may need to configure Supabase environment variables before running the application.

## How It Works
All conjugations are stored in an online database hosted by supabase alongside account, class and leaderboard data. This ensures new conjugations can be added at any time.
In order to minimise the amount of data stored in the database, each verb is assigned a group representing its conjugation pattern, these patterns were designed by me to capture the conjugations of the vast majority of French verbs. Any irregularities in the verb's conjugations can then be added when needed.
RLS and policies are used to ensure that students do not edit class related data that only teachers should be able to access, and that no user can configure verb data.
All passwords are encrypted in the user database table and, as the database is hosted online, users can log into their accounts from any devices.
