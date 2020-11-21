import tasks from './tasks.json'
import useRandomSeed from "./useRandomSeed";
import React from "react";
import _ from 'lodash';
import "./Randomizer.css";
export default function Randomizer(props) {
  const [rng, seed, setSeed] = useRandomSeed();

  const onUseRandomSeed = () => {
    const newSeed = Math.random();
    setSeed(newSeed);
  }


  const world2 = rng.quick() >= 0.5 ? "jungle" : "volcana";
  const world4 = rng.quick() >= 0.5 ? "tidepool" : "temple";
  const path = ["dwelling", world2, world4, "neobabylon"];


  const worldToTask = {}
  _.each(path, world => {
    const worldTasks = tasks.tasks[world];
    const index = Math.floor(rng.quick() * worldTasks.length);
    worldToTask[world] = worldTasks[index];
  })

  const pathElements = _.map(path, world => {
    const taskForWorld = worldToTask[world].name;
    return <div key={world}>
        <label className="world">{world}</label>
        <span className="task">{taskForWorld}</span>
      </div>
  })

  return <div>
    <div>seed is {seed}</div>
    {/*<div>rng is {rng.quick()}</div>*/}
    {/*<div>path is {path.join(",")}</div>*/}
    <div>{pathElements}</div>
    <button onClick={onUseRandomSeed}>Use a Random Seed</button>
  </div>
}
