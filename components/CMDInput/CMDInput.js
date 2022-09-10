import React, { useEffect, useRef, useState } from "react";
import style from "./CMDInput.module.css";

const CMDInput = ({ callback }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef) inputRef.current.focus();
  }, [inputRef]);

  const handleInput = (e) => {
    const {
      target: { value },
    } = e;

    setInput(value);
  };

  return (
    <div className={style["content-footer"]}>
      {">"}{" "}
      <input
        autoFocus
        ref={inputRef}
        value={input}
        onBlur={() => {
          console.log("onBlur");
          inputRef.current.focus();
        }}
        onChange={handleInput}
        onKeyDown={(evt) => {
          const keyCode = evt.key;
          if (keyCode === "Enter") {
            evt.preventDefault();
            callback(input);
            setInput("");
          }
        }}
        className={style.cmd}
        style={{ width: `${input.length}ch` }}
      />
      <span className={style.blink}>{"▮"}</span>
    </div>
  );
};

export default CMDInput;
