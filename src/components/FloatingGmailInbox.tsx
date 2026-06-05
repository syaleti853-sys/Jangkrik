import React, { useState } from 'react';
import { 
  Mail, Inbox, ShieldAlert, UserCheck, X, ChevronDown, ChevronUp, 
  Copy, Check, MessageSquare, Sparkles, Send, ShieldCheck
} from 'lucide-react';
import type { GmailAccount, GmailMessage } from '../types';

interface FloatingGmailInboxProps {
  activeInboxAccount: GmailAccount | null;
  setActiveInboxAccount: (acc: GmailAccount | null) => void;
  activeMessage: GmailMessage | null;
  setActiveMessage: (msg: GmailMessage | null) => void;
  onIntegrateCampaign: (acc: GmailAccount) => void;
  addGlobalLog: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

export default function FloatingGmailInbox({
  activeInboxAccount,
  setActiveInboxAccount,
  activeMessage,
  setActiveMessage,
  onIntegrateCampaign,
  addGlobalLog
}: FloatingGmailInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!activeInboxAccount) {
    return null;
  }

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    addGlobalLog("success", `[Simulasi] Menyalin ${label} ke clipboard!`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const unreadCount = activeInboxAccount.emails.length;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* FLOATING ACTION TRIGGER BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-indigo-700 hover:from-red-700 hover:to-indigo-800 text-white font-black text-xs px-4.5 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all animate-bounce cursor-pointer border border-white/20 whitespace-nowrap"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Mail className="w-4 h-4 fill-white/10" />
          <span>Buka Gmail Simulator ({unreadCount})</span>
        </button>
      )}

      {/* FLOATING INBOX WIDGET WINDOW */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-fade-in-up">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-red-650 to-indigo-900 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm shrink-0">
                <Mail className="w-4 h-4 font-black" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-red-200 font-extrabold uppercase tracking-wider block font-mono">Gmail Simulator (Melayang)</span>
                <h4 className="text-xs font-black tracking-tight truncate text-white">{activeInboxAccount.name}</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  addGlobalLog("info", "Gmail Inbox Simulator disembunyikan dalam widget melayang di sudut layar.");
                }}
                className="p-1 hover:bg-white/15 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Sembunyikan"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setActiveInboxAccount(null);
                  setActiveMessage(null);
                }}
                className="p-1 hover:bg-white/15 text-white/85 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Tutup & Keluar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Email Address Banner */}
          <div className="bg-slate-50 border-b border-slate-150 px-4 py-2 flex justify-between items-center text-[10px] text-slate-500 font-mono shrink-0 text-left select-all">
            <span className="truncate pr-2">📍 {activeInboxAccount.email}</span>
            <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.2 rounded text-[8.5px] uppercase font-sans shrink-0">100% SSL SECURE</span>
          </div>

          {/* Layout Selector tabs (For mobile / small viewport ergonomics) */}
          <div className="flex bg-slate-100/60 border-b border-slate-150 p-1 shrink-0 text-xs">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all cursor-pointer text-center ${
                activeTab === 'list' 
                  ? 'bg-white text-slate-800 shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:bg-slate-150/40'
              }`}
            >
              Kotak Masuk ({unreadCount})
            </button>
            <button
              disabled={!activeMessage}
              onClick={() => setActiveTab('detail')}
              className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all text-center ${
                !activeMessage 
                  ? 'opacity-40 text-slate-400 cursor-not-allowed' 
                  : activeTab === 'detail'
                    ? 'bg-white text-slate-800 shadow-sm font-extrabold cursor-pointer'
                    : 'text-slate-500 hover:bg-slate-150/40 cursor-pointer'
              }`}
            >
              Detail Isi Surat
            </button>
          </div>

          {/* Tab contents */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {activeTab === 'list' ? (
              /* Message List area */
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-55/35">
                {activeInboxAccount.emails.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 select-none italic font-mono text-[11px] h-full flex flex-col justify-center items-center">
                    <Inbox className="w-8 h-8 text-slate-200 mb-2" />
                    Kotak masuk kosong.
                  </div>
                ) : (
                  activeInboxAccount.emails.map((msg) => (
                    <div 
                      key={msg.id}
                      onClick={() => {
                        setActiveMessage(msg);
                        setActiveTab('detail');
                      }}
                      className={`p-3.5 text-left transition-colors cursor-pointer block border-l-4 ${
                        activeMessage?.id === msg.id 
                          ? 'bg-red-50/30 border-red-500' 
                          : 'border-transparent hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 text-[10px] font-sans">
                        <span className="font-extrabold text-slate-800 truncate pr-2">{msg.from.split("<")[0]}</span>
                        <span className="text-slate-400 font-semibold font-mono shrink-0">{msg.date}</span>
                      </div>
                      <h4 className={`text-[10.5px] truncate font-sans text-slate-900 ${activeMessage?.id === msg.id ? 'font-black' : 'font-semibold'}`}>
                        {msg.subject}
                      </h4>
                      <p className="text-[9.5px] text-slate-500 truncate mt-0.5 leading-snug">{msg.snippet}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Message Details area */
              <div className="flex-1 overflow-y-auto p-4 bg-white text-left font-sans flex flex-col justify-between">
                {activeMessage ? (
                  <div className="space-y-4">
                    {/* Sender detail */}
                    <div className="border-b border-slate-100 pb-3 space-y-2">
                      <h3 className="text-xs font-black text-slate-900 leading-snug flex items-start gap-1 justify-between">
                        <span>{activeMessage.subject}</span>
                      </h3>
                      <div className="flex justify-between items-center text-[10px] font-sans gap-2">
                        <div className="space-y-0.5 text-[9.5px] min-w-0">
                          <p className="text-slate-800 truncate">Dari: <strong>{activeMessage.from}</strong></p>
                          <p className="text-slate-500 truncate">Ke: <strong>{activeInboxAccount.email}</strong></p>
                        </div>
                        <span className="text-slate-400 font-mono text-[9px] font-bold shrink-0">{activeMessage.date}</span>
                      </div>
                    </div>

                    {/* Email content */}
                    <div className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-150 select-text">
                      {activeMessage.body}
                    </div>

                    {/* DKIM Compliance check */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-[9px] text-slate-400 leading-normal flex gap-2">
                      <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0" />
                      <p>
                        Email resmi ini lolos verifikasi tanda tangan kriptografi SPF/DKIM Google. Anda melihat inbox asli.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-slate-400 italic font-mono text-[10.5px]">
                    Silakan pilih email dari tab Kotak Masuk untuk dibaca.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campaign push footer */}
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-150 flex items-center justify-between shrink-0 font-sans gap-3">
            <span className="text-[9.5px] text-slate-500 font-semibold text-left leading-normal">
              Onboard akun ke Dashboard Otomasi?
            </span>
            <button
              onClick={() => {
                onIntegrateCampaign(activeInboxAccount);
                addGlobalLog("success", `[Portal] ${activeInboxAccount.name} diintegrasikan penuh ke 5 media sosial!`);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] tracking-wide uppercase px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all shadow-md cursor-pointer shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              Integrasi Portal
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
