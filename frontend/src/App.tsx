import React from "react";
import { Provider } from "react-redux";
import Home from "./views/home/Main";
import store from "./redux/store";

import "./App.css";
import { Route, Routes } from "react-router-dom";
import { MetamaskStateProvider } from "use-metamask";

function App() {
  
  return (
    <div className="App">
      <MetamaskStateProvider>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Provider>
      </MetamaskStateProvider>
    </div>
  );
}

export default App;
