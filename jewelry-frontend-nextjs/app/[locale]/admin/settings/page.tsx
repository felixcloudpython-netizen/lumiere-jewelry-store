"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
}

// Backend hiện chưa có khái niệm "cài đặt cửa hàng" nào (không có model
// StoreSettings/config trong schema) — xây một hệ thống cấu hình cửa hàng đầy đủ
// (tiền tệ, thuế, phí ship...) là một tính năng mới hoàn toàn cần thiết kế DB
// riêng. Trang này tập trung vào "cài đặt tài khoản admin" — hồ sơ cá nhân và đổi
// mật khẩu — dùng hạ tầng đã có sẵn (PATCH /api/users/profile,
// PATCH /api/auth/change-password).
export default function AdminSettings() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiFetch<Profile>("/api/users/profile", { token })
      .then((p) => {
        setProfile(p);
        setProfileForm({ firstName: p.firstName ?? "", lastName: p.lastName ?? "", phone: p.phone ?? "" });
      })
      .finally(() => setLoadingProfile(false));
  }, [token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileMessage("");
    setProfileError("");
    setProfileSaving(true);
    try {
      const updated = await apiFetch<Profile>("/api/users/profile", {
        method: "PATCH",
        token,
        body: profileForm,
      });
      updateUser({ firstName: updated.firstName, lastName: updated.lastName });
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Could not update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "PATCH",
        token,
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setPasswordMessage("Password updated.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Could not change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-neutral-200 text-sm outline-none focus:border-neutral-900 bg-white";
  const labelClass = "block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-2";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your admin account</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-neutral-200 p-8 space-y-6">
        <h2 className="text-sm font-medium tracking-wider uppercase">Profile</h2>
        {loadingProfile ? (
          <div className="animate-spin w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full" />
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={profile?.email ?? ""} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>First Name</label>
                <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className={inputClass} />
            </div>
            {profileMessage && <p className="text-sm text-green-700">{profileMessage}</p>}
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            <button type="submit" disabled={profileSaving} className="px-8 py-3 bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white border border-neutral-200 p-8 space-y-6">
        <h2 className="text-sm font-medium tracking-wider uppercase">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Current Password</label>
            <input type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>New Password</label>
              <input type="password" required minLength={8} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" required minLength={8} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className={inputClass} />
            </div>
          </div>
          {passwordMessage && <p className="text-sm text-green-700">{passwordMessage}</p>}
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          <button type="submit" disabled={passwordSaving} className="px-8 py-3 bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
