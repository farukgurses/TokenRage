import { SET_USERNAME } from "./constants";

const initialState: { name: string } = {
  name: "",
};

export default (
  state = initialState,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        name: action.payload,
      };
    default:
      return state;
  }
};
