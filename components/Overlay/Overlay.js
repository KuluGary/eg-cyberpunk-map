import React from "react";
import style from "./Overlay.module.css";

const Overlay = ({ children }) => {
  return (
    <>
      <div className={style.scanline} />
      <div className={style.crtEffect} />
      <div className={style.overlay} />
      {children}
    </>
  );
};

export default Overlay;
