import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, User, Mail, ShieldAlert, Key, Edit, Save, Plus, HelpCircle, CheckSquare, RefreshCw, Phone } from 'lucide-react';
import type { Contact, VerifiedAccountEntry } from '../types';

interface ContactResolverProps {
  googleToken: string | null;
  onSearchGoogleContacts: (phone: string) => Promise<Contact | null>;
  onCampaignGenerated: (entry: Partial<VerifiedAccountEntry>) => void;
  defaultCompanyName: string;
}

// Initial Mock Contacts Database for quick demonstration & offline sync testing
const DEFAULT_SYNCED_CONTACTS: Contact[] = [
  { name: "Budi Santoso", phone: "08123456789", email: "syaleti853+budi@gmail.com", companyName: "Bank Mandiri Utama", syncedFrom: "Google Workspace" },
  { name: "Siti Rahma", phone: "+62877665544", email: "syaleti853+siti@gmail.com", companyName: "Sinar Mas Lestari", syncedFrom: "Google Workspace" },
  { name: "Adi Wijaya", phone: "08528899001", email: "syaleti853+adi@gmail.com", companyName: "Telkom Digital Lab", syncedFrom: "Microsoft 365" },
  { name: "Dewi Lestari", phone: "08967788990", email: "syaleti853+dewi@gmail.com", companyName: "Dewi Creative Agency", syncedFrom: "Local System Sync" }
];

