import React from "react";
import { Provider } from "react-redux";
import Home from "./views/Home";
import store from "./redux/store";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Home />
      </Provider>
    </div>
  );
}

export default App;
