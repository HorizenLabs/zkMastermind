import {
  Button,
  Container,
  Stack,
  Heading,
  ButtonGroup,
  Tabs,
  TabList,
  TabPanel,
  Tab,
  TabPanels,
} from "@chakra-ui/react";
import { NextSeo } from "next-seo";
import About from "../components/About";
import Game from "../components/Game";
import Rules from "../components/Rules";

export default function Mastermind() {
  return (
    <>
      <NextSeo
        title="zkMastermind x zkVerify"
        description="An on-chain code-breaker game built with zero-knowledge proofs with verification by zkVerify"
        openGraph={{
          url: "https://zkmastermind.zkverify.io",
          title: "zkMastermind x zkVerify",
          description:
            "An on-chain code-breaker game built with zero-knowledge proofs with verification by zkVerify",
          images: [
            {
              url: "https://zk-mastermind.vercel.app/mastermind.png",
              width: 800,
              height: 600,
              alt: "zkMastermind",
              type: "image/png",
            },
          ],
        }}
      />
      <Stack align="center" py="40px" minHeight="100vh" position="relative">
        <Container height="100%" alignItems="space-between">
          <Stack align="center" spacing={5}>
            <Heading size="xl" color="white">
              zkMastermind x zkVerify
            </Heading>

            <Tabs
              variant="unstyled"
              colorScheme="green"
              width="100%"
              align="center"
            >
              <ButtonGroup
                as={TabList}
                variant="outline"
                size="sm"
                isAttached
                bg="white"
                borderRadius="md"
              >
                <Tab as={Button} _selected={{ bg: "gray.100" }}>
                  Play
                </Tab>
                <Tab as={Button} _selected={{ bg: "gray.100" }}>
                  Rules
                </Tab>
                <Tab as={Button} _selected={{ bg: "gray.100" }}>
                  About
                </Tab>
              </ButtonGroup>
              <TabPanels>
                <TabPanel pt="24px">
                  <Game />
                </TabPanel>
                <TabPanel pt="24px">
                  <Rules />
                </TabPanel>
                <TabPanel pt="24px">
                  <About />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </Container>
      </Stack>
    </>
  );
}
