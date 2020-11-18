import './App.css';
import _ from 'lodash';
import React, {useEffect, useState} from "react";

function App() {
  const [taskData, setTaskData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/values.csv');
      const textData = await response.text();
      const fetchedData = _.filter(_.map(textData.split('\n'), line => {
        if (line.trim()) {
          let [task, score] = line.split(',');
          task = task.trim();
          try {
            score = Number.parseInt(score.trim(), 10);
          } catch {
            alert("could not parse csv file, error with task: " + task)
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
    const BINGO_CENTER_INDEX = Math.floor(BINGO_CARD_SIZE/2)
    const usedIndexesSet = new Set()
    for (let i = 0; i < BINGO_CARD_SIZE; i++) {
      // random drawing
      let index = Math.floor(Math.random() * BINGO_CARD_SIZE);
      while (usedIndexesSet.has(index)) {
        index = (index + 1) % BINGO_CARD_SIZE;
      }
      usedIndexesSet.add(index);
    }
  // convert to array for indexing
  const usedIndexes = [...usedIndexesSet];
    for (let i = 0; i < usedIndexes.length; i++) {
      if (i === BINGO_CENTER_INDEX) {
        bingoCards.push(<div>free</div>);
      } else {
        const usedIndex = usedIndexes[i];
        const task = taskData[usedIndex]
        bingoCards.push(<div>{task.task}</div>)
      }
    }
  }
  return (
    <div className="App">
      <header className="App-header">
        Spelunky 2 Bingo
      </header>
      <section>
        <div className="bingo-sheet">
          {bingoCards}
        </div>
      </section>
    </div>
  );
}

export default App;
