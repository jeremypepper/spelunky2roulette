import {useState} from "react";
import seedrandom from "seedrandom";

export default function useRandomSeed() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  let seedinputFromUrl = urlSearchParams.get("seedinput") || Math.random();
  const [seed, setSeed] = useState(seedinputFromUrl);
  const rng = new seedrandom(seed);

  return [rng, seed, (seed) => {
    window.history.replaceState({seed}, null, "?seedinput=" + seed)
    setSeed(seed);
  }];
}
