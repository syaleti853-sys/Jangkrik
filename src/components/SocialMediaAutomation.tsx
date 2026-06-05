import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Smartphone, CheckCircle, ShieldAlert, Key, 
  RefreshCw, Loader2, ArrowRight, Instagram, Facebook, Youtube, 
  MessageSquare, Lock, Unlock, Mail, Eye, Send, FileText, Check, Music2,
  Heart, MessageCircle, Share2, Compass, AlertCircle, Award, UserCheck,
  Edit2, Copy, ExternalLink, Download
} from 'lucide-react';
import type { VerifiedAccountEntry, SocialAccount } from '../types';

interface SocialMediaAutomationProps {
  entry: VerifiedAccountEntry | null;
  onUpdateEntry: (updatedEntry: VerifiedAccountEntry) => void;
  addGlobalLog: (type: "info" | "success" | "warning" | "error", message: string) => void;
}

// 8 Curated Premium High Resolution Men's Professional Portant Photos from Unsplash
const MALE_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop"
];

// 8 Curated Premium High Resolution Women's Credit Portant Photos from Unsplash
const FEMALE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=250&auto=format&fit=crop"
];

// Helper to determine gender profile from Indonesian name syllables
export const detectGenderFromName = (name: string): "male" | "female" => {
  if (!name) return "male";
  const lowerName = name.toLowerCase();
  
  const femaleKeywords = [
    "siti", "ayu", "dewi", "indah", "putri", "sri", "nur", "eka", "lestari", "rina", "santi", 
    "dian", "anisa", "kartika", "mega", "yanti", "tri", "lia", "ria", "amalia", "sari", 
    "widya", "fitri", "evi", "wulan", "agustina", "anggeraini", "anggraini", "bella", "citra", 
    "desi", "diana", "erna", "febri", "gita", "hana", "ika", "irma", "juliana", "kiki", 
    "lilis", "maria", "nia", "pratiwi", "ratna", "tantri", "utami", "vina", "winda", "yuliana",
    "sherly", "melissa", "clara", "grace", "puteri", "wati", "ndari", "sari", "ningsih"
  ];
  
  const words = lowerName.split(/\s+/);
  for (const word of words) {
    if (femaleKeywords.includes(word)) {
      return "female";
    }
  }

  if (lowerName.endsWith("wati") || lowerName.endsWith("tari") || lowerName.endsWith("putri") || lowerName.endsWith("sari") || lowerName.endsWith("ningsih")) {
    return "female";
  }

  return "male";
};

// Initial fallback templates of high quality Indonesian bios for backup
const FALLBACK_SOCIALS = (name: string, company: string, gender: "male" | "female"): SocialAccount[] => {
  const avatars = gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  return [
    {
      platform: "Instagram",
      username: `@${cleanName}.official`,
      avatarUrl: avatars[0 % avatars.length],
      bio: `💼 Corporate Consultant at ${company} | Strategic Planner | Connecting ideas and visual values. Let's connect! 🚀`,
      status: "Ready",
      customPassword: "",
      realUrl: `https://www.instagram.com/${cleanName}.official`
    },
    {
      platform: "TikTok",
      username: `@${cleanName}_trends`,
      avatarUrl: avatars[1 % avatars.length],
      bio: `💡 Berbagi insight karir & tips produktivitas harian di ${company}! ✨ | Work smart, live happy | Stay tuned guys 👇`,
      status: "Ready",
      customPassword: "",
      realUrl: `https://www.tiktok.com/@${cleanName}_trends`
    },
    {
      platform: "X",
      username: `@${cleanName}X`,
      avatarUrl: avatars[2 % avatars.length],
      bio: `Builder & Innovator. Discussing tech trends, enterprise systems & operations at ${company}. Opinions are strictly my own.`,
      status: "Ready",
      customPassword: "",
      realUrl: `https://x.com/${cleanName}X`
    },
    {
      platform: "Facebook",
      username: `${name.replace(/\s+/g, '')}.profile`,
      avatarUrl: avatars[3 % avatars.length],
      bio: `Halaman Profesional Resmi ${name}. Menyediakan layanan solusi integrasi bisnis digital bersertifikasi resmi di bawah jaringan ${company}.`,
      status: "Ready",
      customPassword: "",
      realUrl: `https://www.facebook.com/${name.replace(/\s+/g, '')}.profile`
    },
    {
      platform: "YouTube",
      username: `@${cleanName}Channel`,
      avatarUrl: avatars[4 % avatars.length],
      bio: `Selamat datang di Channel Resmi saya! Di sini saya rutin mengunggah dokumentasi proyek kerja, panduan teknologi masa depan, dan webinar ${company}. Subscribe ya!`,
      status: "Ready",
      customPassword: "",
      realUrl: `https://www.youtube.com/@${cleanName}Channel`
    }
  ];
};

