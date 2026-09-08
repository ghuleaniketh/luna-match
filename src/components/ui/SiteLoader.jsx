import { useEffect, useState } from "react";

export default function SiteLoader({ onReady }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsExiting(true);
      onReady?.();
    }, 1600);
    const exitTimer = window.setTimeout(() => setIsVisible(false), 1950);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(exitTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`site-loader${isExiting ? " site-loader--exiting" : ""}`}
      role="status"
      aria-label="Loading LUNA-MATCH"
    >
      <div className="site-loader__content">
        <img className="site-loader__gif" src="/loader.gif" alt="" aria-hidden="true" />
        <p className="site-loader__name">LUNA-MATCH</p>
        <div className="site-loader__track" aria-hidden="true">
          <span />
        </div>
        <p className="site-loader__status">Charting the lunar surface</p>
      </div>
    </div>
  );
}
