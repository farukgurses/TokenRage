import { createContext } from "react";

const AppContext = createContext({
  loading: true,
  setLoading: (_: boolean) => {
    _;
    return;
  },
  setModalOpened: (_: boolean) => {
    _;
    return;
  },
  setModalContent: (_: JSX.Element | null) => {
    _;
    return;
  },
});

export { AppContext };
