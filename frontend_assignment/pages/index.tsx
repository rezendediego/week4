import detectEthereumProvider from "@metamask/detect-provider"
import { Strategy, ZkIdentity } from "@zk-kit/identity"
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols"
import { Contract, providers, utils } from "ethers"
import Head from "next/head"
import React, {useEffect} from "react"
import styles from "../styles/Home.module.css"
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Greeter from "artifacts/contracts/Greeters.sol/Greeters.json"
import SignIn from "./components/SignIn"



export default function Home() {
    //Logs and St Logs state in relation with the contract comunication
    const [logs, setLogs] = React.useState("Connect your wallet and greet!")
    
    // Greet function that will make the comunication qith the contract Greeter
    async function greet() {
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        const signer = ethersProvider.getSigner()
        const message = await signer.signMessage("Sign this message to create your identity!")

        const identity = new ZkIdentity(Strategy.MESSAGE, message)
        const identityCommitment = identity.genIdentityCommitment()
        const identityCommitments = await (await fetch("./identityCommitments.json")).json()

        const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, identityCommitment)

        setLogs("Creating your Semaphore proof...")

        const greeting = "Hello world"

        const witness = Semaphore.genWitness(
            identity.getTrapdoor(),
            identity.getNullifier(),
            merkleProof,
            merkleProof.root,
            greeting
        )

        const { proof, publicSignals } = await Semaphore.genProof(witness, "./semaphore.wasm", "./semaphore_final.zkey")
        const solidityProof = Semaphore.packToSolidityProof(proof)

        const response = await fetch("/api/greet", {
            method: "POST",
            body: JSON.stringify({
                greeting,
                nullifierHash: publicSignals.nullifierHash,
                solidityProof: solidityProof
            })
        })

        if (response.status === 500) {
            const errorMessage = await response.text()

            setLogs(errorMessage)
        } else {
            setLogs("Your anonymous greeting is onchain :)")
        }
    }
    

    
    //Listening NewGreeting event being emitted from Greeters contract
    const [getGreeting, setGreeting] = React.useState("")
    async function listenEvent() {
        const provider = new providers.JsonRpcProvider("http://localhost:8545")
        const semaphoreContract = new Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", Greeter.abi, provider)
        const contractOwner = semaphoreContract.connect(provider.getSigner())
        contractOwner.on("NewGreeting", (greeting) => {
                setGreeting(utils.parseBytes32String(greeting));
        });
    }
    useEffect(() => {listenEvent();}, [])

     
    
    return (
        <div className={styles.container}>
        
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                
                {/*Header*/} 
                <Head>
                    <title>Greetings</title>
                    <meta name="description" content="A simple Next.js/Hardhat privacy application with Semaphore." />
                    <link rel="icon" href="/favicon.ico" />
                </Head>

            
            
                {/*Left side wich has the Connect Button & Greet and Box Listener */} 
            
                <Grid container item xs={6} >
                    
                    <h1 className={styles.title}>Greetings</h1>
               
                    <p className={styles.description}>A simple Next.js/Hardhat privacy application with Semaphore.</p>
                    
                    {/*Text Box Listening NewGreeting event*/}
                    <div className={styles.boxListener}>
                        <Box component="span" sx={{ p: 10, border: '1px dashed grey' }}>
                            {getGreeting}
                        </Box> 
                    </div> 
                                      
                    
                    <Grid container item direction="column" justifyContent="center"  alignItems="center"  xs={8}>
                        
                        <div className={styles.logs}>{logs}</div>
                        <div onClick={() => greet()} className={styles.button}>
                            Greet
                        </div>
                        
                    </Grid>           
                </Grid>



                {/*Right side wich has the form SignIn.tsx imported from components/SignIn.tsx and embedded as <SignIn /> */}     
                <Grid container item direction="column" justifyContent="center"  alignItems="stretch" xs={6}>
                    <div className={styles.yellowPaper}>
                        <Paper elevation={8}>
                             <SignIn />
                        </Paper>
                    </div>
                </Grid>
                  
            
            </Grid>               
        </div>
    ) 
}

