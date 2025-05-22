import React, { useState } from "react";
import Card from "../atoms/Card";
import LorenzAttractor from "./LorenzAttractor"; // import your new R3F version
import AppViewerModal from "./AppViewerModal";
import styles from "./CoolStuffCard.module.css";

export default function CoolStuffCard() {
  const [openOld, setOpenOld] = useState(false);
  const [openLorenzR3F, setOpenLorenzR3F] = useState(false);

  return (
    <>
      <Card title="Cool Stuff">
        <ul className={styles.list}>
          <li>
            <button
              onClick={() => setOpenLorenzR3F(true)}
              className={styles.sendButton}
            >
              Lorenz Attractor
            </button>
          </li>
        </ul>
      </Card>

      {/* Modal for React Three Fiber Lorenz attractor */}
      <AppViewerModal
        isOpen={openLorenzR3F}
        onClose={() => setOpenLorenzR3F(false)}
        title="Lorenz Attractor"
      >
        <LorenzAttractor />
      </AppViewerModal>
    </>
  );
}
