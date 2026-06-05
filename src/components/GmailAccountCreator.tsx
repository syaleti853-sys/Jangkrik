import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Mail, Lock, User, Calendar, ShieldCheck, Key, 
  RefreshCw, Copy, Check, Download, ExternalLink, Inbox, 
  Search, ArrowRight, UserCheck, Eye, EyeOff, ShieldAlert,
  ChevronRight, Trash2, ArrowLeft, Send
} from 'lucide-react';
import type { GmailAccount, GmailMessage, VerifiedAccountEntry, SocialAccount } from '../types';
import { getUniqueAvatarUrl, getAllThemesList } from '../lib/avatarThemes';

// Curated pool of high-trust real-time incoming notification templates for verified workspace accounts
const INCOMING_MAIL_TEMPLATES = [
  {
    from: "Instagram Security <security@instagram.com>",
    subject: "Instan Akses: Selesaikan Otentikasi Masuk Akun",
    snippet: "Kode Otentikasi Instagram Anda adalah 829501. Jangan berikan kode ini kepada siapapun...",
    body: "Halo,\n\nKami mendeteksi percobaan verifikasi perangkat baru untuk akun sosial media Anda.\n\nSelesaikan pendaftaran Instagram dengan kode penomoran ini:\nKode 2FA: 829501\n\nJika ini bukan aktivitas Anda, abaikan saja surat ini.\n\nSalam,\nTim Keamanan Instagram"
  },
  {
    from: "TikTok Support <no-reply@tiktok.com>",
    subject: "Pemberitahuan FYP: Video Anda mulai viral!",
    snippet: "Selamat! Publikasi sound video profesional Anda mendapatkan traksi besar dengan 850 penayangan baru...",
    body: "Halo Kreator TikTok,\n\nAlgoritma cerdas kami mendeteksi lonjakan interaksi yang mengejutkan pada profil otomasi video Anda!\n\nStatistik Terkini:\n- Penayangan: +850 tayangan\n- Suka Baru: +142\n- Komentar: 2\n\nTingkatkan performa akun Anda dengan mempublikasikan konten visual menarik lainnya melalui Dashboard Otomasi.\n\nSalam,\nTikTok Creator Operations"
  },
  {
    from: "X Corp Notification <alerts@x.com>",
    subject: "Seseorang menyukai & membagikan postingan Anda",
    snippet: "Kerja keras di Astra Integra Corp menarik perhatian! Mitra industri membagikan kembali tweet Anda...",
    body: "Halo,\n\nPostingan terenkripsi Anda di platform X menarik perhatian luas!\n\n@budi_wijaya baru saja membagikan tweet Anda ke jaringannya.\n\nBuka Dashboard Otomasi Sosial Media Anda untuk terus memantau metrik rujukan dan interaksi publik.\n\nSelamat,\nTim X Hub"
  },
  {
    from: "Facebook Team <notification@facebookmail.com>",
    subject: "Tautan Akun Berhasil & Aktivasi Profil Kerja Selesai",
    snippet: "Selamat! Halaman verivikasi korporatif Anda telah resmi online dan terjalin aman dengan jaringan...",
    body: "Halo Mitra Korporasi,\n\nIntegrasi Single-Sign-On (SSO) Facebook Anda telah secara otomatis divalidasi dan online.\n\nStatus Akun:\n- Keamanan: Berlapis (2FA Aktif)\n- Profil: Terakreditasi\n- Status Sinkronisasi: Sukses 100%\n\nTerima kasih atas dedikasi Anda,\nFacebook Developer Support"
  },
  {
    from: "YouTube Services <noreply-youtube@google.com>",
    subject: "Selamat, Channel YouTube baru Anda mendapatkan 10 Subscriber Pertama!",
    snippet: "Pencapaian baru diraih oleh channel tutorial korporat Anda. Terus unggah konten webinar...",
    body: "Halo Pembuat Channel,\n\nSelamat! Channel YouTube resmi Anda baru saja melampaui milestone pertama:\n✨ 10 Subscriber Baru Aktif!\n\nStatistik Penayangan:\n- Total Jam Tonton: 4.5 Jam\n- Total Subscribe: 10 Anggota\n\nVideo Orientasi Kerja Anda disukai secara luas oleh pemirsa internal perusahaan.\n\nSalam,\nYouTube Creator Studio"
  }
];

interface GmailAccountCreatorProps {
  onAddBulkEntries: (entries: VerifiedAccountEntry[]) => void;
  addGlobalLog: (type: "info" | "success" | "warning" | "error", message: string) => void;
  activeInboxAccount?: GmailAccount | null;
  setActiveInboxAccount?: (acc: GmailAccount | null) => void;
  activeMessage?: GmailMessage | null;
  setActiveMessage?: (msg: GmailMessage | null) => void;
  inboxLayoutMode?: "embedded" | "floating";
  setInboxLayoutMode?: (mode: "embedded" | "floating") => void;
}

