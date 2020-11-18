import './App.css';
import _ from 'lodash';
import React, {useEffect, useState} from "react";
import Card from './Card';
import seedrandom from 'seedrandom';

function App() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  let seedinputFromUrl = urlSearchParams.get("seedinput")
  const debug = urlSearchParams.get("debug");

  const [taskData, setTaskData] = useState(null);
  const [seed, setSeed] = useState(seedinputFromUrl);
  const rng = new seedrandom(seed);
  const input = React.createRef();


  const onUseRandomSeed = () => {
    seedinputFromUrl = Math.random();
    window.history.replaceState(null, null, "?seedinput=" + seedinputFromUrl)
    setSeed(seedinputFromUrl);
  }

  const onchange = (event) => {
    setSeed(event.target.value)
  }

  if (!seedinputFromUrl) {
    onUseRandomSeed();
  }


  useEffect(() => {
    async function fetchData() {
      const response = await fetch(process.env.PUBLIC_URL + '/values.csv');
      const textData = await response.text();
      const fetchedData = _(textData.split('\n'))
          .map(line => {
            if (line.trim()) {
              let [, task, difficulty] = line.match(/(.+),(\W*\d)/);
              task = task.trim();
              try {
                difficulty = Number.parseInt(difficulty.trim(), 10);
              } catch {
                console.error("could not parse csv file, error with task: " + task)
              }
              return {task, difficulty};
            }
          })
          .filter()
          .groupBy(task => task.difficulty)
          .valueOf();

      setTaskData(fetchedData);
    }

    fetchData();
  }, [])


  let taskGrid = [[], [], [], [], []];
  let bingoCards = [[], [], [], [], []];
  let flattenedBingoCards = [];
  if (taskData) {
    const MAX_DIFFICULTY = 5
    const BINGO_CARD_ROWS = 5;
    const BINGO_CARD_COLUMNS = BINGO_CARD_ROWS;
    const tasksByDifficultySet = [
        new Set(taskData[1]),
        new Set(taskData[2]),
        new Set(taskData[3]),
        new Set(taskData[4]),
        new Set(taskData[5])];
    for (let i = 0; i < BINGO_CARD_ROWS; i++) {
      for (let j = 0; j < BINGO_CARD_COLUMNS; j++) {
        if (i === 2 && j === 2) {
          taskGrid[i][j] = {task:"free", difficulty: 0}
          continue;
        }
        let index;
        let difficulty = Math.floor(rng.quick() * MAX_DIFFICULTY)
        // safety check if we don't have enough items, bump up difficulty
        let difficultySet = tasksByDifficultySet[difficulty];
        if (i > 0) {
          // get the difficulty in the column/row
          let iSum = 0;
          for (let k = 0; k < i; k++) {
            iSum = iSum + taskGrid[k][j].difficulty;
          }
          const iAvg = iSum / i;

          let jSum = 0;
          for (let l = 0; l < j; l++) {
            jSum = jSum + taskGrid[i][l].difficulty;
          }
          const jAvg = jSum / j;
          const avg = (iAvg + jAvg) / 2;

          console.log("iAvg", iAvg, "jAvg", jAvg, difficulty)
          if (avg < 2) {
            difficulty++;
          } else if (avg > 4) {
            difficulty--;
          }
          console.log("iAvg", iAvg, "jAvg", jAvg, difficulty)
        }
        while (difficultySet.size === 0) {
          console.error("difficulty overflow in difficulty", difficulty)
          difficulty = (difficulty + 1 ) % MAX_DIFFICULTY;
          difficultySet = tasksByDifficultySet[difficulty]
        }
        index = Math.floor(rng.quick() * difficultySet.size);
        const taskItem = [...difficultySet][index];
        difficultySet.delete(taskItem);
        taskGrid[i][j] = taskItem;
      }
    }

    for (let i = 0; i < BINGO_CARD_ROWS; i++) {
      for (let j = 0; j < BINGO_CARD_COLUMNS; j++) {
        if (i === 2 && j === 2) {
          bingoCards[i].push(<Card key="free" isActive={true}>free</Card>);
        } else {
          const task = taskGrid[i][j];
          const debugDifficulty = debug ? (" ("+ task.difficulty + ")") : "";
          bingoCards[i].push(<Card key={task.task + seed}>{task.task + debugDifficulty}</Card>)
        }
      }
    }
    flattenedBingoCards = _.flatMap(bingoCards);
  }
  return (
      <div className="App">
        <header className="App-header">
          Spelunky 2 Bingo
        </header>
        <section>
          <form>
            <label>Use a set seed: </label><input name="seedinput" ref={input} value={seed} onChange={onchange}/>
          </form>
          <button onClick={onUseRandomSeed}>Use a Random Seed</button>
        </section>
        <section>
          <div className="bingo-sheet">
            {flattenedBingoCards}
          </div>
        </section>

      </div>
  );
}

export default App;
