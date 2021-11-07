import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import Home from "./views/home/Main";
import store from "./redux/store";

import "./App.css";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <ReduxProvider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ReduxProvider>
    </div>
  );
}

export default App;
