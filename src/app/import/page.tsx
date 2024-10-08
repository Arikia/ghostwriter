"use client";

import React, { useCallback, useMemo, useState } from "react";
import Confetti from "react-confetti";
import Link from "next/link";
import classNames from "classnames";

import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/Button";
import { CheckTable } from "@/components/layout/CheckTable/CheckTable";
import { Upload } from "@/components/layout/Upload/Upload";

import style from "./page.module.css";
import { ConnectWallet } from "@/components/ui/ConnectWallet";
import { NFTCard } from "@/components/layout/NFTCard/NFTCard";
import { CheckboxWithTerms } from "@/components/ui/Checkbox/Checkbox";

type ExportExtract = {
  name: string;
  email: string;
  posts: {
    id: string;
    title: string;
    text: string;
    published_at: string;
    published_where: string;
  }[];
};

type MintedNFT = {
  title: string;
  image: string;
  mint: string;
  explorer_link: string;
};

const steps = {
  0: "Connect Wallet",
  1: "Upload",
  2: "Mint",
  3: "Results",
};

/* TODO:
- error handling for when no posts can be processed while uploading
*/

const Page = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { connected, wallet, publicKey, sendTransaction } = useWallet();
  const [jsonData, setJsonData] = useState<ExportExtract | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([]);

  const [fileName, setFileName] = useState<string>("No file selected");
  const [isCreatingMint, setIsCreatingMint] = useState<boolean>(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const userWalletAddress = publicKey ? publicKey.toBase58() : null;

  const shortenedData = useMemo(() => {
    if (!jsonData) return null;

    const { name, email, posts } = jsonData;
    return {
      name,
      email,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        text: post.text.slice(0, 40).concat("..."),
        published_at: post.published_at,
        published_where: "CTRL-X",
        cms: post.published_where,
      })),
    };
  }, [jsonData]);

  // Handler for when a checkbox is clicked
  const handleCheckboxChange = (id: string) => {
    setSelectedPostIds((prevSelectedRows) => {
      if (prevSelectedRows.includes(id)) {
        // Deselect the row
        return prevSelectedRows.filter((rowId) => rowId !== id);
      } else {
        // Select the row
        return [...prevSelectedRows, id];
      }
    });
  };

  // Handler for 'Select All' checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = jsonData?.posts.map((item) => item.id);
      setSelectedPostIds(allIds?.length ? allIds : []);
    } else {
      setSelectedPostIds([]);
    }
  };

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
    if (!jsonData) return;

    const postsToMint = jsonData.posts.filter((post) =>
      selectedPostIds.includes(post.id)
    );

    try {
      setIsCreatingMint(true);
      // Call the API to mint the NFT
      const response = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: jsonData.name,
          user_wallet: userWalletAddress,
          published_where: "CTRL-X",
          posts: postsToMint,
          cms: "Ghost",
        }),
      });

      if (response.ok) {
        const { transactionResults } = await response.json();

        // in the future should be this
        // const nftRes = await fetch(
        //   `https://devnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_RPC_API_KEY}`,
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       jsonrpc: "2.0",
        //       id: process.env.NEXT_PUBLIC_HELIUS_RPC_ID,
        //       method: "getAsset",
        //       params: {
        //         id: nft,
        //       },
        //     }),
        //   }
        // );

        const minted = transactionResults.map(
          (r: { nft: string; txString: string; title: string }) => ({
            title: r.title,
            image:
              "https://devnet.irys.xyz/D6UumRpJTxu5N4zihuwaDxZDsJkBUE8iAp7d8ZD8nf6f",
            mint: r.nft,
            explorer_link: `https://solana.fm/address/${r.nft}/transactions?cluster=devnet-alpha`,
          })
        );

        setMintedNFTs(minted);
        goToNextStep();
      } else {
        console.error("Minting failed");
      }
    } catch (e) {
      console.error("Error minting NFT:", e);
    } finally {
      setIsCreatingMint(false);
    }
  };

  const handleSetJsonData = (data: ExportExtract) => {
    setJsonData(data);
    goToNextStep();
  };

  return (
    <div className={style.root}>
      <div className={style.flow}>
        {/* @ts-ignore */}
        <h2 className={style.flowName}>{steps[currentStep]}</h2>

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
        <div className={style.goBackButtonWrapper}>
          <Button
            disabled={!canGoBack}
            onClick={goToPreviousStep}
            className={style.goBackButton}
          >
            Go Back
          </Button>
        </div>
      </div>
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
                ? shortenedData.posts.map((post) => ({
                    id: post.id,
                    title: post.title,
                    published_at: post.published_at,
                    published_where: "CTRL-X",
                    cms: "Ghost",
                    text: post.text,
                  }))
                : []
            }
            selectedPostIds={selectedPostIds}
            onCheckboxChange={handleCheckboxChange}
            onSelectAll={handleSelectAll}
          />
          <CheckboxWithTerms
            term="By checking this box, you declare that you are the original author and lawful rights holder of this content."
            isChecked={isTermsAccepted}
            onChange={() => {
              setIsTermsAccepted((prevState) => !prevState); // toggle
            }}
          />
          <Button
            onClick={handleMint}
            loading={isCreatingMint}
            disabled={
              isCreatingMint || selectedPostIds.length === 0 || !isTermsAccepted
            }
          >
            Mint
          </Button>
        </div>
      )}
      {currentStep === 3 && (
        <>
          <Confetti width={1800} height={3000} />
          <h3 className={style.successHeader}>
            Freshly minted! 🎉 Continue to Briefcase
          </h3>
          <div className={style.nftCards}>
            {mintedNFTs.map(({ title, image, mint, explorer_link }, index) => (
              <NFTCard
                key={index}
                title={title}
                mint={mint}
                image={image}
                explorer_link={explorer_link}
              />
            ))}
          </div>
          <Link href="/briefcase" passHref>
            <Button>Go to your briefcase</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default Page;
export type { ExportExtract, MintedNFT };
