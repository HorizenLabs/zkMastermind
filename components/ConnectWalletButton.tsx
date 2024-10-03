import dynamic from 'next/dynamic';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button, message } from 'antd';
import { useAccount } from '../context/AccountContext';

interface ConnectWalletButtonProps {
    onWalletConnected: (rowIndex: number) => void;
}

export interface ConnectWalletButtonHandle {
    openWalletModal: () => void;
    closeWalletModal: () => void;
    setZkVerifyTriggered: (rowIndex: number) => void;
}

const WalletSelect = dynamic(() => import('@talismn/connect-components').then((mod) => mod.WalletSelect), {
    ssr: false,
});

const ConnectWalletButton = forwardRef<ConnectWalletButtonHandle, ConnectWalletButtonProps>((props, ref) => {
    const { selectedAccount, setSelectedAccount } = useAccount();
    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState<boolean>(false);
    const [zkVerifyTriggered, setZkVerifyTriggered] = useState<null | number>(null);

    useImperativeHandle(ref, () => ({
        openWalletModal: () => setIsWalletSelectOpen(true),
        closeWalletModal: () => setIsWalletSelectOpen(false),
        setZkVerifyTriggered: (rowIndex: number) => setZkVerifyTriggered(rowIndex),
    }));

    const handleWalletConnectOpen = () => {
        setIsWalletSelectOpen(true);
    };

    const handleWalletConnectClose = () => {
        setIsWalletSelectOpen(false);
    };

    const handleWalletSelected = (wallet: any) => {
        console.log('Wallet selected:', wallet);
    };

    const handleUpdatedAccounts = (accounts: any[] | undefined) => {
        console.log('Updated accounts:', accounts);
        if (accounts && accounts.length > 0) {
            setSelectedAccount(accounts[0].address);
        } else {
            setSelectedAccount(null);
            message.error('No accounts available.');
        }
    };

    const handleAccountSelected = (account: any) => {
        console.log('Account selected:', account);
        setSelectedAccount(account.address);
        message.success(`Connected account: ${account.address}`);

        if (zkVerifyTriggered !== null) {
            props.onWalletConnected(zkVerifyTriggered);
            setZkVerifyTriggered(null);
        }
    };

    const handleError = (error: any) => {
        console.error('Error during wallet interaction:', error);

        const errorMessage = error && typeof error === 'object' && 'message' in error
            ? error.message
            : 'Unknown error occurred during wallet interaction';

        if (errorMessage && isCriticalError(errorMessage)) {
            message.error(`An error occurred: ${errorMessage}`);
        }
    };

    const isCriticalError = (errorMessage: string) => {
        return errorMessage !== 'Unknown error occurred during wallet interaction';
    };

    return (
        <>
            <Button
                style={{
                    backgroundColor: selectedAccount ? '#26DB8E' : '#0E9DE5',
                    marginBottom: '1rem',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
                onClick={handleWalletConnectOpen}
            >
              <span style={{ fontWeight: 'bold' }}>
                {selectedAccount ? `Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'Connect Wallet'}
              </span>
            </Button>



            {isWalletSelectOpen && (
                // @ts-ignore
                <WalletSelect
                    dappName="zkVerify"
                    open={isWalletSelectOpen}
                    onWalletConnectOpen={handleWalletConnectOpen}
                    onWalletConnectClose={handleWalletConnectClose}
                    onWalletSelected={handleWalletSelected}
                    onUpdatedAccounts={handleUpdatedAccounts}
                    onAccountSelected={handleAccountSelected}
                    onError={handleError}
                    showAccountsList={true}
                />
            )}
        </>
    );
});

export default ConnectWalletButton;
