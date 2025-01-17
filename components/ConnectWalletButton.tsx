import dynamic from 'next/dynamic';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button, useToast } from '@chakra-ui/react';
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
    const [selectedWalletSource, setSelectedWalletSource] = useState<string | null>(null);

    const toast = useToast();

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
        setSelectedWalletSource(wallet.source);
    };

    const handleUpdatedAccounts = (accounts: any[] | undefined) => {
        console.log('Updated accounts:', accounts);
        if (accounts && accounts.length > 0) {
            setSelectedAccount(accounts[0].address);
        } else {
            setSelectedAccount(null);
            toast({
                title: 'Error',
                description: 'No accounts available.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleAccountSelected = (account: any) => {
        console.log('Account selected:', account);
        setSelectedAccount(account.address);
        toast({
            title: 'Account Connected',
            description: `Connected account: ${account.address}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        });

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
            toast({
                title: 'Error',
                description: `An error occurred: ${errorMessage}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const isCriticalError = (errorMessage: string) => {
        return errorMessage !== 'Unknown error occurred during wallet interaction';
    };

    return (
        <>
            <Button
                bg={selectedAccount ? '#26DB8E' : '#0E9DE5'}
                color="white"
                mb="1rem"
                px="20px"
                py="10px"
                borderRadius="5px"
                onClick={handleWalletConnectOpen}
            >
                {selectedAccount ? `Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'Connect Wallet'}
            </Button>

            {isWalletSelectOpen && (
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

ConnectWalletButton.displayName = 'ConnectWalletButton';

export default ConnectWalletButton;
