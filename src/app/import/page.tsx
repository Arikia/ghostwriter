"use client";

import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction } from "@solana/web3.js";
import { Button } from "@/components/ui/Button";
import { CheckTable } from "@/components/ui/CheckTable";
import { Upload } from "@/components/ui/Upload";

import style from "./page.module.css";
import { ConnectWallet } from "@/components/ui/ConnectWallet";

type ExportExtract = {
  name: string;
  email: string;
  posts: {
    title: string;
    text: string;
    html: string;
    published_at: string;
  }[];
};

const steps = {
  0: "Connect Wallet",
  1: "Upload",
  2: "Confirm",
  3: "Mint",
};

const Page = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { connected, wallet, publicKey, sendTransaction } = useWallet();
  const [jsonData, setJsonData] = useState<ExportExtract | null>(null);

  const [fileName, setFileName] = useState<string>("No file selected");
  const [isCreatingMint, setIsCreatingMint] = useState<boolean>(false);
  const userWalletAddress = publicKey ? publicKey.toBase58() : null;

  const shortenedData = useMemo(() => {
    if (!jsonData) return null;

    const { name, email, posts } = jsonData;
    return {
      name,
      email,
      posts: posts.map((post) => ({
        title: post.title,
        text: post.text.slice(0, 40).concat("..."),
        published_at: post.published_at,
      })),
    };
  }, [jsonData]);

  const goToNextStep = useCallback(() => {
    if (currentStep < Object.keys(steps).length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  // up to the Checklist step, we want user to be able to go back
  const canGoBack = currentStep > 0 && currentStep <= 2 && !isCreatingMint;

  const resetUpload = () => {
    setJsonData(null);
    setFileName("No file selected");
  };

  const goToPreviousStep = useCallback(() => {
    currentStep === 2 && resetUpload();
    setCurrentStep(currentStep - 1);
  }, [currentStep, resetUpload]);

  const handleMint = async () => {
    setIsCreatingMint(true);
    // if (!jsonData) return;

    // const data = JSON.stringify(jsonData);

    // try {
    //   console.log("Minting NFT with data:", data);
    //   setIsCreatingMint(true);

    //   // Call the API to mint the NFT
    //   const response = await fetch("/api/mint-nft", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       author: jsonData.name,
    //       title: jsonData.posts[0].title,
    //       text: jsonData.posts[0].text,
    //       published_at: jsonData.posts[0].published_at,
    //       published_where: "ghost",
    //       user_wallet: userWalletAddress,
    //     }),
    //   });

    //   const { transaction, recentBlockhash } = await response.json();

    //   // Re-create the transaction object from the returned data
    //   const connection = new Connection("https://api.devnet.solana.com");
    //   const tx = Transaction.from(Buffer.from(transaction, "base64"));

    //   // TODO: aha fee payer can just be set on FE! remove it from BE and do it here
    //   // if (!tx.feePayer) {
    //   //   tx.feePayer = publicKey;
    //   // }

    //   // Add the recent blockhash
    //   tx.recentBlockhash = recentBlockhash;

    //   const { value } = await connection.simulateTransaction(tx);

    //   console.log("Simulation Result:", value);

    //   // Ask the wallet to sign the transaction
    //   const signedTransaction = await sendTransaction(tx, connection);

    //   // Confirm the transaction on the Solana network
    //   const confirmation = await connection.confirmTransaction(
    //     signedTransaction
    //   );

    //   // Display the transaction signature
    //   // setTransactionSignature(signedTransaction);

    //   alert(`Transaction sent! Signature: ${signedTransaction}`);
    // } catch (e) {
    //   console.error("Error minting NFT:", e);
    // } finally {
    //   setIsCreatingMint(false);
    // }
  };

  const handleSetJsonData = (data: ExportExtract) => {
    setJsonData(data);
    goToNextStep();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* @ts-ignore */}
      <div>{steps[currentStep]}</div>

      <div className={style.stepsContainer}>
        {Object.keys(steps).map((step, index) => (
          <div key={index} className={style.stepWrapper}>
            <div
              className={classNames(style.stepCircle, {
                [style.active]: index <= currentStep,
              })}
            >
              {index + 1}
            </div>
            {index < Object.keys(steps).length - 1 && (
              <div
                className={classNames(style.stepLine, {
                  [style.filled]: index <= currentStep,
                })}
              ></div>
            )}
          </div>
        ))}
      </div>
      <Button disabled={!canGoBack} onClick={goToPreviousStep}>
        Go Back
      </Button>

      {currentStep === 0 && (
        <div>
          <ConnectWallet />
          <Button disabled={!wallet || !connected} onClick={goToNextStep}>
            Continue with this wallet
          </Button>
        </div>
      )}
      {currentStep === 1 && (
        <Upload
          setFileName={setFileName}
          handleDoneUploading={handleSetJsonData}
        />
      )}
      {currentStep === 2 && (
        <div>
          <span>Export: {fileName}</span>
          <br />
          <span>Name: {shortenedData?.name}</span>
          <br />
          <span>E-Mail: {shortenedData?.email}</span>
          <CheckTable
            disabled={isCreatingMint}
            data={
              shortenedData
                ? shortenedData.posts.map((post, index) => ({
                    id: index,
                    title: post.title,
                    published_at: post.published_at,
                    text: post.text,
                  }))
                : []
            }
          />
          <Button
            onClick={handleMint}
            loading={isCreatingMint}
            disabled={isCreatingMint}
          >
            Mint
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
