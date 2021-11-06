import React from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import actions from '../../redux/actions';
import { useMetamask } from 'use-metamask';
import Web3 from 'web3';

export default function Home() {
  const dispatch = useDispatch();
  const { name } = useSelector((state: { name: string }) => state);
  const { connect, metaState } = useMetamask();
  
  
  return (
    <main>
      Home Page {name} {metaState.isConnected ? 'isConnected': '!isConnected'} {metaState.isAvailable ? 'available' : 'not available'}
      <Button
        type="primary"
        style={{ marginTop: 20 }}
        onClick={async () => {
          dispatch(actions.changeUsername(`1${name}`));
          if (!metaState.isConnected) {

            try {
              await connect(Web3);
            } catch (error) {
              console.log(error);
            }

        }
        }}
      >
        Mint NFT
      </Button>
    </main>
  );
}
