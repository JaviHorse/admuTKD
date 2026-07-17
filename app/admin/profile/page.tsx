import { getCurrentAdminProfile } from "@/app/actions/adminProfile";
import AdminProfileForm from "@/components/admin/AdminProfileForm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminProfilePage() {
    const profile = await getCurrentAdminProfile();
    if (!profile) notFound();
    const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return <div><div className="profile-breadcrumb"><Link href="/admin">Management</Link><span>/</span><strong>My Profile</strong></div><header className="compact-page-header"><div><span className="eyebrow">Administrator identity</span><h1>My Profile</h1><p>Manage the identity viewers see on team updates.</p></div><Link href={`/admins/${profile.id}`} className="btn btn-secondary">View public profile</Link></header><div className="admin-profile-layout"><aside className="surface admin-profile-summary"><div className="admin-profile-photo">{profile.profileImageUrl ? <Image src={profile.profileImageUrl} alt={profile.name} fill sizes="150px" priority unoptimized/> : <span>{initials}</span>}</div><h2>{profile.name}</h2><span className="status-chip status-upcoming">Administrator</span><div className="profile-facts"><div><span>Email</span><strong>{profile.email}</strong></div><div><span>Posts shared</span><strong>{profile._count.dashboardPosts}</strong></div><div><span>Member since</span><strong>{profile.createdAt.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</strong></div></div></aside><section className="surface admin-profile-editor"><div className="surface-header"><div><h2 className="surface-title">Public profile details</h2><p className="surface-subtitle">Your photo and bio are visible to everyone.</p></div></div><AdminProfileForm name={profile.name} initialImage={profile.profileImageUrl} initialBio={profile.bio}/></section></div></div>;
}
