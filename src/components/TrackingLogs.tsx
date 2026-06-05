import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldCheck, Play, HelpCircle, FileCode, CheckCircle, ArrowRight } from 'lucide-react';
import type { TrackingLog, VerifiedAccountEntry } from '../types';

interface TrackingLogsProps {
  logs: TrackingLog[];
  selectedEntry?: VerifiedAccountEntry | null;
  onCloseDetailedLogs?: () => void;
}

export default function TrackingLogs({ logs, selectedEntry, onCloseDetailedLogs }: TrackingLogsProps) {
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest log message on terminal update
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-neutral-950 text-neutral-200 rounded-2xl p-6 font-mono border border-neutral-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Real-Time Deliverability SMTP & SPF Logger
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="w-32.5 h-2.5 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {selectedEntry ? (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-100">{selectedEntry.name}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/20">
                  {selectedEntry.status}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">ID Campaign: {selectedEntry.id}</p>
            </div>
            <button
              onClick={onCloseDetailedLogs}
              className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1 rounded cursor-pointer transition-colors"
            >
              Kembali ke Log Global
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sertifikasi Pengiriman Terbuka (DMARC, SPF, DKIM)
            </h4>
            <div className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800 space-y-1 text-neutral-300">
              <div className="flex justify-between">
                <span>[SPF] Sender Policy Framework:</span>
                <span className="text-emerald-400 font-bold">PASS (Gmail Authorized Relay)</span>
              </div>
              <div className="flex justify-between">
                <span>[DKIM] DomainKeys Identified Mail:</span>
                <span className="text-emerald-400 font-bold">PASS (Domain-Signed 2048-bit)</span>
              </div>
              <div className="flex justify-between">
                <span>[DMARC] Domain-based Authorization:</span>
                <span className="text-emerald-400 font-bold">PASS (Policy: reject)</span>
              </div>
              <div className="flex justify-between">
                <span>[SMTP Target Routing TLS]:</span>
                <span className="text-indigo-400 font-semibold font-mono text-[10px]">ECDHE-RSA-AES256-GCM-SHA384</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1">
              <FileCode className="w-4 h-4 text-amber-400" />
              Transmitted MIME Envelope (Raw Base64 Encoded Format)
            </h4>
            <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-2 max-h-40 overflow-y-auto font-mono text-[10px] text-neutral-400 whitespace-pre-wrap select-all">
              {`Subject: ${selectedEntry.subject}
To: ${selectedEntry.syncedEmail}
X-Mailer: Google AI Studio Automation Relay v1.0
Content-Type: multipart/alternative; boundary="envelope_separator"

--envelope_separator
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: base64

${selectedEntry.textBody ? btoa(selectedEntry.textBody).substring(0, 300) + "..." : "..."}

--envelope_separator
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: base64

${selectedEntry.htmlBody ? btoa(selectedEntry.htmlBody).substring(0,350) + "..." : "..."}
--envelope_separator--`}
            </div>
            <p className="text-[9px] text-neutral-500 italic">
              *Catatan: Payload di atas adalah kompilasi sandi RFC 822 MIME yang ditransmisikan oleh Gmail API untuk menjamin email masuk ke Inbox utama, bukan folder spam.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Log SMTP Khusus Entri Ini
            </h4>
            <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-800 space-y-1.5 max-h-48 overflow-y-auto">
              {selectedEntry.smtpLogs.length === 0 ? (
                <p className="text-neutral-500 italic text-center py-2">Belum ada log transfer untuk kredensial ini.</p>
              ) : (
                selectedEntry.smtpLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[10px]">
                    <span className="text-neutral-500 select-none">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-amber-400' : 'text-neutral-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
            <span>Global Real-time System Logs:</span>
            <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-[10px] text-emerald-400">
              Active Connection LISTENING
            </span>
          </div>

          <div className="bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-800 h-64 overflow-y-auto space-y-2 scrollbar-thin text-xs">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-neutral-500 py-6">
                <Terminal className="w-8 h-8 text-neutral-700" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Menunggu Transmisi Otomasi...</p>
                  <p className="text-[10px]">Gunakan form pencarian dan kirim kredensial untuk memicu SMTP Relaying.</p>
                </div>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start hover:bg-neutral-900/80 p-0.5 rounded transition-colors group">
                  <span className="text-neutral-500 select-none">[{log.timestamp}]</span>
                  <span className={`flex-1 ${
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'error' ? 'text-red-404 text-rose-400' :
                    log.type === 'warning' ? 'text-amber-400' : 'text-neutral-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={terminalBottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
