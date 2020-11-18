import _ from 'lodash';
import React, {useState} from "react";

function Card(props) {
  const [isActive, setActive] = useState(props.isActive || false);
  const onClick = () => {
    setActive(!isActive);
  }
  const className = props.isActive || isActive ? "active" : "notactive";
  return <div className={className} onClick={onClick}>{props.children}</div>
}

export default Card;
