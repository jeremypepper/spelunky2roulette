import './App.css';
import _ from 'lodash';
import React, {useEffect, useState} from "react";
import Card from './Card';
import seedrandom from 'seedrandom';

function App() {
  let seedinputFromUrl = new URLSearchParams(window.location.search).get("seedinput")

  const [taskData, setTaskData] = useState([]);
  const [seed, setSeed] = useState(seedinputFromUrl);
  const rng = new seedrandom(seed);
  const input = React.createRef();


  const onUseRandomSeed = () => {
    seedinputFromUrl = Math.random();
    window.history.replaceState(null, null, "?seedinput=" + seedinputFromUrl)
    setSeed(seedinputFromUrl);
  }
  // const onSubmit = (event) => {
  //   setSeed(input.current.value);
  // }

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
      const fetchedData = _.filter(_.map(textData.split('\n'), line => {
        if (line.trim()) {
          let [,task, score] = line.match(/(.+),(\W*\d)/);
          task = task.trim();
          try {
            score = Number.parseInt(score.trim(), 10);
          } catch {
            console.error("could not parse csv file, error with task: " + task)
          }
          return {task, score};
        }
      }));

      setTaskData(fetchedData);
    }
    fetchData();
  }, [])



  let bingoCards = [];
  if (taskData.length > 0) {
    const BINGO_CARD_SIZE = 25;
    const BINGO_CENTER_INDEX = Math.floor(BINGO_CARD_SIZE / 2)
    const usedIndexesSet = new Set()
    for (let i = 0; i < BINGO_CARD_SIZE; i++) {
      // random drawing
      let index = Math.floor(rng.quick() * taskData.length);
      while (usedIndexesSet.has(index)) {
        index = (index + 1) % taskData.length;
      }
      usedIndexesSet.add(index);
    }
  // convert to array for indexing
  const usedIndexes = [...usedIndexesSet];
    for (let i = 0; i < usedIndexes.length; i++) {
      if (i === BINGO_CENTER_INDEX) {
        bingoCards.push(<Card key="free" isActive={true}>free</Card>);
      } else {
        const usedIndex = usedIndexes[i];
        const task = taskData[usedIndex]
        bingoCards.push(<Card key={task.task + seed}>{task.task}</Card>)
      }
    }
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
          {bingoCards}
        </div>
      </section>

    </div>
  );
}

export default App;