export default function ContactResolver({ googleToken, onSearchGoogleContacts, onCampaignGenerated, defaultCompanyName }: ContactResolverProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundContact, setFoundContact] = useState<Contact | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  
  // Local Database of contacts (allow admin to add more for unlimited testing!)
  const [localDatabase, setLocalDatabase] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('workspace_synced_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_SYNCED_CONTACTS;
  });

  // Entry Form fields that are automatically populated but fully editable
  const [adminEditedName, setAdminEditedName] = useState('');
  const [adminEditedEmail, setAdminEditedEmail] = useState('');
  const [adminEditedUsername, setAdminEditedUsername] = useState('');
  const [adminEditedPassword, setAdminEditedPassword] = useState('');
  const [adminEditedCompany, setAdminEditedCompany] = useState('');
  const [isFormModified, setIsFormModified] = useState(false);

  // New Contact input form toggle
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactSyncSource, setNewContactSyncSource] = useState<'Google Workspace' | 'Microsoft 365' | 'Local System Sync'>('Local System Sync');

  // Trigger Username & Password generation when a contact is selected or modified
  const generateCredentials = (name: string, company: string) => {
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '.');
    const domain = (company || defaultCompanyName).trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const officialUsername = `${cleanName}@${domain || 'verifiedmail'}.id`;

    // Secure temporary password generation matching standard security constraints
    const specialChars = ['!', '@', '#', '$', '%', '&'];
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const firstNameWord = name.split(' ')[0] || 'User';
    const cleanFirstWord = firstNameWord.replace(/[^a-zA-Z]/g, '');
    const officialPassword = `${cleanFirstWord === 'User' ? 'Temporary' : cleanFirstWord}#${randomNum}${randomSpecial}`;

    return { officialUsername, officialPassword };
  };

  // Synchronise/Search Phone logic
  const handleSearchPhone = async (phoneToSearch: string) => {
    const cleanSearch = phoneToSearch.trim();
    if (!cleanSearch) return;

    setIsSearching(true);
    setSearchFeedback(null);
    setFoundContact(null);

    // 1. Simulate API Synchronization handshake with Google Workspace / MS 365
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. Query Real Google Contacts API if authenticated
    let googleResult: Contact | null = null;
    if (googleToken) {
      try {
        googleResult = await onSearchGoogleContacts(cleanSearch);
      } catch (e) {
        console.error('Google Contacts lookup bypass:', e);
      }
    }

    // 3. Search in matching local database
    const localMatch = localDatabase.find(c => {
      const cleanDbPhone = c.phone.replace(/[^0-9]/g, '');
      const cleanInput = cleanSearch.replace(/[^0-9]/g, '');
      return cleanDbPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanDbPhone);
    });

    const finalContact = googleResult || localMatch;

    if (finalContact) {
      setFoundContact(finalContact);
      setAdminEditedName(finalContact.name);
      setAdminEditedEmail(finalContact.email);
      setAdminEditedCompany(finalContact.companyName || defaultCompanyName);

      // Auto Generate official username & password
      const creds = generateCredentials(finalContact.name, finalContact.companyName || defaultCompanyName);
      setAdminEditedUsername(creds.officialUsername);
      setAdminEditedPassword(creds.officialPassword);
      
      setSearchFeedback(`Sinkronisasi sukses via ${finalContact.syncedFrom}!`);
      setIsFormModified(false);
    } else {
      setSearchFeedback(`Kontak nomor "${cleanSearch}" tidak terdaftar di Google Workspace atau database lokal. Silakan gunakan formulir tambah kontak cepat di bawah.`);
    }
    setIsSearching(false);
  };

  // Re-generate usernames if admin edits company name or name
  const handleAutoRegenerateCredentials = () => {
    if (!adminEditedName) return;
    const creds = generateCredentials(adminEditedName, adminEditedCompany);
    setAdminEditedUsername(creds.officialUsername);
    setAdminEditedPassword(creds.officialPassword);
    setIsFormModified(true);
  };

  // Create & Save customized campaign draft to main app state
  const handleProceedDraft = () => {
    if (!adminEditedName || !adminEditedEmail) return;

    onCampaignGenerated({
      name: adminEditedName,
      phone: phoneNumber || foundContact?.phone || '-',
      syncedEmail: adminEditedEmail,
      companyName: adminEditedCompany,
      generatedUsername: adminEditedUsername,
      generatedPassword: adminEditedPassword,
      status: 'Draft'
    });
  };

  // Append new mock contacts to local storage for test extensibility
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone || !newContactEmail) return;

    const newContact: Contact = {
      name: newContactName,
      phone: newContactPhone,
      email: newContactEmail,
      companyName: newContactCompany || defaultCompanyName,
      syncedFrom: newContactSyncSource
    };

    const updated = [newContact, ...localDatabase];
    setLocalDatabase(updated);
    localStorage.setItem('workspace_synced_contacts', JSON.stringify(updated));

    // Auto load it
    setPhoneNumber(newContactPhone);
    setFoundContact(newContact);
    setAdminEditedName(newContact.name);
    setAdminEditedEmail(newContact.email);
    setAdminEditedCompany(newContact.companyName);
    
    const creds = generateCredentials(newContact.name, newContact.companyName);
    setAdminEditedUsername(creds.officialUsername);
    setAdminEditedPassword(creds.officialPassword);

    // Reset fields
    setNewContactName('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewContactCompany('');
    setShowAddContactModal(false);
    setSearchFeedback(`Kontak baru berhasil disimpan ke database sinkronisir lokal.`);
  };

  const deleteLocalContact = (phoneToDelete: string) => {
    const updated = localDatabase.filter(c => c.phone !== phoneToDelete);
    setLocalDatabase(updated);
    localStorage.setItem('workspace_synced_contacts', JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
          <Phone className="w-5 h-5 text-indigo-500" />
          Pencarian Nomor & Integrasi Sinkronisasi
        </h2>
        <p className="text-xs text-neutral-500">
          Input nomor telepon pelanggan untuk melakukan query email secara otomatis melalui sinkronisasi Google Contacts API
        </p>
      </div>

      {/* QUICK INTAKE BOX */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-neutral-700 block">Pencari Kontak Cerdas (Telepon/Sellular)</label>
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPhone(phoneNumber)}
              placeholder="Contoh: 08123456789 atau +628..."
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
            />
          </div>
          <button
            onClick={() => handleSearchPhone(phoneNumber)}
            disabled={isSearching || !phoneNumber}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Kontak
          </button>
        </div>

        {/* FEEDBACK STATUS */}
        {searchFeedback && (
          <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
            foundContact ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
          }`}>
            <Sparkles className={`w-4 h-4 shrink-0 ${foundContact ? 'text-emerald-500' : 'text-amber-500'}`} />
            <div>
              <p className="font-semibold">{foundContact ? "Pencocokan Sukses" : "Pemberitahuan Sistem"}</p>
              <p className="text-[11px] leading-relaxed mt-0.5">{searchFeedback}</p>
            </div>
          </div>
        )}
      </div>

      {/* DEMO QUICK SELECTION LIST */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-700">Daftar Kontak Tersinkronisasi (Demo Database)</span>
          <button
            onClick={() => setShowAddContactModal(true)}
            className="text-[10px] bg-white border border-neutral-200 hover:border-indigo-300 hover:bg-slate-50 text-indigo-600 px-2 py-1 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Kontak Baru
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {localDatabase.map((contact, index) => (
            <div
              key={index}
              onClick={() => {
                setPhoneNumber(contact.phone);
                handleSearchPhone(contact.phone);
              }}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all hover:bg-white flex items-center justify-between group ${
                phoneNumber === contact.phone 
                  ? 'border-indigo-400 bg-white ring-2 ring-indigo-50 shadow-sm' 
                  : 'border-neutral-100 bg-white/70 hover:shadow-xs'
              }`}
            >
              <div className="space-y-0.5 truncate pr-2">
                <span className="text-xs font-semibold text-neutral-800 block truncate">{contact.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono block">{contact.phone}</span>
                <span className="text-[9px] text-indigo-500 font-medium">{contact.syncedFrom}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLocalContact(contact.phone);
                }}
                className="text-neutral-300 hover:text-red-500 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all text-[9px] cursor-pointer"
                title="Hapus Kontak Lokal"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ADMIN EDIT / CONFIRMATION FORM */}
      {foundContact && (
        <div className="border border-neutral-150 rounded-xl p-5 bg-neutral-50/45 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-150 pb-2">
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Verifikasi & Modifikasi Akun Otomatis
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded border border-indigo-100">
              Generated suggestions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Field 1: Customer Real Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 block">Nama Pelanggan Resmi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={adminEditedName}
                  onChange={(e) => { setAdminEditedName(e.target.value); setIsFormModified(true); }}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-200 bg-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Field 2: Target Sync Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 block">Target Email Aktivasi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  value={adminEditedEmail}
                  onChange={(e) => { setAdminEditedEmail(e.target.value); setIsFormModified(true); }}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-200 bg-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Field 3: Generated Username */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-neutral-600">Username Perusahaan (Otomatis)</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                <input
                  type="text"
                  value={adminEditedUsername}
                  onChange={(e) => { setAdminEditedUsername(e.target.value); setIsFormModified(true); }}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Field 4: Generated Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600 block">Password Sementara</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                <input
                  type="text"
                  value={adminEditedPassword}
                  onChange={(e) => { setAdminEditedPassword(e.target.value); setIsFormModified(true); }}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-200 bg-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Field 5: Target Company Name */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-600 block">Nama Perusahaan Penerbit Kredensial</label>
              <input
                type="text"
                value={adminEditedCompany}
                onChange={(e) => { setAdminEditedCompany(e.target.value); setIsFormModified(true); }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 bg-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={handleAutoRegenerateCredentials}
              className="px-3 py-1.5 border border-neutral-250 hover:bg-white text-neutral-600 text-[11px] rounded-lg cursor-pointer flex items-center gap-1 transition-all"
              title="Kalkulasi ulang nama domain dan password tangguh"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Formula
            </button>
            <button
              onClick={handleProceedDraft}
              className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-[11px] rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center gap-1"
            >
              Simpan & Lanjut ke Draf Kampanye
            </button>
          </div>
        </div>
      )}

      {/* CONTROLLER QUICK ADD MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-100 space-y-4">
            <div className="space-y-1 border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Tambah Kontak Database Baru</h3>
              <p className="text-[11px] text-neutral-500">
                Pendaftaraan kontak internal secara cepat untuk pengujian otomatis sinkronisasi API
              </p>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 block">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Budi Mulya"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 border-red-200">
                <label className="font-semibold text-neutral-700 block">Nomor Telepon</label>
                <input
                  type="text"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="0816677889"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 block">Alamat Email Aktif (Penerima)</label>
                <input
                  type="email"
                  required
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="nomoranda@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 block">Nama Afiliasi Perusahaan</label>
                <input
                  type="text"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  placeholder="PT Digital Mandiri"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 block">Asal Sumber Penyelarasan</label>
                <select
                  value={newContactSyncSource}
                  onChange={(e: any) => setNewContactSyncSource(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white outline-none focus:border-indigo-500"
                >
                  <option value="Google Workspace">Google Workspace Contacts</option>
                  <option value="Microsoft 365">Microsoft 365 People</option>
                  <option value="Local System Sync">Local System Sync Database</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-3.5 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
