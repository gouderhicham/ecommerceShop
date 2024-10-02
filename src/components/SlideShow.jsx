import React, { useState } from "react";
import styles from "../styles/Slide.module.css";
const SlideShow = ({ sources }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prevIndex) => (prevIndex + 1) % sources.length);
      setFade(true);
    }, 300);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setFade(true);
    }, 500);
    setIndex((prevIndex) => (prevIndex - 1 + sources.length) % sources.length);
  };
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div
      className={`${styles.slide_show} ${
        isFullScreen ? styles.full_screen : ""
      }`}
    >
      {sources[index] && (
        <img
          className={`${styles.main_image} ${
            fade ? styles.fade_in : styles.fade_out
          } ${isFullScreen ? styles.full_screen_image : ""}`}
          src={sources[index]}
          alt={`Slide ${index + 1}`}
          onClick={toggleFullScreen} 
        />
      )}

      {isFullScreen && (
        <button className={styles.close_button} onClick={toggleFullScreen}>
          X
        </button>
      )}

      {!isFullScreen && (
        <>
          <img
            className={styles.slider_right_arrow}
            src="../sliderar.svg"
            alt="Next"
            onClick={handleNext}
          />
          <img
            className={styles.slider_left_arrow}
            src="../sliderar.svg"
            alt="Previous"
            onClick={handlePrev}
          />
        </>
      )}
    </div>
  );
};

export default SlideShow;
