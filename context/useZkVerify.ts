import { useState } from 'react';

export function useZkVerify(selectedAccount: string | null) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const onVerifyProof = async (proof: string, publicSignals: string[], vk: any): Promise<{ verified: boolean; cancelled: boolean; error?: string }> => {
    setVerifying(true);
    setVerified(false);
    setError(null);
    setCancelled(false);

    let localCancelled = false;

    try {
      if (typeof window === 'undefined') {
        throw new Error('This operation can only be performed in the browser.');
      }

      if (!proof || !publicSignals || !vk) {
        throw new Error('Proof, public signals, or verification key is missing');
      }

      const proofData = JSON.parse(proof);

      let zkVerifySession;
      try {
        zkVerifySession = (await import('zkverifyjs')).zkVerifySession;
      } catch (error: unknown) {
        throw new Error(`Failed to load zkVerifySession: ${(error as Error).message}`);
      }

      let session;
      try {
        session = await zkVerifySession.start().Testnet().withWallet();
      } catch (error: unknown) {
        if ((error as Error).message.includes('User rejected the transaction')) {
          localCancelled = true;
          setCancelled(true);
          return { verified: false, cancelled: true };
        }
        throw new Error(`Connection failed: ${(error as Error).message}`);
      }

      const { events, transactionResult } = await session.verify().groth16().execute(proofData, publicSignals, vk);

      events.on('ErrorEvent', (eventData) => {
        console.error('ErrorEvent:', JSON.stringify(eventData));
      });

      let transactionInfo = null;
      try {
        transactionInfo = await transactionResult;
      } catch (error: unknown) {
        if ((error as Error).message.includes('Rejected by user')) {
          localCancelled = true;
          setCancelled(true);
          return { verified: false, cancelled: true };
        }
        throw new Error(`Transaction failed: ${(error as Error).message}`);
      }

      if (transactionInfo && transactionInfo.attestationId) {
        setVerified(true);
        return { verified: true, cancelled: false };
      } else {
        throw new Error("Your proof isn't correct.");
      }
    } catch (error: unknown) {
      if (!localCancelled) {
        const errorMessage = (error as Error).message;
        setError(errorMessage);
        return { verified: false, cancelled: false, error: errorMessage };
      }
      return { verified: false, cancelled: true };
    } finally {
      setVerifying(false);
    }
  };

  return { onVerifyProof, verifying, verified, error, cancelled };
}
