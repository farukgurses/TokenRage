import React from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../redux/actions';

export default function Home() {
  const dispatch = useDispatch();
  const { name } = useSelector((state: { user: { name: string }}) => state.user);

  console.log(name);

  return (
    <div>
      Home Page
      <Button
        type="primary"
        style={{ marginTop: 20 }}
        onClick={() => {
          dispatch(actions.user.changeUsername(`1${name}`));
        }}
      >
        Mint NFT
      </Button>
    </div>
  );
}
