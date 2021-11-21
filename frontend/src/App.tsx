import React, { useMemo, useState } from "react";
import Landing from "./views/home/Landing";

import Hero from "./views/hero/HeroScreen";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { AppContext } from "./context/state";

function App(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const value = useMemo(() => ({ loading, setLoading }), [loading]);
  return (
    <div className="App">
      <AppContext.Provider value={value}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/fighter/:id" element={<Hero />} />
        </Routes>
      </AppContext.Provider>
    </div>
  );
}

export default App;
