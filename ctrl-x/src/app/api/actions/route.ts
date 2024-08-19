// THIS IS WHERE OUR SOLANA ACTIONS FOR BLINKS WILL GO

import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  MEMO_PROGRAM_ID,
} from "@solana/actions";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { create } from "domain";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const data = { message: "This is a GET response" };
  const payload: ActionGetResponse = {
    icon: new URL("/", new URL(req.url).origin).toString(),
    label: "Send Memo",
    description: "Send a memo to the Solana network",
    title: "Send Memo",
  };
  return NextResponse.json(payload, {
    // The line headers: ACTIONS_CORS_HEADERS is used to include CORS headers in the response, allowing cross-origin requests from other domains, because blinks are embedded everywhere, so the requests can be fired from anyhwere
    headers: ACTIONS_CORS_HEADERS,
  });
};

// The OPTIONS HTTP method is used to describe the communication options for the target resource. This is often used in the context of CORS (Cross-Origin Resource Sharing) preflight requests. Browsers send an OPTIONS request before certain types of HTTP requests (like POST, PUT, or DELETE) to determine if the actual request is safe to send.
// Since OPTIONS requests usually don't need complex logic and are just about responding with proper headers, reusing the GET handler can simplify the code.
// If the GET handler is already handling the necessary CORS headers, using it for OPTIONS ensures that preflight requests get those headers without duplicating code.
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  const body: ActionPostRequest = await req.json();

  let account: PublicKey;
  try {
    account = new PublicKey(body.account);
  } catch (error) {
    return NextResponse.json("Invalid account provided", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  // Process the POST data here (e.g., save to database)
  // For example, assume we're just returning the received data
  const response = { receivedData: body };

  try {
    const transaction = new Transaction();
    transaction.add(
      // createPostResponse required at least 1 non-memo instruction
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),

      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("this is a message", "utf8"),
        keys: [],
      })
    );

    transaction.feePayer = account;

    const connection = new Connection("https://api.devnet.solana.com");
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: { transaction },
    });

    return NextResponse.json(payload, {
      status: 201,
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An unknown error occured" },
      { status: 400 }
    );
  }
};
