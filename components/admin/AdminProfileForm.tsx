"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileImagePicker from "./ProfileImagePicker";
import { updateAdminProfile } from "@/app/actions/adminProfile";

export default function AdminProfileForm({ name, initialImage, initialBio }: { name: string; initialImage?: string | null; initialBio?: string | null }) {
    const router = useRouter();
    const { update } = useSession();
    const [profileImageUrl, setProfileImageUrl] = useState(initialImage || "");
    const [bio, setBio] = useState(initialBio || "");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    async function save(event: React.FormEvent) {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            await updateAdminProfile({ profileImageUrl: profileImageUrl || null, bio });
            await update();
            setMessage("Profile updated successfully.");
            router.refresh();
        } catch (cause) {
            setMessage(cause instanceof Error ? cause.message : "Could not update your profile.");
        } finally {
            setSaving(false);
        }
    }

    return <form onSubmit={save} className="admin-profile-form"><div className="form-group"><label className="form-label">Profile picture</label><ProfileImagePicker value={profileImageUrl} name={name} onChange={setProfileImageUrl}/></div><div className="form-group"><div className="flex-between"><label className="form-label" htmlFor="adminBio">About you</label><span className="post-character-count">{bio.length}/500</span></div><textarea id="adminBio" className="form-textarea" rows={5} maxLength={500} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Share your role, responsibilities, or a short note for the team."/></div><div className="admin-profile-form-footer"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>{message && <span className={message.includes("successfully") ? "profile-save-success" : "form-error"}>{message}</span>}</div></form>;
}
