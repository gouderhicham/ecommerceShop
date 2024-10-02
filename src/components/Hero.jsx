import { useEffect, useState } from "react";

const Hero = () => {
  const [fullText] = useState("اتصل للاستفسار حول اي منتوج");
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (index < fullText.length && !isCompleted) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 50);

      return () => clearTimeout(timeout);
    }
    if (index === fullText.length && !isCompleted) {
      setIsCompleted(true);
    }
  }, [index, fullText, isCompleted]);

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>{text}</h1>
        <button
          onClick={() => {
            window.location.href = "tel:0783126027";
          }}
        >
          اتصل: 0783126027
        </button>
      </div>
    </section>
  );
};

export default Hero

