import React from "react";
import { Provider } from "react-redux";
import Home from "./views/Home";
import store from "./redux/store";

import "./App.css";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Provider>
    </div>
  );
}

export default App;
