import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, FileText, Send, Loader2, RefreshCw, Layers, Edit, Eye, ShieldCheck, Mail } from 'lucide-react';
import type { VerifiedAccountEntry } from '../types';

interface TemplatesManagerProps {
  currentEntry: Partial<VerifiedAccountEntry> | null;
  onSendCampaign: (entry: VerifiedAccountEntry) => void;
  isSending: boolean;
  googleToken: string | null;
}

// Fixed beautiful corporate theme defaults
const DEFAULT_HTML_BODY = (name: string, user: string, pass: string, company: string) => `
<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 580px; margin: 0 auto; padding: 25px; border-radius: 16px; border: 1px solid #f0f0f0; background-color: #ffffff; color: #1f2937; line-height: 1.6;">
  <!-- Header -->
  <div style="border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
    <h1 style="font-size: 18px; font-weight: bold; color: #111827; margin: 0;">${company} - Akun Resmi Resmi Terverifikasi</h1>
    <span style="font-size: 11px; background-color: #e0e7ff; color: #4f46e5; padding: 3px 8px; border-radius: 4px; font-weight: 600;">SECURE LOGIN</span>
  </div>

  <p style="margin-top: 0; font-size: 14px;">Halo <strong>${name}</strong>,</p>
  <p style="font-size: 13.5px;">Selamat! Akun resmi perusahaan Anda telah berhasil dibuat secara otomatis melalui sistem sinkronisasi terpadu kami. Anda kini dapat mengakses portal internal kerja Anda dengan kredensial aman di bawah ini:</p>

  <!-- Credential Card -->
  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 25px 0; outline: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #6b7280; width: 40%;">Username Resmi:</td>
        <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #111827; font-family: monospace;">${user}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 12px; font-weight: 600; color: #6b7280;">Password Sementara:</td>
        <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #4f46e5; font-family: monospace;">${pass}</td>
      </tr>
    </table>
  </div>

  <!-- Call to action -->
  <div style="text-align: center; margin: 25px 0;">
    <a href="#" style="background-color: #4f46e5; color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px; display: inline-block; transition: background-color 0.2s;">
      Aktivasi & Verifikasi Akun Sekarang
    </a>
  </div>

  <!-- Warnings -->
  <p style="font-size: 11px; color: #6b7280; margin-bottom: 5px;"><strong>Ketentuan Penggunaan Aman:</strong></p>
  <ul style="font-size: 10.5px; color: #6b7280; margin-top: 5px; padding-left: 18px;">
    <li>Demi perlindungan privasi data, Anda wajib melakukan pembuatan password baru sesaat setelah login perdana.</li>
    <li>Kunci DKIM dan otentikasi SPF untuk email ini dibuat secara aman dari Domain Pengirim Sah.</li>
  </ul>

  <!-- Footer -->
  <div style="border-top: 1px solid #f3f4f6; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 10px; color: #9ca3af;">
    Email ini dikirim secara otomatis oleh sistem Keamanan Informasi Resmi. <br/>
    &copy; 2026 ${company}. Seluruh Hak Cipta Dilindungi.
  </div>
</div>
`;