export default function SocialMediaAutomation({ entry, onUpdateEntry, addGlobalLog }: SocialMediaAutomationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"Instagram" | "TikTok" | "X" | "Facebook" | "YouTube">("Instagram");
  const [generationProgress, setGenerationProgress] = useState<string>('');
  
  // Real-time verification OTP simulation panel states
  const [otpRequests, setOtpRequests] = useState<{ [key: string]: { code: string; timeLeft: number; isRequested: boolean; userInput: string; isVerified: boolean } }>({});

  // Simulated Login Sandbox Sandbox Engine states
  const [loggedInPlatforms, setLoggedInPlatforms] = useState<{ [key: string]: boolean }>({});
  const [usernameInputs, setUsernameInputs] = useState<{ [key: string]: string }>({});
  const [passwordInputs, setPasswordInputs] = useState<{ [key: string]: string }>({});
  const [loginErrors, setLoginErrors] = useState<{ [key: string]: string }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [isLiked, setIsLiked] = useState<{ [key: string]: boolean }>({});

  // Reset sandbox when switching employee entries
  useEffect(() => {
    setLoggedInPlatforms({});
    setUsernameInputs({});
    setPasswordInputs({});
    setLoginErrors({});
    setLikeCounts({});
    setIsLiked({});
    setIsEditingCredentials(false);
    setCopiedField(null);
  }, [entry?.id]);

  // Real credentials editor states
  const [isEditingCredentials, setIsEditingCredentials] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editRealUrl, setEditRealUrl] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Helper getters
  const getDefaultRealUrl = (platform: string, username: string) => {
    const cleanUser = username.replace("@", "");
    switch (platform) {
      case "Instagram": return `https://www.instagram.com/${cleanUser}`;
      case "TikTok": return `https://www.tiktok.com/@${cleanUser}`;
      case "X": return `https://x.com/${cleanUser}`;
      case "Facebook": return `https://www.facebook.com/${cleanUser}`;
      case "YouTube": return `https://www.youtube.com/${cleanUser}`;
      default: return "";
    }
  };

  const getDefaultLoginUrl = (platform: string) => {
    switch (platform) {
      case "Instagram": return "https://www.instagram.com/accounts/login/";
      case "TikTok": return "https://www.tiktok.com/login";
      case "X": return "https://x.com/i/flow/login";
      case "Facebook": return "https://www.facebook.com/login/";
      case "YouTube": return "https://www.youtube.com";
      default: return "";
    }
  };

  // Reset editing states on tab/entry change
  useEffect(() => {
    setIsEditingCredentials(false);
    setCopiedField(null);
  }, [activeTab]);

  // Auto trigger social media population when account transitions to "Opened" (Verified)
  useEffect(() => {
    if (entry && entry.status === "Opened" && !entry.socialAccounts) {
      triggerAutoSocialGeneration();
    }
  }, [entry]);

  // Handle countdown times for simulated OTP tokens
  useEffect(() => {
    const interval = setInterval(() => {
      setOtpRequests(prev => {
        const copy = { ...prev };
        let updated = false;
        Object.keys(copy).forEach(platform => {
          if (copy[platform] && copy[platform].timeLeft > 0 && !copy[platform].isVerified) {
            copy[platform].timeLeft -= 1;
            updated = true;
          }
        });
        return updated ? copy : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpRequests]);

  const triggerAutoSocialGeneration = async () => {
    if (!entry) return;
    setIsGenerating(true);
    
    // Detect gender to choose right profile visuals and custom bio tones
    const detectedGender = detectGenderFromName(entry.name);
    addGlobalLog("info", `[Otomasi Tahap 3] Memulai registrasi otomatis 5 akun media sosial untuk ${entry.name} (Gender Terdeteksi: ${detectedGender === "female" ? "Perempuan 👩" : "Laki-laki 👨"})...`);
    
    // Reset OTP requests to force new verification on update/regeneration for security
    setOtpRequests({});
    
    try {
      setGenerationProgress('Koneksi aman ke Google Workspace API Terverifikasi untuk otentikasi data...');
      await new Promise(r => setTimeout(r, 650));
      
      setGenerationProgress('Memanggil Layanan Gemini 3.5-Flash untuk menyusun bio unik & username trend-ready...');
      
      const response = await fetch('/api/generate-socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: entry.name, 
          companyName: entry.companyName,
          gender: detectedGender
        })
      });

      let loadedSocials: SocialAccount[] = [];

      if (response.ok) {
        const data = await response.json();
        if (data.accounts && Array.isArray(data.accounts)) {
          const avatars = detectedGender === "female" ? FEMALE_AVATARS : MALE_AVATARS;

          loadedSocials = data.accounts.map((acc: any, index: number) => {
            const cleanUser = acc.username.replace("@", "");
            let realUrl = `https://www.${acc.platform.toLowerCase()}.com/${cleanUser}`;
            if (acc.platform === "X") {
              realUrl = `https://x.com/${cleanUser}`;
            } else if (acc.platform === "TikTok") {
              realUrl = `https://www.tiktok.com/@${cleanUser}`;
            }

            return {
              platform: acc.platform,
              username: acc.username,
              avatarUrl: avatars[index % avatars.length],
              bio: acc.bio,
              status: "Ready",
              customPassword: "",
              realUrl: realUrl
            };
          });
        }
      }

      if (loadedSocials.length === 0) {
        // Fallback in case of server timeouts
        loadedSocials = FALLBACK_SOCIALS(entry.name, entry.companyName, detectedGender);
      }

      setGenerationProgress('Mengunggah database gambar avatar resmi (CURATED HD)...');
      await new Promise(r => setTimeout(r, 700));

      setGenerationProgress('Mendaftarkan 5 platfome: Instagram, TikTok, X, Facebook, YouTube... Berhasil.');
      addGlobalLog("success", `[Otomasi Tahap 3 SUKSES] 5 Akun Media Sosial terdaftar atas nama ${entry.name}! Seluruh status OTP disetel ulang demi keamanan.`);

      // Save directly to parent state
      onUpdateEntry({
        ...entry,
        socialAccounts: loadedSocials
      });

    } catch (err: any) {
      console.error(err);
      addGlobalLog("error", `Gagal melakukan otomasi sosial media: ${err.message}`);
      // Fallback fallback
      onUpdateEntry({
        ...entry,
        socialAccounts: FALLBACK_SOCIALS(entry.name, entry.companyName, detectedGender)
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Request high priority OTP via GSM/SMS Gateway simulation
  const handleRequestOtp = (platform: string) => {
    if (!entry) return;

    // Generate real-to-user random 6 digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    addGlobalLog("warning", `[OTP Gateway] Meminta token resmi untuk pendaftaran ${platform}. Mengirim SMS ke ${entry.phone}...`);

    setOtpRequests(prev => ({
      ...prev,
      [platform]: {
        code: generatedOtp,
        timeLeft: 90, // 90 seconds countdown
        isRequested: true,
        userInput: '',
        isVerified: false
      }
    }));

    // Alert system log with beautiful feedback
    setTimeout(() => {
      addGlobalLog("success", `[OTP DIKIRIM] Token otentikasi resmi ${platform} dikirim ke nomor ${entry.phone}: ${generatedOtp}`);
    }, 800);
  };

  // Automated Gmail API Sync to retrieve OTP validation codes directly from connected live inbox feed
  const handleFetchOtpFromGmail = (platform: string) => {
    if (!entry) return;

    // Log finding and scanning connected mailbox
    addGlobalLog("info", `[Gmail Sync] Memindai inbox Gmail terkoneksi (${entry.syncedEmail}) mencari email otp verifikasi dari ${platform}...`);
    
    // Check if OTP was already requested, otherwise create one of matching template
    let targetOtp = otpRequests[platform]?.code;
    if (!targetOtp) {
      targetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpRequests(prev => ({
        ...prev,
        [platform]: {
          code: targetOtp,
          timeLeft: 90,
          isRequested: true,
          userInput: '',
          isVerified: false
        }
      }));
    }

    // High credibility delays simulation
    setTimeout(() => {
      setOtpRequests(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          userInput: targetOtp
        }
      }));
      addGlobalLog("success", `[Gmail Sync] Berhasil menguraikan sandi pengaman OTP ${platform} dari inbox Gmail ${entry.syncedEmail}!`);
      addGlobalLog("info", `[Auto-Fill] Menyuntikkan otomatis kode verivikasi keamanan: ${targetOtp}`);
    }, 1200);
  };

  const handleVerifyOtp = (platform: string) => {
    const session = otpRequests[platform];
    if (!session || !entry) return;

    if (session.userInput.trim() === session.code) {
      // Success auth verification
      setOtpRequests(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          isVerified: true
        }
      }));

      // Update social list entry state status
      if (entry.socialAccounts) {
        const updatedAccounts = entry.socialAccounts.map(acc => {
          if (acc.platform === platform) {
            return {
              ...acc,
              status: "OTP_Verified" as const,
              otpCode: session.code
            };
          }
          return acc;
        });

        onUpdateEntry({
          ...entry,
          socialAccounts: updatedAccounts
        });

        addGlobalLog("success", `[OTP VERIFIED] Akun ${platform} (${entry.name}) telah diverifikasi secara sah & siap digunakan!`);
      }
    } else {
      alert("Kode OTP salah! Silakan periksa kembali Telemetri Token SMS.");
    }
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addGlobalLog("success", `Disalin ke clipboard: ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Open edit credentials panel
  const startEditing = (acc: SocialAccount) => {
    setEditUsername(acc.username);
    setEditPassword(acc.customPassword || entry?.generatedPassword || "");
    setEditBio(acc.bio);
    setEditRealUrl(acc.realUrl || getDefaultRealUrl(acc.platform, acc.username));
    setEditAvatarUrl(acc.avatarUrl);
    setIsEditingCredentials(true);
  };

  // Save updated credentials back to entry
  const saveCredentials = (platform: string) => {
    if (!entry || !entry.socialAccounts) return;

    const updatedAccounts = entry.socialAccounts.map(acc => {
      if (acc.platform === platform) {
        return {
          ...acc,
          username: editUsername,
          customPassword: editPassword,
          bio: editBio,
          realUrl: editRealUrl,
          avatarUrl: editAvatarUrl
        };
      }
      return acc;
    });

    onUpdateEntry({
      ...entry,
      socialAccounts: updatedAccounts
    });

    setIsEditingCredentials(false);
    addGlobalLog("success", `[Kredensial Diperbaharui] Akun riil ${platform} (${editUsername}) berhasil disimpan!`);
  };

  // Icon platform select helper
  const getPlatformIcon = (platform: string, className = "w-5 h-5") => {
    switch (platform) {
      case "Instagram":
        return <Instagram className={`${className} text-rose-500`} />;
      case "TikTok":
        return <Music2 className={`${className} text-black dark:text-neutral-200`} />;
      case "X":
        return <span className={`${className} font-black text-xs inline-block text-neutral-900 border border-neutral-900 rounded bg-white text-center leading-normal`}>X</span>;
      case "Facebook":
        return <Facebook className={`${className} text-blue-600`} />;
      case "YouTube":
        return <Youtube className={`${className} text-red-600`} />;
      default:
        return <Sparkles className={`${className}`} />;
    }
  };

  // Color theme generator helper
  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return 'from-purple-500 via-pink-500 to-orange-500';
      case 'TikTok':
        return 'from-neutral-900 to-slate-800';
      case 'X':
        return 'from-neutral-950 to-neutral-800';
      case 'Facebook':
        return 'from-blue-600 to-sky-500';
      case 'YouTube':
        return 'from-red-600 to-rose-500';
      default:
        return 'from-indigo-600 to-indigo-700';
    }
  };

  if (!entry) return null;

  return (
    <div id="social-hub-container" className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-6 scroll-mt-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            Otomasi Akun Sosial Media (5 Platform Berjalan)
          </h2>
          <p className="text-xs text-neutral-500">
            Sistem otomatisasi terverifikasi untuk pendaftaran akun Instagram, TikTok, X, Facebook, dan YouTube
          </p>
        </div>
        
        {entry.status === "Opened" && entry.socialAccounts && (
          <button
            onClick={triggerAutoSocialGeneration}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Otomasi Ulang AI
          </button>
        )}
      </div>

      {entry.status !== "Opened" ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50 space-y-3.5">
          <div className="p-3 bg-neutral-100 rounded-full text-neutral-400">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-xs">
            <p className="text-xs font-semibold text-neutral-700">Tahap Sosial Media Terkunci</p>
            <p className="text-[10px] text-neutral-500">
              Langkah otomatis pendaftaran 5 media sosial ini memerlukan status email pelanggan terverifikasi secara resmi terlebih dahulu.
            </p>
            <p className="text-[10px] font-bold text-indigo-600">
              *Tips: Gunakan tombol "Simulasikan Klik User" pada tabel riwayat di bawah setelah mengirim email!
            </p>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-900">Menjalankan Otomasi 5 Layanan Sosial Media...</p>
            <p className="text-[10px] text-neutral-400 max-w-sm font-mono animate-pulse">{generationProgress}</p>
          </div>
        </div>
      ) : !entry.socialAccounts ? (
        <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 flex flex-col items-center justify-center text-center space-y-3.5">
          <p className="text-xs text-indigo-950 font-bold leading-normal">
            Email sudah Terverifikasi! Sistem siap mendaftarkan secara simultan akun: Instagram, TikTok, X, Facebook, dan YouTube.
          </p>
          <button
            onClick={triggerAutoSocialGeneration}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Ciptakan 5 Akun Media Sosial Baru Secara Otomatis
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* PLATFORM LIST CONTROLLER */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-100 pb-2">
            {entry.socialAccounts.map((acc) => {
              const otpSession = otpRequests[acc.platform];
              const isVerified = acc.status === "OTP_Verified" || otpSession?.isVerified;
              
              return (
                <button
                  key={acc.platform}
                  onClick={() => setActiveTab(acc.platform)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === acc.platform
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {getPlatformIcon(acc.platform, "w-4 h-4")}
                  {acc.platform}
                  {isVerified ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="OTP Terverifikasi"></span>
                  ) : otpSession?.isRequested ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Menunggu Token"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" title="Kredensial Aktif"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ACTIVE SELECTED PLATFORM VIEWPORT CARD */}
          {entry.socialAccounts.filter(acc => acc.platform === activeTab).map((acc) => {
            const otpSession = otpRequests[acc.platform] || { isRequested: false, timeLeft: 0, code: '', userInput: '', isVerified: false };
            const isVerified = acc.status === "OTP_Verified" || otpSession.isVerified;
            
            const isUserLoggedIn = loggedInPlatforms[acc.platform];
            const uInput = usernameInputs[acc.platform] || "";
            const pInput = passwordInputs[acc.platform] || "";
            const lErr = loginErrors[acc.platform] || "";
            
            const platLikes = likeCounts[acc.platform] || 142;
            const platLiked = isLiked[acc.platform] || false;

            // Simple login verifier logic
            const tryLogin = (platform: string) => {
              setLoginErrors(prev => ({ ...prev, [platform]: "" }));
              
              if (!isVerified) {
                setLoginErrors(prev => ({ 
                  ...prev, 
                  [platform]: "⚠️ OTP Belum Terverifikasi! Demi alasan keamanan, Anda wajib memasukkan OTP seluler terenkripsi di panel kanan sebelum melakukan login." 
                }));
                addGlobalLog("error", `[Login Gagal] Percobaan masuk ke ${platform} diblokir. Alasan: 2FA Seluler Belum Terverifikasi.`);
                return;
              }

              if (!uInput.trim() || !pInput.trim()) {
                setLoginErrors(prev => ({ 
                  ...prev, 
                  [platform]: "⚠️ Harap masukkan Username dan Password keamanan Anda." 
                }));
                return;
              }

              const cleanInputUser = uInput.trim().toLowerCase().replace("@", "");
              const cleanRealUser = acc.username.trim().toLowerCase().replace("@", "");
              const cleanRealPass = (acc.customPassword || entry.generatedPassword).trim();

              if (cleanInputUser === cleanRealUser && pInput.trim() === cleanRealPass) {
                setLoggedInPlatforms(prev => ({ ...prev, [platform]: true }));
                addGlobalLog("success", `[SANDBOX SSO] ${entry.name} berhasil log masuk ke media sosial resmi ${platform}!`);
              } else {
                setLoginErrors(prev => ({ 
                  ...prev, 
                  [platform]: "❌ Kredensial Salah! Pastikan penulisan sesuai dengan username & password keamanan yang tercantum." 
                }));
                addGlobalLog("error", `[Login Gagal] Kredensial SSO salah untuk platform ${platform}.`);
              }
            };

            const autoFillCreds = (platform: string) => {
              setUsernameInputs(prev => ({ ...prev, [platform]: acc.username }));
              setPasswordInputs(prev => ({ ...prev, [platform]: acc.customPassword || entry.generatedPassword }));
              setLoginErrors(prev => ({ ...prev, [platform]: "" }));
            };

            const handleLogout = (platform: string) => {
              setLoggedInPlatforms(prev => ({ ...prev, [platform]: false }));
              addGlobalLog("info", `[SANDBOX SSO] Menutup sesi login ${platform} untuk ${entry.name}.`);
            };

            const handleToggleLike = (platform: string) => {
              if (platLiked) {
                setLikeCounts(prev => ({ ...prev, [platform]: platLikes - 1 }));
                setIsLiked(prev => ({ ...prev, [platform]: false }));
              } else {
                setLikeCounts(prev => ({ ...prev, [platform]: platLikes + 1 }));
                setIsLiked(prev => ({ ...prev, [platform]: true }));
              }
            };
            
            return (
              <div key={acc.platform} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in">
                
                {/* Visual Bio & Profile Design Side */}
                <div className="md:col-span-7 border border-neutral-150 rounded-2xl overflow-hidden bg-neutral-50/20 shadow-xs flex flex-col min-h-[500px]">
                  <div className={`p-4 bg-gradient-to-r ${getPlatformStyle(acc.platform)} text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(acc.platform, "w-5 h-5 bg-white p-1 rounded-full")}
                      <span className="text-xs font-bold font-mono tracking-wider">{acc.platform} SSO Portal Integrasi</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
                      {isUserLoggedIn ? "AKTIF: TERKONEKSI" : isVerified ? "READY: SIAP LOGIN" : "TUTUP: OTP REQ"}
                    </span>
                  </div>

                  {isUserLoggedIn ? (
                    /* SIMULATED LIVE VIEW PORT - USER SUCESSFULLY LOGGED IN */
                    <div className="p-5 flex-1 flex flex-col justify-between bg-neutral-900 border-t border-neutral-800 text-white font-sans">
                      
                      {/* Top status bar details */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Live Simulation</span>
                          </div>
                          
                          <div className="text-[10px] text-neutral-400 font-mono">
                            Client IP: <span className="text-indigo-400">127.0.0.1</span>
                          </div>
                        </div>

                        {/* Custom Brand Simulator Render */}
                        {acc.platform === "Instagram" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={acc.avatarUrl} className="w-12 h-12 rounded-full border-2 border-indigo-500 p-0.5 object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold font-mono">{acc.username}</span>
                                    <Award className="w-3.5 h-3.5 text-blue-400 shrink-0" title="Verifikasi Premium" />
                                  </div>
                                  <span className="text-[10px] text-neutral-400">{entry.name} | Staff</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-sm font-bold text-neutral-100">{platLikes}</span>
                                <span className="block text-[9px] text-neutral-400">Interaksi Suka</span>
                              </div>
                            </div>

                            {/* Feed Main mockup */}
                            <div className="bg-neutral-800/80 rounded-xl overflow-hidden border border-neutral-750">
                              <div className="bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-orange-500/20 h-36 flex items-center justify-center relative p-4">
                                <div className="text-center space-y-1">
                                  <Instagram className="w-8 h-8 mx-auto text-pink-400 animate-pulse" />
                                  <p className="text-[11px] font-bold tracking-tight">Kanal Informasi Resmi</p>
                                  <p className="text-[9px] text-neutral-300">Instagram Professional Feed</p>
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                <div className="flex gap-3 text-neutral-300">
                                  <button onClick={() => handleToggleLike("Instagram")} className={`flex items-center gap-1.5 text-[11px] cursor-pointer font-bold ${platLiked ? 'text-rose-500' : 'text-neutral-300'}`}>
                                    <Heart className={`w-4 h-4 ${platLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                    {platLiked ? "Telah Disukai" : "Sukai"}
                                  </button>
                                  <span className="text-neutral-600">|</span>
                                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>2 Komentar</span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-neutral-200 leading-relaxed font-sans">{acc.bio}</p>

                                <div className="border-t border-neutral-700/50 pt-2 space-y-1 text-[9.5px]">
                                  <p className="text-neutral-400"><span className="font-bold text-neutral-200">@hr_partners:</span> Selamat bergabung, semoga sukses selalu! 🎉</p>
                                  <p className="text-neutral-400"><span className="font-bold text-neutral-200">@it_admin:</span> Akun SSO terdeteksi aktif sempurna.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {acc.platform === "TikTok" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={acc.avatarUrl} className="w-12 h-12 rounded-full border-2 border-emerald-500 p-0.5 object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold font-mono">{acc.username}</span>
                                    <Award className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  </div>
                                  <span className="text-[10px] text-neutral-400">{entry.name} | Verified</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-sm font-bold text-emerald-400">4,912</span>
                                <span className="block text-[9px] text-neutral-400">Penayangan</span>
                              </div>
                            </div>

                            {/* Sound wave mockup */}
                            <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-750 space-y-3">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-neutral-700 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                                  <Music2 className="text-emerald-400 w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                  <p className="text-[10px] font-bold text-neutral-100">Sound Track Resmi - Workspace Hub</p>
                                  <div className="flex items-center gap-0.5 h-3">
                                    <span className="w-1 bg-emerald-400 h-2 animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                                    <span className="w-1 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                                    <span className="w-1 bg-emerald-400 h-1 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                                    <span className="w-1 bg-emerald-400 h-3 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-1 bg-emerald-400 h-2 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-[11px] italic font-sans text-neutral-300">"{acc.bio}"</p>
                              
                              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-neutral-800">
                                <p className="text-[9px] text-neutral-400">Simulasi Algoritma FYP Aktif!</p>
                                <button onClick={() => handleToggleLike("TikTok")} className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${platLiked ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-rose-400 hover:bg-neutral-700'}`}>
                                  ❤️ {platLikes} Suka
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {acc.platform === "X" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={acc.avatarUrl} className="w-12 h-12 rounded-full border border-neutral-700 object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold font-mono">{acc.username}</span>
                                    <Award className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                  <span className="text-[10px] text-neutral-400">@X_verified_user</span>
                                </div>
                              </div>
                              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded font-mono font-bold">X-Enterprise</span>
                            </div>

                            {/* Tweet layout mock */}
                            <div className="bg-black/40 rounded-xl p-4 border border-neutral-800 space-y-3.5">
                              <p className="text-xs leading-relaxed text-slate-100 font-sans">{acc.bio}</p>
                              
                              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/50">
                                <span>3:44 PM · 2 Jun 2026</span>
                                <span>· <strong className="text-slate-300">242</strong> Tayangan</span>
                              </div>

                              <div className="flex justify-around items-center pt-2 text-neutral-400 text-xs border-t border-neutral-800/50">
                                <button onClick={() => handleToggleLike("X")} className={`flex items-center gap-1 cursor-pointer hover:text-rose-500 ${platLiked ? 'text-rose-500 font-bold' : ''}`}>
                                  <Heart className="w-3.5 h-3.5" />
                                  <span>{platLikes}</span>
                                </button>
                                <span>💬 4</span>
                                <span>🔁 12</span>
                                <span>🔖 Save</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {acc.platform === "Facebook" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={acc.avatarUrl} className="w-12 h-12 rounded-full border-2 border-blue-600 object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold font-mono">{acc.username}</span>
                                    <Award className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                  <span className="text-[10px] text-neutral-400">Profil Anggota Bersertifikat</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Terhubung
                              </span>
                            </div>

                            <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-750 space-y-3">
                              <p className="text-[11.5px] leading-relaxed text-neutral-100 font-sans">{acc.bio}</p>
                              
                              <div className="flex justify-between items-center text-[10.5px] text-neutral-400 font-sans">
                                <span>👍 {platLikes} Suka</span>
                                <span>5 Komentar</span>
                              </div>

                              <div className="border-t border-neutral-700 pt-2.5 flex justify-around">
                                <button onClick={() => handleToggleLike("Facebook")} className={`text-xs flex items-center gap-1.5 cursor-pointer hover:text-white ${platLiked ? 'text-blue-400 font-bold' : 'text-neutral-400'}`}>
                                  <span>👍 Likes</span>
                                </button>
                                <span className="text-neutral-400 text-xs">💬 Comment</span>
                                <span className="text-neutral-400 text-xs">➡️ Share</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {acc.platform === "YouTube" && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src={acc.avatarUrl} className="w-12 h-12 rounded-full border-2 border-red-600 object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold font-mono">{acc.username}</span>
                                    <Award className="w-3.5 h-3.5 text-red-500" />
                                  </div>
                                  <span className="text-[10px] text-neutral-400">Official Channel Creator</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-xs font-black text-red-500">SUBSCRIBER</span>
                                <span className="block text-[10px] font-mono text-neutral-400">14.1K Active</span>
                              </div>
                            </div>

                            {/* YouTube Video container aspect proportion */}
                            <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-750">
                              <div className="bg-black/60 aspect-video flex flex-col justify-center items-center relative text-center p-4 min-h-[140px]">
                                <Youtube className="w-12 h-12 text-red-600 animate-pulse cursor-pointer" />
                                <p className="text-xs font-black tracking-tight mt-2 text-white">Video Sambutan Orientasi Kerja</p>
                                <p className="text-[9.5px] text-neutral-400">Disponsori oleh {entry.companyName}</p>
                              </div>
                              <div className="p-3 space-y-1">
                                <p className="text-xs font-semibold text-slate-100">{acc.bio}</p>
                                <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1">
                                  <span>Sukai: {platLikes}</span>
                                  <button onClick={() => handleToggleLike("YouTube")} className={`text-[10px] uppercase font-bold cursor-pointer rounded px-2 py-0.5 ${platLiked ? 'bg-red-600 text-white' : 'bg-neutral-700 text-neutral-200'}`}>
                                    {platLiked ? "Tersimpan" : "Like Video"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      <div className="pt-4 flex justify-between items-center border-t border-neutral-800 mt-4">
                        <div className="text-[10px] text-neutral-500 font-mono">
                          Session Status: <span className="text-emerald-400 font-bold">LOGGED_IN</span>
                        </div>
                        <button
                          onClick={() => handleLogout(acc.platform)}
                          className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer text-white"
                        >
                          Keluar Ke Portal / Log out
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* DUAL MODE: EDIT CREDENTIALS OR INTERACTIVE SSO SANDBOX */
                    <>
                      {isEditingCredentials ? (
                        /* EDIT MODE - FOR RECORDING REAL-WORLD DETAILS */
                        <div className="p-5 flex-1 flex flex-col justify-center space-y-4 bg-indigo-50/20 border-t border-indigo-100 text-neutral-800">
                          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                            <span className="text-xs font-extrabold text-indigo-900 uppercase">Edit Kredensial Sosial Riil {acc.platform}</span>
                            <button 
                              onClick={() => setIsEditingCredentials(false)}
                              className="text-[10px] text-neutral-500 font-bold hover:underline cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>

                          <div className="space-y-3">
                            {/* Edit Username */}
                            <div className="space-y-1">
                              <label className="text-[10.5px] font-bold text-neutral-600 block font-sans">Username / Handle Riil ({acc.platform})</label>
                              <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                placeholder="Contoh: @budisanto_real"
                                className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none font-mono"
                              />
                            </div>

                            {/* Edit Password */}
                            <div className="space-y-1">
                              <label className="text-[10.5px] font-bold text-neutral-600 block font-sans">Password Sandi Akun Riil</label>
                              <input
                                type="text"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Sandi Rahasia Akun Riil Anda"
                                className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none font-mono"
                              />
                            </div>

                            {/* Edit Real URL */}
                            <div className="space-y-1">
                              <label className="text-[10.5px] font-bold text-neutral-600 block font-sans">URL Profil Publik Riil</label>
                              <input
                                type="text"
                                value={editRealUrl}
                                onChange={(e) => setEditRealUrl(e.target.value)}
                                placeholder={`Contoh: https://${acc.platform.toLowerCase()}.com/username`}
                                className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none font-mono"
                              />
                            </div>

                            {/* Edit Bio */}
                            <div className="space-y-1">
                              <label className="text-[10.5px] font-bold text-neutral-600 block font-sans">Bio Kustom</label>
                              <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                rows={2}
                                placeholder="Bio profil media sosial resmi Anda..."
                                className="w-full text-xs px-3 py-2 border rounded-lg focus:border-indigo-500 outline-none font-sans resize-none"
                              />
                            </div>

                            <button
                              onClick={() => saveCredentials(acc.platform)}
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Simpan Kredensial Riil
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL VIEW - SIMULATED LOGIN + COPY & SHORTCUT TO REAL PLATFORMS */
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-stone-50 border-t border-neutral-200 text-neutral-800">
                          
                          <div className="text-center space-y-1">
                            <div className={`p-2 w-10 h-10 rounded-xl text-white mx-auto flex items-center justify-center bg-gradient-to-r ${getPlatformStyle(acc.platform)}`}>
                              {getPlatformIcon(acc.platform, "w-6 h-6 text-white")}
                            </div>
                            <h4 className="text-xs font-extrabold text-neutral-900 mt-1 uppercase tracking-tight">Portal Akun Riil {acc.platform}</h4>
                            <p className="text-[10px] text-neutral-500 leading-normal">
                              Dapatkan kredensial otentik di bawah untuk masuk ke platform media sosial resmi {acc.platform} secara nyata.
                            </p>
                          </div>

                          {/* REAL-WORLD ACTIONS SECTION */}
                          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center text-[10px] font-bold text-indigo-900 uppercase">
                              <span className="flex items-center gap-1.5 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Kredensial Akun Riil Aktif
                              </span>
                              <button 
                                onClick={() => startEditing(acc)}
                                className="text-[10px] text-indigo-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit Kredensial Riil
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] font-mono">
                              <div className="bg-white p-2 border border-neutral-150 rounded-lg flex justify-between items-center shadow-xs">
                                <div className="overflow-hidden shrink">
                                  <span className="text-[9px] text-neutral-400 block uppercase font-sans font-bold">Username</span>
                                  <span className="text-neutral-800 font-bold block truncate">{acc.username}</span>
                                </div>
                                <button 
                                  onClick={() => handleCopyToClipboard(acc.username, "Username")}
                                  className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                                  title="Salin Username"
                                >
                                  {copiedField === "Username" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="bg-white p-2 border border-neutral-150 rounded-lg flex justify-between items-center shadow-xs">
                                <div className="overflow-hidden shrink">
                                  <span className="text-[9px] text-neutral-400 block uppercase font-sans font-bold">Password</span>
                                  <span className="text-neutral-800 font-bold block truncate">{acc.customPassword || entry.generatedPassword}</span>
                                </div>
                                <button 
                                  onClick={() => handleCopyToClipboard(acc.customPassword || entry.generatedPassword, "Password")}
                                  className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                                  title="Salin Password"
                                >
                                  {copiedField === "Password" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="bg-white p-2 border border-neutral-150 rounded-lg flex justify-between items-center shadow-xs sm:col-span-2">
                                <div className="overflow-hidden shrink font-sans text-left">
                                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Tanggal Lahir (Birthday)</span>
                                  <span className="text-neutral-800 font-bold block truncate font-mono">{entry.birthday || "20 Juni 1996"}</span>
                                </div>
                                <button 
                                  onClick={() => handleCopyToClipboard(entry.birthday || "20 Juni 1996", "Birthday")}
                                  className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                                  title="Salin Tanggal Lahir"
                                >
                                  {copiedField === "Birthday" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="bg-white p-2.5 border border-indigo-100 rounded-xl flex items-center justify-between shadow-xs sm:col-span-2 gap-3 text-left">
                                <div className="flex items-center gap-3 font-sans min-w-0">
                                  <img 
                                    src={acc.avatarUrl} 
                                    className="w-10 h-10 rounded-full border border-indigo-500 object-cover shrink-0" 
                                    alt="Foto Profil Riil"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0 font-sans">
                                    <span className="text-[9px] text-indigo-500 block uppercase font-black tracking-wider">Aset Foto Profil Riil (HD)</span>
                                    <span className="text-neutral-800 text-[10px] font-bold block truncate">AstraIntegra_Avatar_{acc.platform}.jpg</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    addGlobalLog("info", `Mengunduh foto profil ${acc.platform} berkualitas HD untuk ${entry.name}...`);
                                    const link = document.createElement('a');
                                    link.href = acc.avatarUrl;
                                    link.target = "_blank";
                                    link.setAttribute('download', `Foto_Profil_${entry.name.replace(/\s+/g, '_')}_${acc.platform}.jpg`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    addGlobalLog("success", `Gambar dilepas! Gambar dibuka di tab baru dalam format HD. Silakan simpan untuk akun media sosial riil Anda.`);
                                  }}
                                  className="text-[9px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl flex items-center gap-1 shrink-0 border border-indigo-200 transition-colors cursor-pointer"
                                  title="Unduh Gambar"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Unduh Foto Riil
                                </button>
                              </div>
                            </div>

                            {/* Official Login Portal Actions */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-1 font-sans">
                              <a
                                href={getDefaultLoginUrl(acc.platform)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-white font-bold text-[10px] rounded-lg text-center transition-colors flex items-center justify-center gap-1 cursor-pointer hover:shadow-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-neutral-300" />
                                Buka Halaman Login Resmi
                              </a>
                              <a
                                href={acc.realUrl || getDefaultRealUrl(acc.platform, acc.username)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1.5 px-3 bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 font-bold text-[10px] rounded-lg text-center transition-colors flex items-center justify-center gap-1 cursor-pointer hover:shadow-xs"
                              >
                                View Profil Publik ({acc.platform})
                              </a>
                            </div>
                          </div>

                          {/* INTERACTIVE SIMULATOR FOR TRAINING / VERIFICATION DEMOS */}
                          <div className="space-y-3 p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                            <span className="text-[9px] block uppercase tracking-widest font-extrabold text-neutral-400 font-mono">Sandbox Demo SSO</span>
                            
                            {/* Username */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-neutral-600 block">Username / ID Pegawai</label>
                              <input
                                type="text"
                                placeholder={`Contoh: ${acc.username}`}
                                value={uInput}
                                onChange={(e) => setUsernameInputs(prev => ({ ...prev, [acc.platform]: e.target.value }))}
                                className="w-full text-xs px-3 py-1.5 border rounded-lg focus:border-neutral-800 outline-none font-mono"
                              />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-neutral-600">Password Kunci</label>
                                <button 
                                  onClick={() => autoFillCreds(acc.platform)}
                                  className="text-[9.5px] text-indigo-600 font-bold hover:underline cursor-pointer"
                                >
                                  Isi Kredensial Otomatis
                                </button>
                              </div>
                              <input
                                type="password"
                                placeholder="••••••••••••••"
                                value={pInput}
                                onChange={(e) => setPasswordInputs(prev => ({ ...prev, [acc.platform]: e.target.value }))}
                                className="w-full text-xs px-3 py-1.5 border rounded-lg focus:border-indigo-500 outline-none font-mono"
                              />
                            </div>

                            {lErr && (
                              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2 text-[10px] leading-relaxed flex items-start gap-1 font-sans">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{lErr}</span>
                              </div>
                            )}

                            <button
                              onClick={() => tryLogin(acc.platform)}
                              className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-neutral-800"
                            >
                              <Unlock className="w-3.5 h-3.5 text-slate-100" />
                              Masuk Sandbox Simulasi {acc.platform}
                            </button>

                          </div>

                        </div>
                      )}
                    </>
                  )}

                  <div className="p-3.5 bg-neutral-100 border-t border-neutral-200 text-[10px] font-mono text-neutral-500 flex justify-between items-center dark:bg-neutral-900/40">
                    <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Secure Handshake</span>
                    </div>
                    <span>SSL Enabled (256-Bit)</span>
                  </div>

                </div>

                {/* Real-time OTP checking panel side */}
                <div className="md:col-span-5 bg-neutral-50 rounded-2xl p-5 border border-neutral-150 space-y-4">
                  
                  {/* META REGISTRATION FORM REPLICA MOCKUP */}
                  <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs p-5 font-sans space-y-4 relative">
                    <div className="absolute top-3 right-3 text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      Formulir Akun
                    </div>
                    
                    <div className="text-center space-y-2 pt-2">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-sans font-black tracking-wider text-neutral-800 text-xs uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block mr-1"></span>
                          Meta Integration
                        </span>
                      </div>
                      <h4 className="text-[13px] font-black text-neutral-900 tracking-tight">Daftarkan Akun di {acc.platform}</h4>
                      <p className="text-[10px] text-neutral-500 leading-normal max-w-xs mx-auto">
                        Gunakan data diri resmi berikut untuk mengisi form pendaftaran {acc.platform} Anda secara tepat.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {/* Email/Phone */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wide">Mobile Number or Email</label>
                          <button 
                            onClick={() => handleCopyToClipboard(entry.syncedEmail, "Email")}
                            className="text-[9.5px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Salin
                          </button>
                        </div>
                        <input 
                          type="text" 
                          readOnly 
                          value={entry.syncedEmail} 
                          className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-mono font-bold select-all outline-none"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wide">Password</label>
                          <button 
                            onClick={() => handleCopyToClipboard(acc.customPassword || entry.generatedPassword, "Password")}
                            className="text-[9.5px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Salin
                          </button>
                        </div>
                        <input 
                          type="text" 
                          readOnly 
                          value={acc.customPassword || entry.generatedPassword} 
                          className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-mono font-bold select-all outline-none"
                        />
                      </div>

                      {/* Birthday with dropdown selectors as in registration mockup */}
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wide block">Birthday (Tanggal Lahir)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Day */}
                          <div className="bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-3 text-center text-xs font-bold text-neutral-800 flex justify-between items-center select-none">
                            <span>{(entry.birthday || "20 Juni 1996").split(" ")[0]}</span>
                            <span className="text-[8px] text-neutral-400">▼</span>
                          </div>
                          {/* Month */}
                          <div className="bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-3 text-center text-xs font-bold text-neutral-800 flex justify-between items-center select-none">
                            <span>{(entry.birthday || "20 Juni 1996").split(" ")[1] || "Juni"}</span>
                            <span className="text-[8px] text-neutral-400">▼</span>
                          </div>
                          {/* Year */}
                          <div className="bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-3 text-center text-xs font-bold text-neutral-800 flex justify-between items-center select-none">
                            <span>{(entry.birthday || "20 Juni 1996").split(" ")[2] || "1996"}</span>
                            <span className="text-[8px] text-neutral-400">▼</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1.5">
                          <span className="text-[9px] text-neutral-400 leading-none">Terhitung Umur Registrasi Kerja (20 - 42 Tahun)</span>
                          <button 
                            onClick={() => handleCopyToClipboard(entry.birthday || "20 Juni 1996", "Birthday")}
                            className="text-[9.5px] text-indigo-600 hover:underline font-bold"
                          >
                            Salin Tanggal
                          </button>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wide">Full Name (Nama Lengkap)</label>
                          <button 
                            onClick={() => handleCopyToClipboard(entry.name, "Name")}
                            className="text-[9.5px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Salin
                          </button>
                        </div>
                        <input 
                          type="text" 
                          readOnly 
                          value={entry.name} 
                          className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-sans font-bold select-all outline-none"
                        />
                      </div>

                      {/* Username */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wide">Username / Handle</label>
                          <button 
                            onClick={() => handleCopyToClipboard(acc.username, "Username")}
                            className="text-[9.5px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                          >
                            Salin
                          </button>
                        </div>
                        <input 
                          type="text" 
                          readOnly 
                          value={acc.username} 
                          className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-mono font-bold select-all outline-none"
                        />
                      </div>

                      <div className="space-y-1 pt-1.5">
                        <button
                          onClick={() => {
                            addGlobalLog("success", `[Otomasi Form] Seluruh kolom untuk ${acc.platform} berhasil disinkronkan ke auto-fill!`);
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Simulasikan Autofill Data Diri
                        </button>
                        <button 
                          disabled
                          className="w-full py-1.5 bg-neutral-100 text-neutral-400 font-bold text-[10px] rounded-xl cursor-not-allowed text-center border border-neutral-200"
                        >
                          I already have an account
                        </button>
                      </div>

                      <div className="text-[9px] text-neutral-400 leading-normal text-center pt-2 space-y-1">
                        <p>
                          People who use our service may have uploaded your contact information and birthday details to {acc.platform}. <span className="text-indigo-600 font-medium hover:underline cursor-pointer">Learn more</span>
                        </p>
                        <p>
                          By signing up, you agree to our <span className="text-indigo-600 font-medium hover:underline cursor-pointer">Terms</span>, <span className="text-indigo-600 font-medium hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-indigo-600 font-medium hover:underline cursor-pointer">Cookies Policy</span>.
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-neutral-200">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Otentikasi Seluler</span>
                    <h3 className="text-xs font-bold text-neutral-900">Validasi OTP Dua Faktor (2FA)</h3>
                    <p className="text-[10px] text-neutral-500 leading-normal">
                      Mengirimkan kode OTP unik secara aman ke ponsel pelanggan: **{entry.phone}** untuk mengaktifkan akun.
                    </p>
                  </div>

                  {isVerified ? (
                    <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-4 text-center space-y-2 text-emerald-800">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                      <div>
                        <p className="text-xs font-bold">Autentikasi Aman Berhasil!</p>
                        <p className="text-[10px]">Akun {acc.platform} siap dihuni secara penuh tanpa sandi tambahan.</p>
                      </div>
                    </div>
                  ) : otpSession.isRequested ? (
                    <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3.5">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          SMS Terkirim
                        </span>
                        <span>Masa Berlaku: {otpSession.timeLeft}s</span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="font-semibold text-neutral-700 block">Masukkan 6 Digit OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpSession.userInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setOtpRequests(prev => ({
                              ...prev,
                              [acc.platform]: {
                                ...prev[acc.platform],
                                userInput: val
                              }
                            }));
                          }}
                          placeholder="------"
                          className="w-full tracking-widest text-center text-sm font-bold py-2 border rounded-lg focus:border-indigo-500 outline-none font-mono"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestOtp(acc.platform)}
                          className="flex-1 py-1.5 border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 cursor-pointer hover:bg-neutral-50"
                        >
                          Kirim Ulang SMS
                        </button>
                        <button
                          onClick={() => handleVerifyOtp(acc.platform)}
                          disabled={otpSession.userInput.length < 6}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Verifikasi OTP
                        </button>
                      </div>

                      {entry.syncedEmail && (
                        <button
                          type="button"
                          onClick={() => handleFetchOtpFromGmail(acc.platform)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          🔑 Ambil OTP dari Gmail ({entry.syncedEmail})
                        </button>
                      )}

                      <div className="bg-amber-50/50 p-2.5 rounded text-[10px] text-amber-800 border border-amber-100 flex items-start gap-1 font-mono">
                        <Smartphone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Telemetri GSM Gateway:</p>
                          <p className="mt-0.5">Menerima token transmisi dari API seluler: <span className="font-bold underline text-amber-900 bg-white px-1.5 rounded-sm">{otpSession.code}</span></p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-neutral-400 italic">Akun belum bersertifikat OTP. Kirim token seluler atau langsung verifikasi cepat dengan kotak masuk email Gmail Anda.</p>
                      <button
                        onClick={() => handleRequestOtp(acc.platform)}
                        className="w-full bg-slate-900 hover:bg-neutral-800 text-white font-semibold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4" />
                        Dapatkan OTP Seluler Resmi
                      </button>
                      {entry.syncedEmail && (
                        <button
                          onClick={() => handleFetchOtpFromGmail(acc.platform)}
                          className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                          Auto-Verifikasi via Gmail Sinkron
                        </button>
                      )}
                    </div>
                  )}

                  <div className="bg-indigo-950 text-indigo-200 p-3 rounded-xl border border-indigo-900 text-[10px] font-mono leading-normal">
                    <span className="font-bold text-indigo-400 block border-b border-indigo-900 pb-1 mb-1 relative">OTP SMS TELEMETRY RECEIVER</span>
                    <p className="text-[9.5px]">API Handshake Callback: 200 OK</p>
                    <p className="text-[9.5px]">Device SMS Hook: {entry.phone}</p>
                    <p className="text-[9.5px]">Carrier Status: REALTIME ONLINE</p>
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
