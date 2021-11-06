import React, { useEffect } from 'react'
import { Alert, Button } from 'antd'
import { useMetamask } from "use-metamask"
import Web3 from 'web3'

export default function ConnectedScreen () {
  const { connect, getAccounts, metaState } = useMetamask()


  if (!metaState.isConnected) {
    return <Alert message='MetaMask is not connected' type='error' action={
        <Button size="small" type="text" onClick={async () => {
          await connect(Web3)
        }}>
          Connect
        </Button>
      }/>
  }

  return (
    <main>
      Connected
    </main>
  )
}