"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Save, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setIsLoading(false);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      addToast({ type: "error", title: "Passwords do not match" });
      return;
    }

    if (password && password.length < 6) {
      addToast({ type: "error", title: "Password must be at least 6 characters" });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { name };
      if (password) {
        payload.password = password;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({ type: "error", title: data.error || "Failed to update profile" });
        return;
      }

      addToast({ type: "success", title: "Profile updated successfully!" });
      
      // Update the NextAuth session so the sidebar reflects the new name instantly
      await update({ name: data.user.name });
      
      // Clear password fields
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      addToast({ type: "error", title: "An unexpected error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8 px-6">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[#1A1A1A]">
          Account Settings
        </h1>
        <p className="mt-2 text-sm text-[#9C9789]">
          Manage your profile details and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Summary */}
        <div className="col-span-1">
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#F59E0B] text-4xl font-bold text-white shadow-inner">
                {session?.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {session?.user?.name || "User"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#9C9789]">
                <Shield className="h-3 w-3 text-emerald-500" />
                Standard Plan
              </p>
            </div>
            
            <div className="mt-8 space-y-4 border-t border-[#E5E1D8] pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9C9789]">Email Status</p>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#1A1A1A]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">{session?.user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="col-span-1 md:col-span-2">
          <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm">
            <form onSubmit={handleSave}>
              <div className="p-6">
                <h3 className="mb-6 flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm font-bold text-[#1A1A1A]">
                  <User className="h-4 w-4 text-[#F59E0B]" />
                  Personal Information
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A1A1A]">Display Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                    <p className="text-xs text-[#9C9789]">This name will be displayed to your team members.</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A1A1A]">Email Address</label>
                    <Input
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-[#F9F8F6] text-[#9C9789] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#9C9789]">Your email address cannot be changed at this time.</p>
                  </div>
                </div>

                <div className="my-8 border-t border-[#E5E1D8]" />

                <h3 className="mb-6 flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm font-bold text-[#1A1A1A]">
                  <Key className="h-4 w-4 text-[#6366F1]" />
                  Change Password
                </h3>
                
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#1A1A1A]">New Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  
                  {password && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#1A1A1A]">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required={!!password}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-[#E5E1D8] bg-[#F9F8F6] p-4 px-6">
                <Button type="submit" isLoading={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
