import { createContext } from "react";

const AppContext = createContext({
  loading: true,
  setLoading: (_: boolean) => {
    _;
    return;
  },
});

export { AppContext };
