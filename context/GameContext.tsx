import { useToast } from "@chakra-ui/react";
import { useContract } from "@thirdweb-dev/react";
import { useZkVerify } from "./useZkVerify";
import React from "react";
import vkey from "../VerificationKey.json";

export const COLORS: Record<number, Record<string, string>> = {
  0: {
    name: "red",
    body: "red.400",
    border: "red.500",
  },
  1: {
    name: "orange",
    body: "orange.400",
    border: "orange.500",
  },
  2: {
    name: "yellow",
    body: "yellow.400",
    border: "yellow.500",
  },
  3: {
    name: "green",
    body: "green.400",
    border: "green.500",
  },
  4: {
    name: "cyan",
    body: "cyan.400",
    border: "cyan.500",
  },
  5: {
    name: "blue",
    body: "blue.400",
    border: "blue.500",
  },
  6: {
    name: "purple",
    body: "purple.400",
    border: "purple.500",
  },
  7: {
    name: "pink",
    body: "pink.400",
    border: "pink.500",
  },
  8: {
    name: "empty",
    body: "#111",
    border: "#333",
  },
};

type GameAction =
  | {
      type: "CHOOSE_COLOR";
      payload: {
        color: number;
      };
    }
  | {
      type: "EDIT_ROW";
      payload: {
        row: number;
        index: number;
        value: number;
      };
    }
  | {
      type: "SUBMIT_ROW";
      payload: {
        row: number;
        proof: ZKProof;
      };
    }
  | {
      type: "VERIFY_ROW";
      payload: {
        row: number;
        valid: boolean;
      };
    }
  | {
      type: "ADD_LOG";
      payload: Log;
    }
  | {
      type: "SET_LOADING";
      payload: {
        row: number;
        loading: boolean;
      };
    }
  | {
      type: "NEW_GAME";
    };

type ZKProof = {
  proof: {
    pi_a: string[3];
    pi_b: string[3][2];
    pi_c: string[3];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  calldata: [string[2], string[2][2], string[2], string[8]];
};

type Row = {
  guess: number[];
  partial: number;
  correct: number;
  isSubmitted: boolean;
  isVerified: boolean;
  isValid: boolean;
  isLoading: boolean;
  proof?: ZKProof;
};

type Log = {
  title: string;
  body?: string;
};

type Game = {
  id: number;
  board: Row[];
  focusedRow: number;
  color: number;
  solved: boolean;
  logs: Log[];
};

type GameContextValue = {
  game: Game;
  dispatch: React.Dispatch<GameAction>;
  submit: (row: number) => void;
  verify: (row: number) => void;
};

const DEFAULT_GAME = {
  board: Array.from(Array(10).keys()).map(() => ({
    guess: [8, 8, 8, 8],
    partial: 0,
    correct: 0,
    isSubmitted: false,
    isVerified: false,
    isValid: false,
    isLoading: false,
    proof: undefined,
  })),
  color: 0,
  solved: false,
  logs: [],
  focusedRow: -1,
  id: Math.random(),
};
const GameContext = React.createContext<GameContextValue>(
  {} as GameContextValue
);

export function useGame() {
  return React.useContext(GameContext);
}

const gameReducer = (state: Game, action: GameAction) => {
  const updatedState: Game = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case "CHOOSE_COLOR":
      updatedState.color = action.payload.color;
      return updatedState;
    case "EDIT_ROW":
      updatedState.board[action.payload.row].guess[action.payload.index] =
        state.color;
      return updatedState;
    case "SUBMIT_ROW":
      updatedState.board[action.payload.row].partial = parseInt(
        action.payload.proof.publicSignals[5]
      );
      updatedState.board[action.payload.row].correct = parseInt(
        action.payload.proof.publicSignals[6]
      );
      updatedState.board[action.payload.row].proof = action.payload.proof;
      updatedState.board[action.payload.row].isSubmitted = true;
      if (updatedState.board[action.payload.row].correct === 4) {
        updatedState.solved = true;
      }
      updatedState.focusedRow = -1;
      return updatedState;
    case "VERIFY_ROW":
      updatedState.board[action.payload.row].isVerified = true;
      updatedState.board[action.payload.row].isValid = action.payload.valid;
      updatedState.focusedRow = action.payload.row;
      return updatedState;
    case "ADD_LOG":
      updatedState.logs.push(action.payload);
      return updatedState;
    case "SET_LOADING":
      updatedState.board[action.payload.row].isLoading = action.payload.loading;
      return updatedState;
    case "NEW_GAME":
      const game: Game = JSON.parse(JSON.stringify(DEFAULT_GAME));
      game.id = Math.random();
      game.focusedRow = -1;
      return game;
  }
};

const GameProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const toast = useToast();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_VERIFYING_CONTRACT_ADDRESS
  );
  const [game, dispatch] = React.useReducer(
    gameReducer,
    JSON.parse(JSON.stringify(DEFAULT_GAME))
  );
  const { verifying, verified, error, onVerifyProof } = useZkVerify(null);

  React.useEffect(() => {
    if (game.solved) {
      toast({
        title: "Congratulations, you broke the code!",
        status: "success",
      });
    }
  }, [game.solved, toast]);

  async function submit(row: number) {
    const guessText = game.board[row].guess
      .map((color: number) => COLORS[color].name)
      .join(", ");
    dispatch({
      type: "ADD_LOG",
      payload: {
        title: `Sending guess ${
          row + 1
        } [${guessText}] to be checked by the code maker`,
      },
    });

    dispatch({
      type: "SET_LOADING",
      payload: {
        row,
        loading: true,
      },
    });

    const guess = game.board[row].guess;
    const res = await fetch("/api/proof", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ guess, id: game.id }),
    });

    const data = await res.json();
    dispatch({
      type: "SUBMIT_ROW",
      payload: { row, proof: data },
    });

    dispatch({
      type: "SET_LOADING",
      payload: {
        row,
        loading: false,
      },
    });

    dispatch({
      type: "ADD_LOG",
      payload: {
        title: `Received zkSNARK proof from the code maker that guess ${
          row + 1
        } has ${data.publicSignals[6]} exact and ${
          data.publicSignals[5]
        } partial`,
        body: `${JSON.stringify(data.proof)}`,
      },
    });
  }

  async function verify(row: number) {
    const proof = game.board[row].proof;
    const guessText = game.board[row].guess
      .map((color: number) => COLORS[color].name)
      .join(", ");

    dispatch({
      type: "ADD_LOG",
      payload: {
        title: `Verifying proof of guess ${
          row + 1
        } [${guessText}] on-chain with function 'verifyProof' on smart contract ${
          process.env.NEXT_PUBLIC_VERIFYING_CONTRACT_ADDRESS
        }`,
      },
    });

    dispatch({
      type: "SET_LOADING",
      payload: {
        row,
        loading: true,
      },
    });

    const transactionInfo = await onVerifyProof(
      JSON.stringify(proof.proof),
      proof.publicSignals,
      vkey
    );
    console.log(verified);

    const isValid = await contract?.call("verifyProof", ...proof?.calldata);

    dispatch({
      type: "VERIFY_ROW",
      payload: {
        row,
        valid: isValid,
      },
    });

    dispatch({
      type: "SET_LOADING",
      payload: {
        row,
        loading: false,
      },
    });

    dispatch({
      type: "ADD_LOG",
      payload: {
        title: isValid
          ? `Proof succesfully verified by contract!`
          : `Contract rejected, proof is invalid!`,
      },
    });
  }

  return (
    <GameContext.Provider value={{ game, dispatch, submit, verify }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
