import React, { useState } from "react";
import Card from "../atoms/Card";
import LorenzAttractor from "./LorenzAttractor"; 
import MagneticField from "./MagneticField";
import AppViewerModal from "./AppViewerModal";
import styles from "./CoolStuffCard.module.css";

export default function CoolStuffCard() {
  const [openOld, setOpenOld] = useState(false);
  const [openLorenzR3F, setOpenLorenzR3F] = useState(false);
  const [openMagneticField, setOpenMagneticField] = useState(false);

  return (
    <>
      <Card title="My Projects">
        <ul className={styles.list}>
          <li>
            <button
              onClick={() => setOpenLorenzR3F(true)}
              className={styles.sendButton}
            >
              Lorenz Attractor
            </button>
          </li>
          <li>
            <button
              onClick={() => setOpenMagneticField(true)}
              className={styles.sendButton}
            >
              Magnetic Field Simulator
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

      {/* Modal for Magnetic Field */}
      <AppViewerModal
        isOpen={openMagneticField}
        onClose={() => setOpenMagneticField(false)}
        title="Magnetic Field Simulator"
      >
        <MagneticField />
      </AppViewerModal>
    </>
  );
}
