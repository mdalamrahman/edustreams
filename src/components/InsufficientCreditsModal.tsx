import React from 'react';
import { AlertCircle, CreditCard, Sparkles, X } from 'lucide-react';
import { getUserWallet } from '../lib/billing';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
  requiredCost?: number;
  actionName?: string;
  userEmail?: string;
}

export const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({
  isOpen,
  onClose,
  onOpenRecharge,
  requiredCost = 1.0,
  actionName = 'this feature',
  userEmail
}) => {
  if (!isOpen) return null;

  const wallet = getUserWallet(userEmail);

  return (
    <div className="fixed inset-0 z-[110000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-center relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-3xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-100">
            Sorry, you have run out of credits!
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Kindly recharge your wallet to use <span className="text-slate-200 font-bold">{actionName}</span>.
          </p>
        </div>

        {/* Cost vs Balance Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="text-left">
            <span className="text-[11px] text-slate-500 block">Required Cost</span>
            <span className="text-sm font-bold text-rose-400">₹{requiredCost.toFixed(2)}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Current Balance</span>
            <span className="text-sm font-bold text-slate-300">₹{wallet.balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Recharge Wallet (Instant UPI QR)</span>
          </button>
          
          <button
            onClick={onClose}
            className="py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