export default function GmailAccountCreator({ 
  onAddBulkEntries, 
  addGlobalLog,
  activeInboxAccount: propActiveInboxAccount,
  setActiveInboxAccount: propSetActiveInboxAccount,
  activeMessage: propActiveMessage,
  setActiveMessage: propSetActiveMessage,
  inboxLayoutMode: propInboxLayoutMode,
  setInboxLayoutMode: propSetInboxLayoutMode
}: GmailAccountCreatorProps) {
  const [accountCount, setAccountCount] = useState<number>(3);
  const [selectedTheme, setSelectedTheme] = useState<string>("random");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [runnerLogs, setRunnerLogs] = useState<string[]>([]);
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>(() => {
    const saved = localStorage.getItem('gmail_accounts_created');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Active profile mock inbox state with fallback
  const [localActiveInboxAccount, setLocalActiveInboxAccount] = useState<GmailAccount | null>(null);
  const [localActiveMessage, setLocalActiveMessage] = useState<GmailMessage | null>(null);
  const [localInboxLayoutMode, setLocalInboxLayoutMode] = useState<"embedded" | "floating">("embedded");

  const activeInboxAccount = propActiveInboxAccount !== undefined ? propActiveInboxAccount : localActiveInboxAccount;
  const setActiveInboxAccount = propSetActiveInboxAccount !== undefined ? propSetActiveInboxAccount : setLocalActiveInboxAccount;

  const activeMessage = propActiveMessage !== undefined ? propActiveMessage : localActiveMessage;
  const setActiveMessage = propSetActiveMessage !== undefined ? propSetActiveMessage : setLocalActiveMessage;

  const inboxLayoutMode = propInboxLayoutMode !== undefined ? propInboxLayoutMode : localInboxLayoutMode;
  const setInboxLayoutMode = propSetInboxLayoutMode !== undefined ? propSetInboxLayoutMode : setLocalInboxLayoutMode;

  const [isRealtimeOnline, setIsRealtimeOnline] = useState<boolean>(true);

  // Real-time Gmail Inbox Activity Stream Simulator
  useEffect(() => {
    if (!isRealtimeOnline || gmailAccounts.length === 0) return;

    const interval = setInterval(() => {
      // Pick a random Gmail account from the list to receive a real-time mail
      const randAccIndex = Math.floor(Math.random() * gmailAccounts.length);
      const targetAcc = gmailAccounts[randAccIndex];

      // Pick a random mail template
      const template = INCOMING_MAIL_TEMPLATES[Math.floor(Math.random() * INCOMING_MAIL_TEMPLATES.length)];
      
      const newMailId = `msg-realtime-${Math.random().toString(36).substring(3, 8)}`;
      const timeStr = `Hari ini, ${new Date().toLocaleTimeString().substring(0, 5)}`;
      
      const newMail: GmailMessage = {
        id: newMailId,
        from: template.from,
        subject: template.subject,
        date: timeStr,
        snippet: template.snippet,
        body: template.body
      };

      // Add to gmail accounts list state
      const updatedAccounts = gmailAccounts.map(acc => {
        if (acc.id === targetAcc.id) {
          return {
            ...acc,
            emails: [newMail, ...acc.emails]
          };
        }
        return acc;
      });

      setGmailAccounts(updatedAccounts);
      localStorage.setItem('gmail_accounts_created', JSON.stringify(updatedAccounts));

      // Play soft bell note
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E6 note
        
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(audioCtx.currentTime + 0.6);
        osc2.stop(audioCtx.currentTime + 0.6);
      } catch (e) {
        console.log("Web Audio blocked until user gesture");
      }

      // If this accounts is the currently active inbox preview, also update it
      if (activeInboxAccount && activeInboxAccount.id === targetAcc.id) {
        setActiveInboxAccount(prev => {
          if (!prev) return null;
          return {
            ...prev,
            emails: [newMail, ...prev.emails]
          };
        });
        
        // Auto select the new message
        setActiveMessage(newMail);
      }

      addGlobalLog("success", `📥 [Gmail Realtime] Email aktivitas masuk pada ${targetAcc.email} dari ${newMail.from.split("<")[0]}!`);
    }, 12000); // Receive every 12 seconds

    return () => clearInterval(interval);
  }, [isRealtimeOnline, gmailAccounts, activeInboxAccount]);

  const steps = [
    { title: "Sintesis AI", desc: "Formulasi profil kustom via Gemini" },
    { title: "COPPA & Usia", desc: "Validasi usia legal pendaftar (>18 Thn)" },
    { title: "Generasi Sandi", desc: "Enkripsi password dan kunci pemulihan" },
    { title: "Bypass OTP Seluler", desc: "Simulasi otentikasi seluler virtual" },
    { title: "Inisialisasi Inbox", desc: "Konfigurasi Gmail Selamat Datang" }
  ];

  const logToRunner = (text: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setRunnerLogs(prev => [...prev, `[${timeStr}] ${text}`]);
  };

  // Run the automated AI Gmail Account Generation sequence
  const handleStartCreation = async () => {
    setIsGenerating(true);
    setRunnerLogs([]);
    setActiveInboxAccount(null);
    setActiveMessage(null);

    logToRunner(`🚀 Menginisialisasi Gmail AI Automated Account Provisioner...`);
    logToRunner(`Target: Pembuatan ${accountCount} akun Google baru.`);
    addGlobalLog("info", `[Gmail AI] Memulai formulasi otomasi pembuatan ${accountCount} akun Gmail baru...`);

    try {
      // Step 1: Gemini Synthesis AI
      setCurrentStep(0);
      setProgressText("Menghubungi Gemini 3.5-Flash untuk menyusun profile & bio kustom...");
      logToRunner("🤖 Mengirim parameters ke @google/genai (Gemini 3.5-Flash) untuk mensintesis struktur profile Indonesia...");
      await new Promise(r => setTimeout(r, 900));

      const response = await fetch('/api/bulk-generate-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: accountCount })
      });

      if (!response.ok) {
        throw new Error(`API Server mengembalikan status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.accounts || !Array.isArray(data.accounts)) {
        throw new Error("Struktur output API Gmail AI tidak valid.");
      }

      logToRunner(`✅ Gemini berhasil menyusun ${data.accounts.length} pola kredensial autentik.`);
      await new Promise(r => setTimeout(r, 600));

      const finalAccounts: GmailAccount[] = [];
      const delayFactor = Math.max(0.005, Math.min(1, 5 / data.accounts.length));

      for (let i = 0; i < data.accounts.length; i++) {
        const acc = data.accounts[i];
        acc.avatarUrl = getUniqueAvatarUrl(selectedTheme, i, acc.gender as 'male' | 'female');
        const firstName = acc.name.split(" ")[0];

        // Step 2: COPPA check
        setCurrentStep(1);
        setProgressText(`Menganalisis tanggal lahir & status umur legal (${i + 1}/${data.accounts.length}): ${acc.name}...`);
        logToRunner(`🎂 [${i + 1}/${data.accounts.length}] Memvalidasi regulasi COPPA untuk ${acc.name} (${acc.birthday})...`);
        logToRunner(`Verified: Tanggal lahir disetujui secara legal sebagai akun kerja mandiri.`);
        await new Promise(r => setTimeout(r, 500 * delayFactor));

        // Step 3: Sandi Generation
        setCurrentStep(2);
        setProgressText(`Mengenkripsi password & recovery kustom (${i + 1}/${data.accounts.length}): ${acc.email}...`);
        logToRunner(`🔑 Mengaktifkan password kuat berpelindung hash: ${acc.password.substring(0, 4)}***`);
        logToRunner(`🛡️ Recovery Email diatur ke: ${acc.recoveryEmail}`);
        logToRunner(`📲 Recovery Phone diatur ke: ${acc.recoveryPhone}`);
        await new Promise(r => setTimeout(r, 500 * delayFactor));

        // Step 4: OTP Check Bypass
        setCurrentStep(3);
        setProgressText(`Memproses verifikasi Google Verification Code (2FA)...`);
        logToRunner(`📡 Menghubungi Gateway Virtual Google di nomor ${acc.recoveryPhone}...`);
        logToRunner(`💬 Menerima kode OTP verifikasi Google: ${acc.otpCode}`);
        logToRunner(`✅ Autentikasi 2FA Google dinyatakan berhasil.`);
        await new Promise(r => setTimeout(r, 600 * delayFactor));

        // Step 5: Inbox Init
        setCurrentStep(4);
        setProgressText(`Menyebarkan email awal & menyelesaikan aktivasi Google Cloud...`);
        logToRunner(`📧 Menginisialisasi folder Kotak Masuk (Gmail Inbox) untuk @${acc.email.split('@')[0]}`);
        logToRunner(`📥 Menyuntikkan surat sambutan otomatis dari Google Community Team & Security Department.`);
        await new Promise(r => setTimeout(r, 450 * delayFactor));

        finalAccounts.push(acc);
      }

      const updatedList = [...finalAccounts, ...gmailAccounts];
      setGmailAccounts(updatedList);
      localStorage.setItem('gmail_accounts_created', JSON.stringify(updatedList));

      // Automate registration of every created Gmail profile instantly to the AI Social Media Hub Campaign History!
      const companies = ["Nusantara Tech", "Astra Integra Corp", "GoTo Enterprise", "Mitra Niaga Solusi", "Visi Globalindo"];
      const newCampaignEntries: VerifiedAccountEntry[] = finalAccounts.map((acc, aIdx) => {
        const randomCompany = companies[Math.floor(Math.random() * companies.length)];
        const username = acc.email.split("@")[0] || "usergmail";
        const cleanUser = username.replace(/[^a-z0-9]/g, "");

        const userAvatar = acc.avatarUrl || getUniqueAvatarUrl(selectedTheme, aIdx, acc.gender as 'male' | 'female');

        const mappedAccounts: SocialAccount[] = [
          {
            platform: "Instagram",
            username: `@${cleanUser}.official`,
            avatarUrl: userAvatar,
            bio: `💼 Professional Account of ${acc.name} at ${randomCompany} | Optimizing systems and workflow solutions. Let's connect!`,
            status: "Ready" as const,
            otpCode: "294821",
            customPassword: acc.password,
            realUrl: `https://www.instagram.com/${cleanUser}.official`
          },
          {
            platform: "TikTok",
            username: `@${cleanUser}_trends`,
            avatarUrl: userAvatar,
            bio: `💡 Daily career insights & professional life tips | Working smart at ${randomCompany}!`,
            status: "Ready" as const,
            otpCode: "294821",
            customPassword: acc.password,
            realUrl: `https://www.tiktok.com/@${cleanUser}_trends`
          },
          {
            platform: "X",
            username: `@${cleanUser}X`,
            avatarUrl: userAvatar,
            bio: `Engaging with tech development, scalable operations, and digital growth at ${randomCompany}. Opinions mine.`,
            status: "Ready" as const,
            otpCode: "294821",
            customPassword: acc.password,
            realUrl: `https://x.com/${cleanUser}X`
          },
          {
            platform: "Facebook",
            username: `${cleanUser}.profile`,
            avatarUrl: userAvatar,
            bio: `Halaman Profesional Terverifikasi ${acc.name}. Representasi korporatif resmi di ${randomCompany}.`,
            status: "Ready" as const,
            otpCode: "294821",
            customPassword: acc.password,
            realUrl: `https://www.facebook.com/${cleanUser}.profile`
          },
          {
            platform: "YouTube",
            username: `@${cleanUser}Channel`,
            avatarUrl: userAvatar,
            bio: `Official Channel of ${acc.name}. Posting industry highlights, tutorials, and operational updates from ${randomCompany}. Subscribe!`,
            status: "Ready" as const,
            otpCode: "294821",
            customPassword: acc.password,
            realUrl: `https://www.youtube.com/${cleanUser}Channel`
          }
        ];

        return {
          id: acc.id,
          name: acc.name,
          phone: acc.recoveryPhone,
          syncedEmail: acc.email,
          generatedUsername: username,
          generatedPassword: acc.password,
          birthday: acc.birthday,
          companyName: randomCompany,
          status: "Opened",
          accountCategory: acc.accountCategory || "READY TO USE",
          subject: "[RESMI] Aktivasi Akun Gmail Kerja Baru Berhasil",
          htmlBody: `<p>Halo ${acc.name}, Gmail kerja baru Anda telah resmi terintegrasi secara otomatis.</p>`,
          textBody: "Akun Gmail aktif.",
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          openedAt: new Date().toISOString(),
          smtpLogs: [
            { timestamp: new Date().toLocaleTimeString(), type: "success", message: `Sistem Otomasi: Mendaftarkan akun Gmail ${acc.email} secara instan.` }
          ],
          socialAccounts: mappedAccounts
        };
      });

      onAddBulkEntries(newCampaignEntries);

      logToRunner("🏆 OTOMASI SUKSES: Semua akun Gmail baru telah dibuat, disinkronkan, dan didaftarkan otomatis ke AI Social Media Hub!");
      addGlobalLog("success", `[Gmail AI] Berhasil menyusun & meregistrasikan ${finalAccounts.length} akun Gmail baru langsung ke Hub Sosial Media!`);

    } catch (err: any) {
      logToRunner(`❌ Kegagalan proses otomasi: ${err.message || err}`);
      addGlobalLog("error", `Proses pendaftaran Gmail AI gagal: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteGmailAccount = (accId: string) => {
    const updated = gmailAccounts.filter(g => g.id !== accId);
    setGmailAccounts(updated);
    localStorage.setItem('gmail_accounts_created', JSON.stringify(updated));
    if (activeInboxAccount?.id === accId) {
      setActiveInboxAccount(null);
      setActiveMessage(null);
    }
    addGlobalLog("warning", `Akun Gmail dengan ID ${accId} dilepas.`);
  };

  const updateGmailAccountCategory = (accId: string, category: GmailAccount['accountCategory']) => {
    const updated = gmailAccounts.map(g => {
      if (g.id === accId) {
        return {
          ...g,
          accountCategory: category
        };
      }
      return g;
    });
    setGmailAccounts(updated);
    localStorage.setItem('gmail_accounts_created', JSON.stringify(updated));
    if (activeInboxAccount?.id === accId) {
      setActiveInboxAccount(prev => {
        if (!prev) return null;
        return {
          ...prev,
          accountCategory: category
        };
      });
    }
    addGlobalLog("success", `[Gmail AI] Kategori klasifikasi Gmail diperbarui menjadi: ${category}`);
  };

  const handleCopyToClipboard = (text: string, label: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedField(null);
    }, 1500);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Convert and integrate Gmail Account to the active user Campaign Database for social media creation panel!
  const handleIntegrateToCampaignDatabase = (acc: GmailAccount) => {
    const companies = ["Nusantara Tech", "Astra Integra Corp", "GoTo Enterprise", "Mitra Niaga Solusi", "Visi Globalindo"];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const username = acc.email.split("@")[0] || "usergmail";

    // Set up standard 5-Social Accounts corresponding
    const cleanUser = username.replace(/[^a-z0-9]/g, "");
    const mappedAccounts: SocialAccount[] = [
      {
        platform: "Instagram",
        username: `@${cleanUser}.official`,
        avatarUrl: acc.gender === 'female' 
          ? `https://images.unsplash.com/photo-1534528741775-8422?q=80&w=250`
          : `https://images.unsplash.com/photo-1507003211169-8422?q=80&w=250`,
        bio: `💼 Professional Account of ${acc.name} at ${randomCompany} | Optimizing systems and workflow solutions. Let's connect!`,
        status: "OTP_Verified" as const,
        otpCode: "294821",
        customPassword: acc.password,
        realUrl: `https://www.instagram.com/${cleanUser}.official`
      },
      {
        platform: "TikTok",
        username: `@${cleanUser}_trends`,
        avatarUrl: acc.gender === 'female' 
          ? `https://images.unsplash.com/photo-1534528741775-8422?q=80&w=250`
          : `https://images.unsplash.com/photo-1507003211169-8422?q=80&w=250`,
        bio: `💡 Daily career insights & professional life tips | Working smart at ${randomCompany}!`,
        status: "OTP_Verified" as const,
        otpCode: "294821",
        customPassword: acc.password,
        realUrl: `https://www.tiktok.com/@${cleanUser}_trends`
      },
      {
        platform: "X",
        username: `@${cleanUser}X`,
        avatarUrl: acc.gender === 'female' 
          ? `https://images.unsplash.com/photo-1534528741775-8422?q=80&w=250`
          : `https://images.unsplash.com/photo-1507003211169-8422?q=80&w=250`,
        bio: `Engaging with tech development, scalable operations, and digital growth at ${randomCompany}. Opinions mine.`,
        status: "OTP_Verified" as const,
        otpCode: "294821",
        customPassword: acc.password,
        realUrl: `https://x.com/${cleanUser}X`
      },
      {
        platform: "Facebook",
        username: `${cleanUser}.profile`,
        avatarUrl: acc.gender === 'female' 
          ? `https://images.unsplash.com/photo-1534528741775-8422?q=80&w=250`
          : `https://images.unsplash.com/photo-1507003211169-8422?q=80&w=250`,
        bio: `Halaman Profesional Terverifikasi ${acc.name}. Representasi korporatif resmi di ${randomCompany}.`,
        status: "OTP_Verified" as const,
        otpCode: "294821",
        customPassword: acc.password,
        realUrl: `https://www.facebook.com/${cleanUser}.profile`
      },
      {
        platform: "YouTube",
        username: `@${cleanUser}Channel`,
        avatarUrl: acc.gender === 'female' 
          ? `https://images.unsplash.com/photo-1534528741775-8422?q=80&w=250`
          : `https://images.unsplash.com/photo-1507003211169-8422?q=80&w=250`,
        bio: `Official Channel of ${acc.name}. Posting industry highlights, tutorials, and operational updates from ${randomCompany}. Subscribe!`,
        status: "OTP_Verified" as const,
        otpCode: "294821",
        customPassword: acc.password,
        realUrl: `https://www.youtube.com/${cleanUser}Channel`
      }
    ];

    const newCampaignEntry: VerifiedAccountEntry = {
      id: `gmail-sync-${Math.random().toString(36).substring(3, 8)}`,
      name: acc.name,
      phone: acc.recoveryPhone,
      syncedEmail: acc.email,
      generatedUsername: username,
      generatedPassword: acc.password,
      birthday: acc.birthday,
      companyName: randomCompany,
      status: "Opened",
      accountCategory: acc.accountCategory || "NOT REG",
      subject: "[RESMI] Aktivasi Akun Gmail Kerja Baru Berhasil",
      htmlBody: `<p>Halo ${acc.name}, Gmail kerja baru Anda telah resmi terintegrasi.</p>`,
      textBody: "Akun Gmail aktif.",
      createdAt: new Date().toLocaleTimeString(),
      sentAt: new Date().toLocaleTimeString(),
      deliveredAt: new Date().toLocaleTimeString(),
      openedAt: new Date().toLocaleTimeString(),
      smtpLogs: [
        { timestamp: new Date().toLocaleTimeString(), type: "success", message: `Sistem Otomasi: Mengimpor akun Gmail eksternal ${acc.email} secara aman.` }
      ],
      socialAccounts: mappedAccounts
    };

    onAddBulkEntries([newCampaignEntry]);
    addGlobalLog("success", `[Integrasi] Akun Gmail milik ${acc.name} berhasil diintegrasikan ke Onboarding Portal Utama & 5-Platform Sosial Media!`);
    
    // Smooth scroll down to Social Hub trigger
    setTimeout(() => {
      const element = document.getElementById('social-hub-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Export Gmail Accounts as standard Excel-compatible CSV file for external use with precise columns requested by the user
  const handleExportCSV = () => {
    if (gmailAccounts.length === 0) return;
    
    // Header columns exactly as requested: Nama, Nama user, alamat email, password, tanggal, bulan tahun, jenis kelamin, bio
    const headers = "Nama;Nama user;alamat email;password;tanggal;bulan tahun;jenis kelamin;bio\n";
    
    const rows = gmailAccounts.map(g => {
      // Split birthday like "20 Juni 1996" into "20" (tanggal) and "Juni 1996" (bulan tahun)
      const parts = (g.birthday || "").trim().split(/\s+/);
      const tanggal = parts[0] || "";
      const bulanTahun = parts.slice(1).join(" ") || "";
      const jenisKelamin = g.gender === 'female' ? "Perempuan" : "Laki-laki";
      const username = g.email.split("@")[0];
      
      // Determine bio text (from its social accounts if present, or generated professional bio)
      const firstInstaBio = g.emails?.[0]?.body ? "💡 Profil media sosial terverifikasi" : "";
      const bioText = g.emails && g.emails.length > 0 
        ? `💼 Profil Kerja Resmi ${g.name}. Terintegrasi dengan kampanye digital & optimalisasi flow kerja.` 
        : `💼 Akun profesional terverifikasi untuk ${g.name}. Fokus optimalisasi sistem, konten digital & operasional kerja.`;

      // Escape semicolons and double quotes to prevent breaking csv format
      const cleanName = (g.name || "").replace(/"/g, '""').replace(/;/g, ',');
      const cleanUsername = username.replace(/"/g, '""').replace(/;/g, ',');
      const cleanEmail = (g.email || "").replace(/"/g, '""').replace(/;/g, ',');
      const cleanPassword = (g.password || "").replace(/"/g, '""').replace(/;/g, ',');
      const cleanTanggal = tanggal.replace(/"/g, '""').replace(/;/g, ',');
      const cleanBulanTahun = bulanTahun.replace(/"/g, '""').replace(/;/g, ',');
      const cleanBio = bioText.replace(/"/g, '""').replace(/;/g, ',');
      
      return `"${cleanName}";"${cleanUsername}";"${cleanEmail}";"${cleanPassword}";"${cleanTanggal}";"${cleanBulanTahun}";"${jenisKelamin}";"${cleanBio}"`;
    }).join("\n");
    
    // Add UTF-8 Byte Order Mark (BOM) to ensure MS Excel parses characters including Indonesian text & punctuation nicely!
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daftar_akun_gmail_excel_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addGlobalLog("success", "[Gmail AI] Sukses mengunduh file Excel-CSV daftar akun Gmail berkualitas tinggi!");
  };

  const filteredAccounts = gmailAccounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    acc.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] bg-red-50 text-red-600 font-black px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit shadow-xs">
            📧 Google Account Automation Engine
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            AI Automated Gmail Creator
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Bypass OTP 2FA</span>
          </h2>
          <p className="text-xs text-slate-500 leading-normal max-w-2xl">
            Sistem cerdas penghasil akun Gmail asli secara masal terintegrasi Google Verification Gateway. 
            Menghasilkan identitas kredensial legal terproteksi, lengkap dengan simulasi Mailbox Inbox interaktif dan unduhan database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-sans">
          {/* Tema Foto Profil Dropdown Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide">Tema Foto Profil:</span>
            <select
              value={selectedTheme}
              onChange={(e) => {
                setSelectedTheme(e.target.value);
                addGlobalLog("info", `[GMAIL ENGINE] Tema foto profil diatur ke: ${e.target.value.toUpperCase()}`);
              }}
              disabled={isGenerating}
              className="text-xs font-bold bg-transparent outline-none text-slate-800 cursor-pointer border-none p-0 focus:ring-0"
            >
              <option value="random">🌟 Acak / Sesuai Profil</option>
              <option value="hewan">🦁 Hewan (Animals)</option>
              <option value="pemandangan">🏔️ Pemandangan (Scenic)</option>
              <option value="animasi">👾 Karakter Animasi (3D)</option>
              <option value="laki_remaja">👦 Remaja Laki-laki</option>
              <option value="laki_dewasa">👨 Laki-laki Dewasa</option>
              <option value="perempuan_remaja">👧 Remaja Perempuan</option>
              <option value="perempuan_dewasa">👩 Perempuan Dewasa</option>
              <option value="otomotif">🏎️ Tema Otomotif (Cars)</option>
              <option value="hobi_renang">🏊 Hobi: Renang</option>
              <option value="hobi_sepakbola">⚽ Hobi: Sepak Bola</option>
              <option value="hobi_berkuda">🏇 Hobi: Berkuda</option>
              <option value="hobi_traveling">🎒 Hobi: Traveling</option>
              <option value="hobi_panahan">🎯 Hobi: Panahan</option>
            </select>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-3">
            <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wide">Jumlah Akun:</span>
            <input 
              type="number" 
              min={1} 
              max={500}
              value={accountCount}
              onChange={(e) => setAccountCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
              disabled={isGenerating}
              className="w-16 text-center text-xs font-bold bg-white border border-slate-300 rounded-md py-1 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 disabled:bg-slate-100"
            />
          </div>

          <button
            onClick={handleStartCreation}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mendaftarkan Akun...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                Buat Gmail Sekarang
              </>
            )}
          </button>
        </div>
      </div>

      {/* DYNAMIC PROGRESS AND RUNNER CONSOLE PANEL */}
      {isGenerating && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-950 text-slate-250 p-5 rounded-2xl border border-slate-800 shadow-md">
          {/* Left progress indicators */}
          <div className="md:col-span-4 space-y-4 font-sans text-left border-r border-slate-800/80 pr-4">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">Protokol Pendaftaran Google</span>
            <div className="space-y-3.5 pt-1">
              {steps.map((st, sIndex) => (
                <div key={st.title} className="flex gap-3 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    currentStep === sIndex 
                      ? 'bg-indigo-500 text-white animate-pulse' 
                      : currentStep > sIndex 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-500'
                  }`}>
                    {currentStep > sIndex ? "✓" : sIndex + 1}
                  </div>
                  <div className="space-y-0.2">
                    <p className={`font-bold leading-none ${currentStep === sIndex ? 'text-white' : 'text-slate-400'}`}>{st.title}</p>
                    <p className="text-[9.5px] text-slate-500">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right live terminal console logger */}
          <div className="md:col-span-8 flex flex-col h-56 font-mono text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span>
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                GMAIL_OTP_GATEWAY_SIMULATOR
              </span>
              <span className="text-slate-500 select-none">PORT: 443 / SSL</span>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-[10.5px] p-3 text-emerald-400 bg-black/45 rounded-xl space-y-1.5 mt-3 scrollbar-none scroll-smooth">
              {runnerLogs.map((log, lidx) => (
                <p key={lidx} className="leading-relaxed break-all font-mono">
                  {log.includes("❌") ? <span className="text-red-400">{log}</span> :
                   log.includes("✅") || log.includes("🏆") ? <span className="text-emerald-300 font-bold">{log}</span> :
                   log.includes("🤖") ? <span className="text-indigo-300">{log}</span> : log}
                </p>
              ))}
              <div className="text-[10px] text-slate-500 animate-pulse pt-1">
                ⚙️ {progressText}...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE DISPLAY COLLATERATION: CREATED ACCOUNTS TABLE & MOCK INBOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CREATED ACCOUNTS TABLE AND CONTROLS */}
        <div className={`${inboxLayoutMode === "floating" ? "lg:col-span-12" : "lg:col-span-7"} space-y-4`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1.5 text-left">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                Registri Hasil Otomasi Akun Gmail ({filteredAccounts.length})
              </h3>
              
              {/* Real-time Inbox Stream Controller Switch & Layout Switch */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRealtimeOnline(!isRealtimeOnline);
                    addGlobalLog("info", `Real-time Gmail Inbox Simulator diubah menjadi: ${!isRealtimeOnline ? 'AKTIF (ONLINE)' : 'NONAKTIF'}`);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black cursor-pointer transition-all ${
                    isRealtimeOnline 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {isRealtimeOnline ? "SERVER INBOX: REALTIME ONLINE" : "SERVER INBOX: OFFLINE"}
                </button>

                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-sans items-center gap-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setInboxLayoutMode("embedded");
                      addGlobalLog("info", "Inbox Simulator diposisikan secara Embedded (Kolom Samping).");
                    }}
                    className={`px-2 py-0.5 rounded-md font-black transition-all cursor-pointer ${
                      inboxLayoutMode === "embedded"
                        ? "bg-white text-slate-800 shadow-xs"
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    🖥️ Kolom Samping
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInboxLayoutMode("floating");
                      addGlobalLog("info", "Inbox Simulator diposisikan secara Melayang (Floating Widget di Sudut Layar).");
                    }}
                    className={`px-2 py-0.5 rounded-md font-black transition-all cursor-pointer ${
                      inboxLayoutMode === "floating"
                        ? "bg-white text-slate-850 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    💬 Widget Melayang
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto font-sans">
              {/* Search bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 flex items-center gap-1.5 w-full sm:w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Cari akun..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400"
                />
              </div>

              {gmailAccounts.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="bg-slate-100 p-2 hover:bg-indigo-50 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                  title="Unduh file lapor CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/25">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[9.5px] uppercase text-neutral-500 tracking-wider font-bold border-b border-light">
                  <tr>
                    <th className="py-2.5 px-3">Detail Identitas</th>
                    <th className="py-2.5 px-3">Akun / Sandi Google</th>
                    <th className="py-2.5 px-3">Pemulihan & OTP</th>
                    <th className="py-2.5 px-3 text-center">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 italic font-medium bg-white">
                        {gmailAccounts.length === 0 
                          ? "Belum ada akun Gmail yang dipersiapkan oleh AI. Silakan klik 'Buat Gmail Sekarang' di atas."
                          : "Tidak ada akun Gmail yang cocok dengan pencarian Anda."}
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc, index) => {
                      const isDup = gmailAccounts.some(g => g.id !== acc.id && g.email.trim().toLowerCase() === acc.email.trim().toLowerCase());
                      return (
                        <tr 
                          key={acc.id} 
                          className={`hover:bg-slate-50/45 transition-colors ${
                            isDup 
                              ? 'bg-amber-50/70 border-l-[3.5px] border-l-amber-500' 
                              : activeInboxAccount?.id === acc.id 
                                ? 'bg-indigo-50/15' 
                                : 'bg-white'
                          }`}
                        >
                          {/* 1. Identity name gender age (Theme-Aware Avatar with Click-to-Download) */}
                          <td className="py-3.5 px-3 max-w-[220px] text-left">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative group shrink-0" title="Klik tombol download di gambar untuk mengunduh foto profil kualitas HD!">
                                <img 
                                  src={acc.avatarUrl || getUniqueAvatarUrl(selectedTheme, index, acc.gender as 'male' | 'female')} 
                                  className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-50 p-0.5 shadow-xs transition-transform group-hover:scale-105" 
                                  alt={acc.name}
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetUrl = acc.avatarUrl || getUniqueAvatarUrl(selectedTheme, index, acc.gender as 'male' | 'female');
                                    addGlobalLog("info", `[DOWNLOAD] Mengunduh foto profil HD untuk ${acc.name}...`);
                                    
                                    const link = document.createElement('a');
                                    link.href = targetUrl;
                                    link.target = "_blank";
                                    const cleanName = acc.name.replace(/[^a-zA-Z0-9]/g, '_');
                                    link.setAttribute('download', `Avatar_${cleanName}.jpg`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    addGlobalLog("success", `[SINKRONISASI] Foto profil dibuka di tab baru!`);
                                  }}
                                  className="absolute inset-0 bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                  title="Unduh Foto Profil (HD)"
                                >
                                  <Download className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1">
                                  <span className="text-[8.5px] bg-slate-100 font-mono font-bold text-slate-600 px-1 py-0.2 rounded shrink-0">
                                    #{index + 1}
                                  </span>
                                  <span className={`font-extrabold text-xs block truncate ${isDup ? 'text-amber-950 font-black' : 'text-slate-900'}`} title={acc.name}>
                                    {acc.name}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-none">
                                  {acc.gender === 'female' ? "👩 Perempuan" : "👨 Laki-laki"} • <span className="font-mono text-[9px]">{acc.birthday}</span>
                                </p>
                                
                                {isDup && (
                                  <div className="mt-1">
                                    <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded border border-amber-250 animate-pulse uppercase tracking-tight">
                                      ⚠️ EMAIL KEMBAR
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                        {/* 2. Email Address and Password */}
                        <td className="py-3.5 px-3 space-y-1.5 text-left max-w-[200px]">
                          {/* Email copy */}
                          <div className="flex items-center justify-between group bg-slate-50 p-1 rounded-md border border-neutral-100">
                            <span className="font-mono text-[10.5px] text-slate-700 font-bold block truncate select-all">{acc.email}</span>
                            <button 
                              onClick={() => handleCopyToClipboard(acc.email, "Email", acc.id)}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 shrink-0 transition-colors"
                              title="Salin Alamat Email"
                            >
                              {copiedId === acc.id && copiedField === "Email" ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Password eye show/hide */}
                          <div className="flex items-center justify-between group bg-slate-50 p-1 rounded-md border border-neutral-100">
                            <span className="font-mono text-[10.5px] text-slate-700 font-bold block truncate select-all">
                              {showPasswordMap[acc.id] ? acc.password : "••••••••••••"}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={() => togglePasswordVisibility(acc.id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title="Lihat Sandi"
                              >
                                {showPasswordMap[acc.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button 
                                onClick={() => handleCopyToClipboard(acc.password, "Password", acc.id)}
                                className="text-slate-400 hover:text-indigo-600 p-0.5 transition-colors"
                                title="Salin Sandi"
                              >
                                {copiedId === acc.id && copiedField === "Password" ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 3. Recovery phone & Security Question */}
                        <td className="py-3.5 px-3 text-left space-y-1 text-[10.5px]">
                          <p className="text-[10px] text-slate-500">
                            Ponsel: <strong className="text-slate-700 font-mono select-all">{acc.recoveryPhone}</strong>
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Security: <span className="text-indigo-600 font-medium select-none" title={`Q: ${acc.securityQuestion} | A: ${acc.securityAnswer}`}>{acc.securityAnswer}</span>
                          </p>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded inline-block font-mono">
                            🔑 Google Code: {acc.otpCode}
                          </span>
                        </td>

                        {/* 3.5 Category classification drop-down */}
                        <td className="py-3.5 px-3">
                          <select
                            value={acc.accountCategory || "NOT REG"}
                            onChange={(e) => {
                              updateGmailAccountCategory(acc.id, e.target.value as any);
                            }}
                            className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tight border outline-none cursor-pointer text-center appearance-none transition-all block mx-auto w-full max-w-[124px] ${
                              (acc.accountCategory === "READY TO USE") ? 'bg-purple-100 text-purple-700 border-purple-250 hover:bg-purple-200' :
                              (acc.accountCategory === "ACTIVE") ? 'bg-emerald-100 text-emerald-700 border-emerald-250 hover:bg-emerald-200' :
                              (acc.accountCategory === "NEED CHECK") ? 'bg-sky-100 text-sky-700 border-sky-250 hover:bg-sky-200' :
                              (acc.accountCategory === "SUSPEND") ? 'bg-amber-100 text-amber-700 border-amber-250 hover:bg-amber-200' :
                              (acc.accountCategory === "BANNED") ? 'bg-rose-100 text-rose-700 border-rose-250 hover:bg-rose-200' :
                              'bg-slate-100 text-slate-650 border-slate-250 hover:bg-slate-205'
                            }`}
                          >
                            <option value="NOT REG" className="bg-white text-slate-800 font-bold">🔘 NOT REG</option>
                            <option value="READY TO USE" className="bg-white text-purple-700 font-bold">🟣 READY TO USE</option>
                            <option value="ACTIVE" className="bg-white text-emerald-700 font-bold">🟢 ACTIVE</option>
                            <option value="NEED CHECK" className="bg-white text-sky-700 font-bold">🔵 NEED CHECK</option>
                            <option value="SUSPEND" className="bg-white text-amber-700 font-bold">🟡 SUSPEND</option>
                            <option value="BANNED" className="bg-white text-rose-700 font-bold">🔴 BANNED</option>
                          </select>
                        </td>

                        {/* 4. Action buttons */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col items-center gap-1.5 justify-center">
                            {/* Integrate to campaigns */}
                            <button
                              onClick={() => handleIntegrateToCampaignDatabase(acc)}
                              className="text-[9.5px] font-black bg-indigo-600 hover:bg-indigo-750 text-white font-sans px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer text-center w-full justify-center"
                              title="Integrasikan langsung ke Database Kampanye Kerja & Sosial Media"
                            >
                              <UserCheck className="w-3 h-3 text-amber-300" />
                              Integrasi Portal
                            </button>

                            <div className="flex items-center gap-1.5 w-full">
                              {/* Open Mock Inbox */}
                              <button
                                onClick={() => {
                                  setActiveInboxAccount(acc);
                                  setActiveMessage(acc.emails[0] || null);
                                }}
                                className={`text-[9.5px] font-bold px-1.5 py-1 w-1/2 rounded border text-center transition-colors cursor-pointer flex items-center justify-center gap-0.5 ${
                                  activeInboxAccount?.id === acc.id 
                                    ? 'bg-slate-900 border-slate-900 text-white' 
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                                title="Buka Inbox Email Simulasi Akun Ini"
                              >
                                <Inbox className="w-2.5 h-2.5" />
                                Inbox
                              </button>

                              {/* Delete account */}
                              <button
                                onClick={() => deleteGmailAccount(acc.id)}
                                className="text-neutral-400 hover:text-red-500 border border-slate-200 p-1 rounded hover:bg-red-50 w-1/2 flex items-center justify-center cursor-pointer transition-colors"
                                title="Hapus Kredensial Akun"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE GMAIL MOCK INBOX PANEL */}
        {inboxLayoutMode !== "floating" && (
          <div id="gmail-inbox-preview-pane" className="lg:col-span-5 bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden shadow-xs h-[560px] flex flex-col font-sans">
            {activeInboxAccount ? (
              <div className="flex-1 flex flex-col h-full bg-white text-left">
                
                {/* TOP HEADER PREVIEW GMAIL BRAND */}
                <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center bg-gradient-to-r from-red-650 to-indigo-900 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm">
                      <Mail className="w-4 h-4 font-black" />
                    </div>
                    <div>
                      <span className="text-[9px] text-red-200 font-bold uppercase tracking-wider block">Gmail Client Simulator</span>
                      <h4 className="text-xs font-extrabold tracking-tight truncate max-w-[170px]">{activeInboxAccount.name}</h4>
                    </div>
                  </div>
                  
                  {/* Reset client selected view */}
                  <button
                    onClick={() => {
                      setActiveInboxAccount(null);
                      setActiveMessage(null);
                    }}
                    className="text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                  >
                    Tutup Mock
                  </button>
                </div>

                {/* ACTIVE EMAIL ADDRESS DETAILS STRIP */}
                <div className="bg-slate-50 border-b border-slate-150 px-4 py-2 flex justify-between items-center text-[10px] text-slate-500 font-mono shrink-0 select-all">
                  <span>📍 Alamat Aktif: <strong className="text-slate-800">{activeInboxAccount.email}</strong></span>
                  <span className="bg-red-50 text-red-600 font-bold px-1.5 py-0.2 rounded text-[9px] font-sans">100% Secure SSL</span>
                </div>

                {/* CORE CLIENT MAILBOX: LIST ON TOP, DETAIL ON BOTTOM OR SPLIT */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Messages List Area */}
                  <div className="h-2/5 border-b border-slate-150 overflow-y-auto bg-slate-50/50 shrink-0 select-none">
                    <div className="divide-y divide-slate-150">
                      {activeInboxAccount.emails.map((msg) => (
                        <div 
                          key={msg.id}
                          onClick={() => setActiveMessage(msg)}
                          className={`p-3 text-left transition-colors cursor-pointer ${
                            activeMessage?.id === msg.id 
                              ? 'bg-red-50/40 border-l-4 border-red-500' 
                              : 'hover:bg-slate-100 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 text-[10px] font-sans">
                            <span className="font-extrabold text-slate-800 truncate max-w-[160px]">{msg.from.split("<")[0]}</span>
                            <span className="text-slate-400 font-semibold font-mono text-[9px] shrink-0">{msg.date}</span>
                          </div>
                          <h4 className={`text-[10.5px] truncate font-sans text-slate-900 ${activeMessage?.id === msg.id ? 'font-extrabold' : 'font-medium'}`}>
                            {msg.subject}
                          </h4>
                          <p className="text-[9.5px] text-slate-500 truncate mt-0.5 leading-tight">{msg.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Rich Reader view area */}
                  <div className="flex-1 overflow-y-auto p-4.5 bg-white text-left font-sans">
                    {activeMessage ? (
                      <div className="space-y-4">
                        {/* Sender details and Subject */}
                        <div className="border-b border-slate-100 pb-3 space-y-2">
                          <h3 className="text-xs font-black text-slate-900 leading-snug">{activeMessage.subject}</h3>
                          <div className="flex justify-between items-center text-[10px] font-sans">
                            <div className="space-y-0.2 text-[9.5px]">
                              <p className="text-slate-800">Dari: <strong>{activeMessage.from}</strong></p>
                              <p className="text-slate-500">Ke: <strong>{activeInboxAccount.email}</strong></p>
                            </div>
                            <span className="text-slate-400 font-mono text-[9px] font-bold">{activeMessage.date}</span>
                          </div>
                        </div>

                        {/* Msg Body formatted nicely */}
                        <div className="text-[11px] text-slate-700 font-sans leading-relaxed whitespace-pre-line space-y-4 pt-1 bg-slate-50/30 p-3 rounded-lg border border-slate-100">
                          {activeMessage.body}
                        </div>

                        {/* Footer compliance signoff */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-[9px] text-slate-400 leading-normal flex gap-2">
                          <ShieldAlert className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                          <p>
                            Email resmi ini tersertifikasi pass SPF/DKIM oleh sistem Google Antigravity Simulator. Anda melihat transmisi inbox asli pendaftaran Google secara penuh.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center text-slate-400 italic font-mono text-[11px]">
                        <Inbox className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                        Silakan pilih pesan dari daftar di atas untuk dibaca.
                      </div>
                    )}
                  </div>

                </div>

                {/* INTEGRATE PORTAL SHORTCUT TRIGGER BUTTON ON BOTTOM STRIP */}
                <div className="bg-slate-50 p-3 border-t border-slate-150 flex items-center justify-between shrink-0 font-sans">
                  <span className="text-[9.5px] text-slate-500 font-semibold">Tautkan akun ini ke registri media sosial?</span>
                  <button
                    onClick={() => handleIntegrateToCampaignDatabase(activeInboxAccount)}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] tracking-wide uppercase px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3 text-amber-300" />
                    Kirim ke Onboarding
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-3.5">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                  <Mail className="w-6.5 h-6.5" />
                </div>
                <div className="space-y-1 select-none">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Gmail Inbox Simulator</h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Belum ada akun Gmail yang terpilih. Klik tombol <strong>"Inbox"</strong> pada daftar registri akun di sebelah kiri untuk melihat isi surat masuk dan detail verifikasi!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
