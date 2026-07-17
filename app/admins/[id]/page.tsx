import { getPublicAdminProfile } from "@/app/actions/adminProfile";
import DashboardPosts from "@/components/DashboardPosts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export default async function PublicAdminProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [profile, session] = await Promise.all([getPublicAdminProfile(id), auth()]);
    if (!profile) notFound();
    const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const ownsProfile = session?.user?.role === "ADMIN" && session.user.id === profile.id;
    return <div><div className="profile-breadcrumb"><Link href="/dashboard">Overview</Link><span>/</span><strong>{profile.name}</strong></div><section className="profile-hero surface admin-public-hero"><div className="profile-photo profile-photo-coach">{profile.profileImageUrl ? <Image src={profile.profileImageUrl} alt={profile.name} fill sizes="164px" priority unoptimized/> : <span>{initials}</span>}</div><div className="profile-identity"><span className="eyebrow">Team administrator</span><h1>{profile.name}</h1><div className="profile-chips"><span className="status-chip status-active">Administrator</span><span className="status-chip status-upcoming">{profile._count.dashboardPosts} team updates</span></div><p>{profile.bio || "Administrator for the Ateneo Taekwondo Performance Hub."}</p></div>{ownsProfile && <div className="profile-actions"><Link href="/admin/profile" className="btn btn-primary">Edit my profile</Link></div>}</section><div className="admin-public-meta"><span>Administrator since {profile.createdAt.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</span></div><DashboardPosts posts={profile.dashboardPosts.map((post) => ({ ...post, createdAt: post.createdAt.toISOString() }))} isAdmin={false}/></div>;
}