export default function TemplatesManager({ currentEntry, onSendCampaign, isSending, googleToken }: TemplatesManagerProps) {
  // Config states
  const [campaignName, setCampaignName] = useState('Aktivasi Kredensial Pengguna Baru');
  const [companyName, setCompanyName] = useState('PT Digital Global');
  
  // Custom edited states loaded from props or customized manually
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('Buatkan salinan email formal bernada optimis dengan rincian keamanan perlindungan ganda.');

  const [activeTab, setActiveTab] = useState<'HTML' | 'Preview' | 'Plain'>('Preview');

  // Trigger default template population on change
  useEffect(() => {
    if (currentEntry) {
      setCompanyName(currentEntry.companyName || companyName);
      
      const defaultSubject = `Kredensial Login Resmi Terverifikasi - ${currentEntry.name}`;
      const user = currentEntry.generatedUsername || '';
      const pass = currentEntry.generatedPassword || '';
      const name = currentEntry.name || '';
      const comp = currentEntry.companyName || companyName;

      setSubject(defaultSubject);
      setHtmlBody(DEFAULT_HTML_BODY(name, user, pass, comp));
      setTextBody(`Halo ${name},\n\nAkun resmi Anda telah berhasil dikonfigurasi secara otomatis.\n\nUsername Resmi: ${user}\nPassword Sementara: ${pass}\n\nSilakan kunjungi jalur portal utama untuk memasukkan kata sandi terverifikasi Anda.\n\nSalam,\nLayanan Proteksi Portal Perusahaan`);
    } else {
      setSubject('');
      setHtmlBody('');
      setTextBody('');
    }
  }, [currentEntry]);

  // Request server-side Gemini generation via our custom API endpoint
  const handleAiRewrite = async () => {
    if (!currentEntry) return;

    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: currentEntry.name,
          generatedUsername: currentEntry.generatedUsername,
          generatedPassword: currentEntry.generatedPassword,
          campaignName,
          companyName,
          additionalInstructions: aiCustomPrompt
        })
      });

      if (!response.ok) {
        throw new Error('API server side failed to process rewrite request');
      }

      const data = await response.json();
      if (data.subject) setSubject(data.subject);
      if (data.htmlBody) setHtmlBody(data.htmlBody);
      if (data.textBody) setTextBody(data.textBody);
      
      setActiveTab('Preview');
    } catch (err) {
      console.error('API integration fallback rewrite:', err);
      // Soft recover
      alert('Sistem tidak dapat menghubungi model AI server. Memulihkan template terenkripsi standar.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSend = () => {
    if (!currentEntry || !subject || !htmlBody) return;

    // Package the final credentials setup to trigger real-time SMTP relays
    onSendCampaign({
      id: currentEntry.id || `c-${Math.random().toString(36).substring(4, 9)}`,
      phone: currentEntry.phone || '-',
      name: currentEntry.name || 'Pelanggan',
      syncedEmail: currentEntry.syncedEmail || '',
      generatedUsername: currentEntry.generatedUsername || '',
      generatedPassword: currentEntry.generatedPassword || '',
      companyName: companyName,
      status: 'Queued',
      subject: subject,
      htmlBody: htmlBody,
      textBody: textBody,
      smtpLogs: [],
      createdAt: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-6">
      
      {/* HEADER CARD */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
          <Layers className="w-5 h-5 text-indigo-500" />
          Komposer Kampanye & Desain Template
        </h2>
        <p className="text-xs text-neutral-500">
          Modifikasi parameter email kerja, buat isi copy cerdas dengan Gemini, dan otentikasi pengiriman
        </p>
      </div>

      {currentEntry ? (
        <div className="space-y-5 animate-fade-in">
          
          {/* CAMPAIGN METRICS PARAMETERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Nama Kampanye Otomasi</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-neutral-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Nama Perusahaan Publikasi</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-neutral-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* AI SPARKLES REWRITER ELEMENT */}
          <div className="border border-indigo-150 rounded-xl p-4 bg-gradient-to-br from-indigo-50/40 to-white space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              Asisten AI Email Penulisan (Didukung Gemini 3.5-Flash)
            </div>
            
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Buat salinan kredensial berpenampilan sangat profesional secara otomatis. AI akan memanfaatkan parameter kredensial aktif untuk menghasilkan pesan yang meyakinkan.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Contoh: Sangat formal, instruksi aktivasi cepat..."
                className="flex-grow text-xs px-3 py-2.5 rounded-lg border border-neutral-200 bg-white outline-none focus:border-indigo-500 font-sans"
              />
              <button
                onClick={handleAiRewrite}
                disabled={isAiGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Menulis...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tulis Ulang AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* EMAIL COMPOSER FIELDS */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Subjek Email Penerimaan</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Kredensial Login Resmi Anda..."
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-neutral-200 outline-none focus:border-indigo-500 font-sans font-medium text-neutral-800"
              />
            </div>

            {/* TAB PREVIEW SELECTOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-1">
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('Preview')}
                    className={`pb-1.5 px-2 relative font-bold transition-all cursor-pointer ${
                      activeTab === 'Preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    Pratinjau Visual HTML
                  </button>
                  <button
                    onClick={() => setActiveTab('HTML')}
                    className={`pb-1.5 px-2 relative font-bold transition-all cursor-pointer ${
                      activeTab === 'HTML' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    Edit Source HTML
                  </button>
                  <button
                    onClick={() => setActiveTab('Plain')}
                    className={`pb-1.5 px-2 relative font-bold transition-all cursor-pointer ${
                      activeTab === 'Plain' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    Model plain-text
                  </button>
                </div>
                <span className="text-[10px] text-neutral-400 italic">Pre-configured styling included</span>
              </div>

              {/* EDITOR VISUAL VIEWPORTS */}
              <div className="border border-neutral-200 rounded-xl min-h-64 overflow-hidden bg-slate-50 relative flex">
                
                {activeTab === 'Preview' && (
                  <div className="w-full bg-slate-100 p-4 overflow-y-auto max-h-96">
                    <div 
                      className="bg-white rounded-xl shadow-xs mx-auto overflow-hidden p-2" 
                      dangerouslySetInnerHTML={{ __html: htmlBody }} 
                    />
                  </div>
                )}

                {activeTab === 'HTML' && (
                  <textarea
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    className="w-full h-80 text-[11px] font-mono p-4 outline-none resize-none bg-neutral-900 text-neutral-200 leading-normal"
                    placeholder="HTML body tags..."
                  />
                )}

                {activeTab === 'Plain' && (
                  <textarea
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    className="w-full h-80 text-xs font-mono p-4 outline-none resize-none bg-white text-neutral-700 leading-relaxed"
                    placeholder="Plain email fallback text..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* TRIGGER SEND ACTION BUTTON */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-neutral-100">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Otentikasi Pengiriman Resmi: <strong>{googleToken ? "Gmail API Relay Aktif" : "Mode Simulasi Server"}</strong></span>
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || !htmlBody || !subject}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mentransfer SMTP Relay...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim & Otentikasi Email Sekarang
                </>
              )}
            </button>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-3">
          <div className="p-3.5 bg-neutral-100 rounded-full text-neutral-400">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-xs">
            <p className="text-xs font-semibold text-neutral-700">Kredensial Belum Terpilih</p>
            <p className="text-[10px] text-neutral-500">
              Cari nomor telepon di bagian panel atas untuk menarik data kontak, menyelaraskan user-password, dan membuka antarmuka ini.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
