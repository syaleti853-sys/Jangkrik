import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, Mail, Lock, Calendar, Briefcase, 
  Save, ShieldCheck, Sparkles, Instagram, Facebook, 
  Youtube, MessageCircle, Link, Image, Globe, Check
} from 'lucide-react';
import type { VerifiedAccountEntry, SocialAccount } from '../types';
import { detectGenderFromName } from './SocialMediaAutomation';

interface EditUserModalProps {
  entry: VerifiedAccountEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: VerifiedAccountEntry) => void;
}

export default function EditUserModal({ 
  entry, 
  isOpen, 
  onClose, 
  onSave 
}: EditUserModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'youtube'>('profile');
  
  // Local state for Main Profile
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [syncedEmail, setSyncedEmail] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState<VerifiedAccountEntry['status']>('Opened');
  const [accountCategory, setAccountCategory] = useState<VerifiedAccountEntry['accountCategory']>('NOT REG');

  // Local state for Social Accounts (mapped by platform name)
  const [socialsMap, setSocialsMap] = useState<Record<string, {
    username: string;
    bio: string;
    customPassword?: string;
    avatarUrl: string;
    realUrl?: string;
    status: SocialAccount['status'];
    otpCode?: string;
  }>>({});

  // Populate local state when entry changes
  useEffect(() => {
    if (entry) {
      setName(entry.name || '');
      setPhone(entry.phone || '');
      setSyncedEmail(entry.syncedEmail || '');
      setGeneratedUsername(entry.generatedUsername || '');
      setGeneratedPassword(entry.generatedPassword || '');
      setBirthday(entry.birthday || '');
      setCompanyName(entry.companyName || '');
      setStatus(entry.status || 'Opened');
      setAccountCategory(entry.accountCategory || 'NOT REG');

      // Index social accounts
      const map: Record<string, any> = {};
      const platforms = ['Instagram', 'TikTok', 'X', 'Facebook', 'YouTube'];
      
      // Initialize default fallbacks in case social accounts are empty
      platforms.forEach(platform => {
        map[platform] = {
          username: `@${(entry.generatedUsername || 'user')}`,
          bio: '',
          customPassword: entry.generatedPassword,
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250',
          realUrl: '',
          status: 'Ready',
          otpCode: '123456'
        };
      });

      // Override with actual saved social accounts
      if (entry.socialAccounts && Array.isArray(entry.socialAccounts)) {
        entry.socialAccounts.forEach(acc => {
          map[acc.platform] = {
            username: acc.username,
            bio: acc.bio,
            customPassword: acc.customPassword || entry.generatedPassword,
            avatarUrl: acc.avatarUrl,
            realUrl: acc.realUrl,
            status: acc.status,
            otpCode: acc.otpCode
          };
        });
      }
      setSocialsMap(map);
      setActiveTab('profile');
    }
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSocialFieldChange = (platform: string, field: string, value: string) => {
    setSocialsMap(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map socialsMap state back to SocialAccount array
    const platforms = ['Instagram', 'TikTok', 'X', 'Facebook', 'YouTube'];
    const updatedSocialAccounts: SocialAccount[] = platforms.map(platform => {
      const s = socialsMap[platform];
      return {
        platform: platform as SocialAccount['platform'],
        username: s.username,
        bio: s.bio,
        avatarUrl: s.avatarUrl,
        customPassword: s.customPassword,
        realUrl: s.realUrl || `https://www.${platform.toLowerCase()}.com/${s.username.replace('@', '')}`,
        status: s.status,
        otpCode: s.otpCode
      };
    });

    const updatedEntry: VerifiedAccountEntry = {
      ...entry,
      name,
      phone,
      syncedEmail,
      generatedUsername,
      generatedPassword,
      birthday,
      companyName,
      status,
      accountCategory,
      // Regenerate auto logs or append update log
      smtpLogs: [
        ...entry.smtpLogs,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: `Kredensial profil diperbarui secara manual oleh pengelola.`
        }
      ],
      socialAccounts: updatedSocialAccounts
    };

    onSave(updatedEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90vh] overflow-hidden animate-fade-in text-left">
        
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-neutral-100 bg-linear-to-r from-indigo-550 to-indigo-700 text-white flex justify-between items-center bg-indigo-600">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/10 rounded-xl">
              <User className="w-5 h-5 text-indigo-100" />
            </span>
            <div>
              <span className="text-[10px] text-indigo-200 font-extrabold uppercase tracking-widest block leading-none mb-1">
                Security Profile Editor
              </span>
              <h2 className="text-lg font-black text-white tracking-tight">
                Edit Profil Kredensial: {name || entry.name}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-black/10 hover:bg-black/20 text-indigo-100 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB BUTTON NAVIGATION */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-2 flex flex-wrap gap-1.5 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.8 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'profile' 
                ? 'bg-slate-900 border-slate-905 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profil Utama
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instagram')}
            className={`px-3.5 py-1.8 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'instagram' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-rose-550 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            Instagram
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tiktok')}
            className={`px-3.5 py-1.8 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'tiktok' 
                ? 'bg-black border-black text-white shadow-xs animate-pulse-glow' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-rose-550" />
            TikTok
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('twitter')}
            className={`px-3.5 py-1.8 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'twitter' 
                ? 'bg-slate-900 border-slate-950 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            X (Twitter)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('facebook')}
            className={`px-3.5 py-1.8 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'facebook' 
                ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Facebook className="w-3.5 h-3.5" />
            Facebook
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`px-3.5 py-1.8 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'youtube' 
                ? 'bg-red-650 border-red-700 text-white shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            YouTube
          </button>
        </div>

        {/* MODAL MAIN FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 font-sans">
          
          {/* TAB 1: GENERAL PROFILE INPUTS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in text-left">
              
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Nama Lengkap Karyawan
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  placeholder="Masukkan nama lengkap..."
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  No. Telepon / Ponsel Pemulihan
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  placeholder="+62 812-XXXX-XXXX"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  Email Terkoneksi (Utama)
                </label>
                <input
                  type="email"
                  required
                  value={syncedEmail}
                  onChange={e => setSyncedEmail(e.target.value)}
                  className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  placeholder="nama@domain.id"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Tanggal Lahir (Anak/Kerja)
                </label>
                <input
                  type="text"
                  required
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  placeholder="Contoh: 14 April 1996"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Afiliasi Perusahaan / Bisnis
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                  placeholder="Masukkan nama perusahaan..."
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Status Portal Verifikasi
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as VerifiedAccountEntry['status'])}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="Opened">Tautan Diaktivasi (Opened)</option>
                  <option value="Delivered">Terkirim ke Inbox (Delivered)</option>
                  <option value="Sending">Mengirim via TLS (Sending)</option>
                  <option value="Draft">Dalam Antrean (Draft)</option>
                  <option value="Failed">Gagal Pengantaran (Failed)</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Kategori Klasifikasi Akun
                </label>
                <select
                  value={accountCategory}
                  onChange={e => setAccountCategory(e.target.value as VerifiedAccountEntry['accountCategory'])}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                >
                  <option value="NOT REG">NOT REG 🔘</option>
                  <option value="READY TO USE">READY TO USE 🟣</option>
                  <option value="ACTIVE">ACTIVE 🟢</option>
                  <option value="NEED CHECK">NEED CHECK 🔵</option>
                  <option value="SUSPEND">SUSPEND 🟡</option>
                  <option value="BANNED">BANNED 🔴</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-205 flex items-start gap-2.5 md:col-span-2 text-left mt-2">
                <Lock className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900">Kredensial Single Sign-On (SSO) Master Karyawan</h4>
                  <p className="text-[10.5px] text-slate-500 leading-normal">
                    Mengonfigurasi data di atas akan memperbarui profil verifikasi dasar. Mengubah data ini secara cerdas akan mempertahankan sinkronisasi jika mereka didaftarkan ke multi-sosmed secara massal.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-bold text-slate-500 block">Username Master</span>
                      <input
                        type="text"
                        required
                        value={generatedUsername}
                        onChange={e => setGeneratedUsername(e.target.value)}
                        className="w-full text-xs font-mono font-extrabold bg-white border border-slate-200 text-indigo-700 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-bold text-slate-500 block">Password Master</span>
                      <input
                        type="text"
                        required
                        value={generatedPassword}
                        onChange={e => setGeneratedPassword(e.target.value)}
                        className="w-full text-xs font-mono font-extrabold bg-white border border-slate-200 text-indigo-700 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2-6: SOCIAL MEDIA PLATFORMS EDITORS */}
          {['Instagram', 'TikTok', 'X', 'Facebook', 'YouTube'].map(platform => {
            const normalizedTab = platform === 'X' ? 'twitter' : platform.toLowerCase();
            if (activeTab !== normalizedTab) return null;

            const soc = socialsMap[platform] || {
              username: '',
              bio: '',
              customPassword: '',
              avatarUrl: '',
              realUrl: '',
              status: 'Ready',
              otpCode: ''
            };

            const isFemale = detectGenderFromName(name || entry.name) === 'female';

            return (
              <div key={platform} className="space-y-5 animate-fade-in text-left">
                
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className={`p-2.5 rounded-xl text-white ${
                    platform === 'Instagram' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                    platform === 'TikTok' ? 'bg-black' :
                    platform === 'X' ? 'bg-slate-900' :
                    platform === 'Facebook' ? 'bg-indigo-600' :
                    'bg-red-650'
                  }`}>
                    {platform === 'Instagram' ? <Instagram className="w-5 h-5" /> :
                     platform === 'Facebook' ? <Facebook className="w-5 h-5" /> :
                     platform === 'YouTube' ? <Youtube className="w-5 h-5" /> :
                     <Globe className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Kredensial Akun {platform} Karyawan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Edit handle username kustom, tautan media sosial asli, dan status verifikasi 2FA 
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      Username Handle Khusus {platform}
                    </label>
                    <input
                      type="text"
                      required
                      value={soc.username}
                      onChange={e => handleSocialFieldChange(platform, 'username', e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder={`@handle-${platform.toLowerCase()}`}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                      Sandi Khusus {platform}
                    </label>
                    <input
                      type="text"
                      required
                      value={soc.customPassword || ''}
                      onChange={e => handleSocialFieldChange(platform, 'customPassword', e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none"
                      placeholder="Masukkan sandi khusus sosmed ini"
                    />
                  </div>

                  <div className="space-y-1.5 text-left md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                      Individu Bio / Deskripsi Profil ({platform})
                    </label>
                    <textarea
                      value={soc.bio}
                      onChange={e => handleSocialFieldChange(platform, 'bio', e.target.value)}
                      rows={3}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed"
                      placeholder={`Deskripsikan persona untuk ${name} pada platform ${platform}...`}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-indigo-500" />
                      Avatar / Gambar Akun (URL Gambar)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={soc.avatarUrl}
                        onChange={e => handleSocialFieldChange(platform, 'avatarUrl', e.target.value)}
                        className="flex-1 text-[10.5px] font-mono bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                      <img 
                        src={soc.avatarUrl} 
                        alt="Avatar Preview" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = isFemale 
                            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120'
                            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120';
                        }}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Link className="w-3.5 h-3.5 text-indigo-500" />
                      Tautan Profil Resmi ({platform})
                    </label>
                    <input
                      type="url"
                      value={soc.realUrl || ''}
                      onChange={e => handleSocialFieldChange(platform, 'realUrl', e.target.value)}
                      className="w-full text-[10.5px] font-mono bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder={`https://${platform.toLowerCase()}.com/username`}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-600">
                      Otentikasi 2-FA / Kunci OTP
                    </label>
                    <input
                      type="text"
                      value={soc.otpCode || ''}
                      onChange={e => handleSocialFieldChange(platform, 'otpCode', e.target.value)}
                      className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 text-emerald-700 px-3.5 py-2 rounded-xl text-left"
                      placeholder="6 digit angka OTP verifikasi"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-600">
                      Status Autentikasi Platform
                    </label>
                    <select
                      value={soc.status}
                      onChange={e => handleSocialFieldChange(platform, 'status', e.target.value as SocialAccount['status'])}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl outline-none"
                    >
                      <option value="OTP_Verified">Terverifikasi OTP Seluler (OTP_Verified)</option>
                      <option value="OTP_Required">Meminta Kode Verifikasi (OTP_Required)</option>
                      <option value="Ready">Kredensial Siap (Ready)</option>
                      <option value="Generating">Pengolahan AI (Generating)</option>
                    </select>
                  </div>

                </div>

              </div>
            );
          })}

        </form>

        {/* MODAL FOOTER */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div className="text-[10px] text-slate-400 font-medium max-w-sm">
            🛡️ Perubahan data di atas akan mempertahankan enkripsi end-to-end sandbox secara lokal dan siap dikirim kapan saja.
          </div>
          
          <div className="flex items-center gap-2.5 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 border border-slate-250 hover:bg-slate-100 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Suntingan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
