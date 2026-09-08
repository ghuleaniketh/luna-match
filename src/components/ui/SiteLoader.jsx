import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

export default function SiteLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="site-loader"
      role="status"
      aria-label="Loading LUNA-MATCH"
    >
      <div className="site-loader__content">
        <div className="site-loader__mark" aria-hidden="true">
          <span className="site-loader__moon">
            <span className="site-loader__moon-detail site-loader__moon-detail--one" />
            <span className="site-loader__moon-detail site-loader__moon-detail--two" />
          </span>
          <span className="site-loader__orbit" />
          <Rocket className="site-loader__rocket" strokeWidth={1.8} />
        </div>
        <p className="site-loader__name">LUNA-MATCH</p>
        <div className="site-loader__track" aria-hidden="true">
          <span />
        </div>
        <p className="site-loader__status">Charting the lunar surface</p>
      </div>
    </div>
  );
}
