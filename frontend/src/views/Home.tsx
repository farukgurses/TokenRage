import React from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../redux/actions';

export default function Home() {
  const dispatch = useDispatch();
  const { name } = useSelector((state: { name: string }) => state);
  
  return (
    <main>
      Home Page {name}
      <Button
        type="primary"
        style={{ marginTop: 20 }}
        onClick={() => {
          dispatch(actions.changeUsername(`1${name}`));
        }}
      >
        Mint NFT
      </Button>
    </main>
  );
}
