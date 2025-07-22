import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { MemoProgram } from '@solana/spl-memo';

/**
 * Sends a memo to the Solana blockchain
 * 
 * @param {string} memoText - The text content of the memo
 * @param {PublicKey} walletPublicKey - The public key of the sender's wallet
 * @param {Function} signTransaction - Function to sign the transaction
 * @returns {Promise<string>} - Transaction signature
 */
export const sendMemo = async (memoText, walletPublicKey, signTransaction) => {
  if (!walletPublicKey || !signTransaction) {
    throw new Error('Wallet not connected');
  }

  // Connect to the Solana network (using the default endpoint from the wallet adapter)
  const connection = new Connection(
    process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  );

  // Create a memo instruction
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: walletPublicKey, isSigner: true, isWritable: true }],
    programId: MemoProgram.programId,
    data: Buffer.from(memoText, 'utf-8'),
  });

  // Create a transaction and add the memo instruction
  const transaction = new Transaction().add(instruction);
  
  // Get the recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  // Sign the transaction
  const signedTransaction = await signTransaction(transaction);

  // Send the transaction
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());

  // Wait for confirmation
  await connection.confirmTransaction(signature);

  return signature;
};

/**
 * Fetches memos for a specific wallet
 * 
 * @param {PublicKey} walletPublicKey - The public key of the wallet
 * @param {Connection} connection - Solana connection object
 * @returns {Promise<Array>} - Array of memo objects
 */
export const fetchMemos = async (walletPublicKey, connection) => {
  if (!walletPublicKey || !connection) {
    throw new Error('Wallet not connected or connection not established');
  }

  try {
    // Get signatures for transactions involving the wallet
    const signatures = await connection.getSignaturesForAddress(
      walletPublicKey,
      { limit: 20 } // Limit to the most recent 20 transactions
    );

    // Fetch the transaction details for each signature
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature);
          return tx;
        } catch (error) {
          console.error(`Error fetching transaction ${sig.signature}:`, error);
          return null;
        }
      })
    );

    // Filter for memo transactions and extract the memo data
    const memos = transactions
      .filter(tx => 
        tx && 
        tx.transaction.message.instructions.some(
          instruction => instruction.programId.equals(MemoProgram.programId)
        )
      )
      .map(tx => {
        const memoInstruction = tx.transaction.message.instructions.find(
          instruction => instruction.programId.equals(MemoProgram.programId)
        );
        
        if (!memoInstruction || !memoInstruction.data) {
          return null;
        }

        // Decode the memo data from base64
        const memoText = Buffer.from(memoInstruction.data).toString('utf-8');
        
        return {
          id: tx.transaction.signatures[0],
          text: memoText,
          timestamp: new Date(tx.blockTime * 1000).toISOString(),
          signature: tx.transaction.signatures[0]
        };
      })
      .filter(memo => memo !== null);

    return memos;
  } catch (error) {
    console.error('Error fetching memos:', error);
    throw error;
  }
};