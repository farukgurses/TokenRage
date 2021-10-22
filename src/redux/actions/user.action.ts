import { SET_USERNAME } from '../constants';

export const changeUsername = (username: string) => async (dispatch: any) => {
  dispatch({ type: SET_USERNAME, payload: username });
};

export const mock = () => {};
