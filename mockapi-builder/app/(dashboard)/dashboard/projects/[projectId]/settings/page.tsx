"use client";

import { use, useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Shield, User, Mail, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Invite {
  id: string;
  inviteeEmail: string;
  status: string;
  createdAt: string;
  inviter: { id: string; name: string | null; email: string };
}

export default function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [owner, setOwner] = useState<TeamMember["user"] | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  
  const { addToast } = useToast();

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/members`),
        fetch(`/api/projects/${projectId}/invites`)
      ]);
      
      if (membersRes.ok) {
        const data = await membersRes.json();
        setOwner(data.owner);
        setMembers(data.members);
      }
      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvites(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", title: data.error || "Failed to send invite" });
      } else {
        addToast({ type: "success", title: "Invite sent!" });
        setInviteEmail("");
        setInvites([data, ...invites]);
      }
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addToast({ type: "success", title: "Member removed" });
        setMembers(members.filter(m => m.id !== memberId));
      } else {
        const data = await res.json();
        addToast({ type: "error", title: data.error || "Failed to remove" });
      }
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    }
  };

  const pendingInvites = invites.filter(i => i.status === "PENDING");
  const pastInvites = invites.filter(i => i.status !== "PENDING");

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#1A1A1A]">
          Team Settings
        </h2>
        <p className="mt-1 text-sm text-[#9C9789]">
          Invite developers to collaborate on your mock APIs.
        </p>
      </div>

      {/* ─── Invite Form ─── */}
      <div className="rounded-lg border border-[#E5E1D8] bg-white p-6">
        <h3 className="mb-1 font-[family-name:var(--font-mono)] text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#F59E0B]" />
          Send Invite
        </h3>
        <p className="mb-4 text-xs text-[#9C9789]">
          The user will receive a notification and must accept before joining.
        </p>
        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="developer@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={isInviting} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Send Invite
          </Button>
        </form>
      </div>

      {/* ─── Pending Invites ─── */}
      {pendingInvites.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200">
            <h3 className="font-[family-name:var(--font-mono)] text-sm font-semibold text-amber-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Invites ({pendingInvites.length})
            </h3>
          </div>
          <div className="divide-y divide-amber-200">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#1A1A1A]">{invite.inviteeEmail}</div>
                    <div className="text-[10px] text-[#9C9789]">Waiting for response...</div>
                  </div>
                </div>
                <div className={`rounded border px-2 py-0.5 text-[10px] font-bold ${statusColors.PENDING}`}>
                  PENDING
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Active Team ─── */}
      <div className="rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
        <div className="bg-[#F9F8F6] px-5 py-3 border-b border-[#E5E1D8]">
          <h3 className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Members
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-5 text-sm text-[#9C9789]">Loading team...</div>
        ) : (
          <div className="divide-y divide-[#E5E1D8]">
            {/* Owner */}
            {owner && (
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] text-white">
                    <span className="font-[family-name:var(--font-mono)] font-bold">
                      {owner.name?.charAt(0).toUpperCase() || owner.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-[#1A1A1A]">{owner.name || "No Name"}</div>
                    <div className="text-xs text-[#9C9789]">{owner.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <Shield className="h-3 w-3" />
                  OWNER
                </div>
              </div>
            )}

            {/* Members */}
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDE6] text-[#1A1A1A]">
                    <span className="font-[family-name:var(--font-mono)] font-bold">
                      {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-[#1A1A1A]">{member.user.name || "No Name"}</div>
                    <div className="text-xs text-[#9C9789]">{member.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#666] bg-[#F0EDE6] px-2 py-1 rounded">
                    <User className="h-3 w-3" />
                    MEMBER
                  </div>
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="text-[#9C9789] transition-colors hover:text-red-600"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <div className="px-5 py-6 text-center text-xs text-[#9C9789]">
                No team members yet. Send an invite above!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Past Invites ─── */}
      {pastInvites.length > 0 && (
        <div className="rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
          <div className="bg-[#F9F8F6] px-5 py-3 border-b border-[#E5E1D8]">
            <h3 className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#9C9789]">
              Invite History
            </h3>
          </div>
          <div className="divide-y divide-[#E5E1D8]">
            {pastInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between px-5 py-3">
                <div className="text-sm text-[#666]">{invite.inviteeEmail}</div>
                <div className={`rounded border px-2 py-0.5 text-[10px] font-bold ${statusColors[invite.status] || ""}`}>
                  {invite.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
