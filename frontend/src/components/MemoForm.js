import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendMemo } from '../utils/sendMemo';

const MemoForm = ({ onMemoSubmit }) => {
  const [memoText, setMemoText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { publicKey, signTransaction } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memoText.trim()) return;

    setIsSubmitting(true);
    try {
      const signature = await sendMemo(memoText, publicKey, signTransaction);
      const newMemo = {
        id: Date.now(),
        text: memoText,
        timestamp: new Date().toISOString(),
        signature,
      };
      onMemoSubmit(newMemo);
      setMemoText('');
    } catch (error) {
      console.error('Error sending memo:', error);
      alert(`Failed to send memo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2 text-blue-700">📝 Create a New Memo</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          maxLength={500}
          disabled={isSubmitting}
          required
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
        />
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{memoText.length}/500 characters</span>
          <button
            type="submit"
            disabled={isSubmitting || !memoText.trim()}
            className={`px-4 py-2 rounded-lg text-white transition-all ${
              isSubmitting || !memoText.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Memo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemoForm;
