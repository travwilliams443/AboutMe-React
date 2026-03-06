import { useMemo, useState } from "react";
import RelatedRatesAirliners from "./demos/RelatedRatesAirliners";
import RelatedRatesBalloonRope from "./demos/RelatedRatesBalloonRope";
import RelatedRatesCircle from "./demos/RelatedRatesCircle";
import RelatedRatesConeDrain from "./demos/RelatedRatesConeDrain";
import RelatedRatesKite from "./demos/RelatedRatesKite";
import RelatedRatesLadder from "./demos/RelatedRatesLadder";
import RelatedRatesStreetLight from "./demos/RelatedRatesStreetLight";

export default function App() {
  const tabs = useMemo(
    () => [
      {
        id: "related-rates-circle",
        label: "Related Rates: Circle",
        component: RelatedRatesCircle
      },
      {
        id: "related-rates-airliners",
        label: "Related Rates: Airliners",
        component: RelatedRatesAirliners
      },
      {
        id: "related-rates-kite",
        label: "Related Rates: Kite",
        component: RelatedRatesKite
      },
      {
        id: "related-rates-cone-drain",
        label: "Related Rates: Cone Drain",
        component: RelatedRatesConeDrain
      },
      {
        id: "related-rates-ladder",
        label: "Related Rates: Ladder",
        component: RelatedRatesLadder
      },
      {
        id: "related-rates-balloon-rope",
        label: "Related Rates: Balloon Rope",
        component: RelatedRatesBalloonRope
      },
      {
        id: "related-rates-street-light",
        label: "Related Rates: Street Light",
        component: RelatedRatesStreetLight
      }
    ],
    []
  );

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const ActiveComponent = activeTab.component;

  return (
    <div className="app-shell">
      <header className="top-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${tab.id === activeTabId ? "active" : ""}`}
            onClick={() => setActiveTabId(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </header>
      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  );
}
