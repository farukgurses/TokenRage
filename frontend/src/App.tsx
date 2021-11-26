import React, { useMemo, useState } from "react";
import Landing from "./views/home/Landing";

import Modal from "react-modal";

import Hero from "./views/hero/HeroScreen";
import "./App.css";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import { AppContext } from "./context/state";

function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [isModalOpened, setModalOpened] = useState(false);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const value = useMemo(
    () => ({ loading, setLoading, setModalOpened, setModalContent }),
    [loading, isModalOpened, modalContent]
  );
  return (
    <div className="App">
      <AppContext.Provider value={value}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hero/:id" element={<Hero />} />
        </Routes>
        <Modal
          isOpen={isModalOpened}
          overlayClassName="modal-overlay"
          className="modal"
          onRequestClose={() => setModalOpened(false)}
          contentLabel="Example Modal"
        >
          <div
            className="modal-close-button"
            onClick={() => setModalOpened(false)}
          ></div>
          <div className="modal-content">{modalContent}</div>
        </Modal>
      </AppContext.Provider>
    </div>
  );
}

export default App;
