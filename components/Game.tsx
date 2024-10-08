import {
    Stack,
    HStack,
    Box,
    Grid,
    GridItem,
    Button,
    Flex,
    Text,
    Icon,
    Tooltip,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
} from "@chakra-ui/react";
import { useGame, COLORS } from "../context/GameContext";
import { FaTimes } from "react-icons/fa";
import { BsShieldCheck } from "react-icons/bs";
import { useAccount } from "../context/AccountContext";
import React, { useRef } from "react";
import ConnectWalletButton, { ConnectWalletButtonHandle } from "./ConnectWalletButton";

const Game: React.FC = () => {
    const { game, dispatch, submit, verify, verifying, error } = useGame();
    const { selectedAccount } = useAccount();
    const walletModalRef = useRef<ConnectWalletButtonHandle>(null);

    const currentRow = game.board.map((row) => row.isSubmitted).indexOf(false);

    const onWalletConnected = (rowIndex: number) => {
        verify(rowIndex);
    };

    const handleVerify = (rowIndex: number) => {
        if (!selectedAccount) {
            walletModalRef.current?.setZkVerifyTriggered(rowIndex);
            walletModalRef.current?.openWalletModal();
        } else {
            verify(rowIndex);
        }
    };

    return (
        <Stack align="center" position="relative">

            <ConnectWalletButton ref={walletModalRef} onWalletConnected={onWalletConnected} />

            <Flex direction={{ base: "column", lg: "row" }}>
                <Flex direction="row">
                    <Flex direction="column" bg="black" border="1px solid #222" gap="20px" padding="10px">
                        {Array.from(Array(8).keys()).map((color) => (
                            <Box
                                key={color}
                                borderRadius="full"
                                h="40px"
                                w="40px"
                                bg={COLORS[color].body}
                                cursor="pointer"
                                _hover={{ opacity: 0.8 }}
                                border={game.color === color ? "2px solid white" : "none"}
                                onClick={() => dispatch({ type: "CHOOSE_COLOR", payload: { color } })}
                            />
                        ))}
                    </Flex>

                    <Flex direction="column" bg="black" border="1px solid #222" marginX="-1px">
                        <Flex justify="space-between" marginX="20px" marginY="12px" align="center">
                            <Text fontSize="24px" alignSelf="flex-start">
                                G A M E
                            </Text>
                            {(game.solved || game.board[9].isSubmitted) && (
                                <Button size="sm" colorScheme="blue" onClick={() => dispatch({ type: "NEW_GAME" })}>
                                    New Game
                                </Button>
                            )}
                        </Flex>
                        {game.board.map((row, rowIndex) => (
                            <HStack key={rowIndex} spacing={0} borderY="1px solid #222" marginBottom="-1px">
                                <Flex height="60px" paddingX="10px" gap="20px" align="center">
                                    <Flex width="10px">
                                        <Text color="#444">{rowIndex + 1}</Text>
                                    </Flex>
                                    {row.guess.map((color, valIndex) => (
                                        <Box
                                            key={valIndex}
                                            borderRadius="full"
                                            h="40px"
                                            w="40px"
                                            border="1px solid"
                                            borderColor={COLORS[color].border}
                                            bg={COLORS[color].body}
                                            cursor={rowIndex === currentRow && !game.solved ? "pointer" : undefined}
                                            _hover={rowIndex === currentRow && !game.solved ? { opacity: 0.8 } : undefined}
                                            onClick={
                                                rowIndex === currentRow && !game.solved
                                                    ? () =>
                                                        dispatch({
                                                            type: "EDIT_ROW",
                                                            payload: {
                                                                row: rowIndex,
                                                                index: valIndex,
                                                                value: game.color,
                                                            },
                                                        })
                                                    : undefined
                                            }
                                        />
                                    ))}
                                </Flex>
                                <Flex flexGrow={1} height="60px" gap="16px" align="center" paddingX="10px" borderLeft="1px solid #222">
                                    <Grid gridTemplateColumns="1fr 1fr" gridTemplateRows="1fr 1fr" gap="8px" borderRadius="md">
                                        {Array.from(Array(4).keys()).map((index) => (
                                            <GridItem
                                                key={index}
                                                bg={
                                                    row.correct > index
                                                        ? "red.400"
                                                        : row.correct + row.partial > index
                                                            ? "white"
                                                            : "#111"
                                                }
                                                border="1px solid #333"
                                                w="16px"
                                                h="16px"
                                                borderRadius="full"
                                            />
                                        ))}
                                    </Grid>
                                    {!game.solved && currentRow === rowIndex && (
                                        <Button size="xs" width="64px" isDisabled={row.guess.includes(8)} onClick={() => submit(rowIndex)} isLoading={row.isLoading}>
                                            Check
                                        </Button>
                                    )}
                                    {row.isSubmitted && !row.isVerified && (
                                        <Button
                                            size="xs"
                                            width="64px"
                                            onClick={() => handleVerify(rowIndex)}
                                            isLoading={row.isLoading || verifying}
                                            isDisabled={verifying}
                                        >
                                            zkVerify
                                        </Button>
                                    )}
                                    {row.isVerified && !!row.isValid && (
                                        <Flex flexGrow={1} justify="center" gap={2} minWidth="64px">
                                            <Tooltip label="The code maker's proof for this row has been verified by zkVerify" fontSize="xs" hasArrow>
                                                <Flex>
                                                    <Icon as={BsShieldCheck} color="#666" boxSize={6} />
                                                </Flex>
                                            </Tooltip>
                                        </Flex>
                                    )}
                                    {row.isVerified && !row.isValid && error !== null && (
                                        <Flex flexGrow={1} justify="center" gap={2} minWidth="64px">
                                            <Tooltip label="The code maker has sent an invalid proof for this row" fontSize="xs" hasArrow>
                                                <Flex>
                                                    <Icon as={FaTimes} color="red.400" boxSize={5} />
                                                </Flex>
                                            </Tooltip>
                                        </Flex>
                                    )}
                                </Flex>
                            </HStack>
                        ))}
                    </Flex>
                </Flex>

                {/* Logs Section */}
                <Flex direction="column" bg="black" border="1px solid #222">
                    <Text fontSize="24px" marginX="20px" marginY="12px" alignSelf="flex-start">
                        L O G S
                    </Text>

                    <Stack
                        width={{ base: "430px", lg: "md" }}
                        border="1px solid #333"
                        bg="#111"
                        padding="10px"
                        margin="20px"
                        marginTop="0px"
                        borderRadius="xl"
                        align="flex-start"
                        overflow="scroll"
                        maxHeight="590px"
                        height="100%"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {game.logs.map((log, logIndex) => (
                            <Box as={Accordion} key={logIndex} allowToggle>
                                <AccordionItem border="none">
                                    {({ isExpanded }) => (
                                        <>
                                            <Text
                                                as={AccordionButton}
                                                padding={0}
                                                fontSize="12px"
                                                textAlign="left"
                                                wordBreak="break-word"
                                                whiteSpace="pre-line"
                                                color={logIndex % 2 === 0 ? "white" : "#888"}
                                                cursor={log.body ? "pointer" : "default"}
                                                _hover={log.body ? { opacity: 0.8 } : {}}
                                            >
                                                &gt; {log.title}{" "}
                                                {log.body && (!isExpanded ? "(click to view)" : "(click to hide)")}
                                            </Text>

                                            {log.body && (
                                                <Box as={AccordionPanel} bg="#222" mt="6px" padding="6px" borderRadius="6px">
                                                    <Text fontSize="12px" textAlign="left" wordBreak="break-all" color={logIndex % 2 === 0 ? "white" : "#888"}>
                                                        {log.body}
                                                    </Text>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </AccordionItem>
                            </Box>
                        ))}
                    </Stack>
                </Flex>
            </Flex>

            {/* Proof Section */}
            <Flex direction="row">
                <Flex direction="column">
                    <Text fontSize="24px" marginX="20px" marginY="12px" alignSelf="flex-start">
                        Proof
                    </Text>
                    <Stack
                        width={{ base: "900px" }}
                        border="1px solid #333"
                        bg="#111"
                        padding="10px"
                        margin="20px"
                        marginTop="0px"
                        align="flex-start"
                        overflow="scroll"
                        maxHeight="200px"
                        height="100%"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        <Text>
                            {game.focusedRow >= 0
                                ? `${JSON.stringify(game.board[game.focusedRow]?.proof?.proof ?? "")}`
                                : ""}
                        </Text>
                    </Stack>
                </Flex>
            </Flex>

            {/* Public Signals Section */}
            <Flex direction="row">
                <Flex direction="column" border="1px solid #222">
                    <Text fontSize="24px" marginX="20px" marginY="12px" alignSelf="flex-start">
                        Public Signals
                    </Text>
                    <Stack
                        width={{ base: "900px" }}
                        border="1px solid #333"
                        bg="#111"
                        padding="10px"
                        margin="20px"
                        marginTop="0px"
                        align="flex-start"
                        overflow="scroll"
                        maxHeight="200px"
                        height="100%"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        <Text>
                            {game.focusedRow >= 0
                                ? `${JSON.stringify(game.board[game.focusedRow]?.proof?.publicSignals ?? [])}`
                                : ""}
                        </Text>
                    </Stack>
                </Flex>
            </Flex>
        </Stack>
    );
};

export default Game;
