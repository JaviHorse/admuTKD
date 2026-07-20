"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createDashboardPost, deleteDashboardPost, likeDashboardPost } from "@/app/actions/dashboardPosts";

type Post = {
    id: string;
    content: string | null;
    imageUrl: string | null;
    likeCount: number;
    createdAt: string;
    author: { id: string; name: string; profileImageUrl?: string | null };
};

function PostAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
    const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return <span className="post-author-avatar">{imageUrl ? <Image src={imageUrl} alt="" fill sizes="36px" unoptimized /> : initials}</span>;
}

function formatPostedAt(value: string) {
    return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function DashboardPosts({ posts, isAdmin, adminName, adminImage }: { posts: Post[]; isAdmin: boolean; adminName?: string | null; adminImage?: string | null }) {
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement>(null);
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => Object.fromEntries(posts.map((post) => [post.id, post.likeCount])));
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [likingId, setLikingId] = useState("");
    const [likeError, setLikeError] = useState("");

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem("liked-dashboard-posts") || "[]");
            if (Array.isArray(stored)) setLikedPosts(new Set(stored.filter((id): id is string => typeof id === "string")));
        } catch {
            localStorage.removeItem("liked-dashboard-posts");
        }
    }, []);

    async function processImage(file?: File) {
        setError("");
        if (!file) return;
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return setError("Choose a JPEG, PNG, or WebP image.");
        if (file.size > 8 * 1024 * 1024) return setError("The original image must be smaller than 8 MB.");
        try {
            const source = await createImageBitmap(file);
            const scale = Math.min(1, 1400 / source.width, 1000 / source.height);
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(source.width * scale));
            canvas.height = Math.max(1, Math.round(source.height * scale));
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Image processing is unavailable.");
            context.drawImage(source, 0, 0, canvas.width, canvas.height);
            source.close();
            const result = canvas.toDataURL("image/jpeg", .8);
            if (result.length > 1_500_000) throw new Error("The processed image is too large. Try a smaller image.");
            setImageUrl(result);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not process this image.");
        }
    }

    async function publish() {
        setError("");
        if (!content.trim() && !imageUrl) return setError("Add a message or image before publishing.");
        setPublishing(true);
        try {
            await createDashboardPost({ content, imageUrl: imageUrl || null });
            setContent("");
            setImageUrl("");
            if (fileInput.current) fileInput.current.value = "";
            router.refresh();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not publish this post.");
        } finally {
            setPublishing(false);
        }
    }

    async function removePost(id: string) {
        if (!confirm("Delete this dashboard post?")) return;
        setDeletingId(id);
        try {
            await deleteDashboardPost(id);
            router.refresh();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not delete this post.");
        } finally {
            setDeletingId("");
        }
    }

    async function likePost(id: string) {
        if (likingId) return;
        setLikeError("");
        setLikingId(id);
        setLikeCounts((counts) => ({ ...counts, [id]: (counts[id] || 0) + 1 }));
        try {
            const likeCount = await likeDashboardPost(id);
            setLikeCounts((counts) => ({ ...counts, [id]: likeCount }));
            setLikedPosts((current) => {
                const next = new Set(current).add(id);
                localStorage.setItem("liked-dashboard-posts", JSON.stringify([...next]));
                return next;
            });
        } catch (cause) {
            setLikeCounts((counts) => ({ ...counts, [id]: Math.max(0, (counts[id] || 1) - 1) }));
            setLikeError(cause instanceof Error ? cause.message : "Could not like this post.");
        } finally {
            setLikingId("");
        }
    }

    return <section className="dashboard-posts-section">
        <div className="dashboard-posts-heading">
            <div><span className="eyebrow">Team bulletin</span><h2>Team updates</h2><p>Announcements and moments shared by team administrators.</p></div>
            {posts.length > 0 && <span className="status-chip status-upcoming">{posts.length} post{posts.length === 1 ? "" : "s"}</span>}
        </div>
        {isAdmin && <div className="post-composer surface">
            <div className="post-composer-author"><PostAvatar name={adminName || "Admin"} imageUrl={adminImage} /><div><strong>{adminName || "Team administrator"}</strong><small>Posting as administrator</small></div></div>
            <textarea className="post-composer-input" value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} placeholder="Share an announcement, reminder, result, or team update…" aria-label="Post message" />
            {imageUrl && <div className="post-image-preview"><Image src={imageUrl} alt="Post image preview" fill sizes="(max-width: 768px) 100vw, 700px" unoptimized /><button type="button" onClick={() => { setImageUrl(""); if (fileInput.current) fileInput.current.value = ""; }} aria-label="Remove image">×</button></div>}
            <div className="post-composer-footer"><div><label className="btn btn-ghost btn-sm post-image-button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></svg>{imageUrl ? "Replace image" : "Add image"}<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => processImage(event.target.files?.[0])} /></label><span className="post-character-count">{content.length}/2000</span></div><button type="button" className="btn btn-primary" onClick={publish} disabled={publishing}>{publishing ? "Publishing…" : "Publish update"}</button></div>
            {error && <div className="post-error">{error}</div>}
        </div>}
        <div className="dashboard-post-feed">
            {likeError && <div className="post-error" role="alert">{likeError}</div>}
            {posts.length ? posts.map((post) => <article className="dashboard-post surface" key={post.id}>
                <header><Link href={`/admins/${post.author.id}`} className="post-author-link"><PostAvatar name={post.author.name} imageUrl={post.author.profileImageUrl} /><div><strong>{post.author.name}</strong><span>Administrator · {formatPostedAt(post.createdAt)}</span></div></Link>{isAdmin && <button type="button" className="post-delete-button" onClick={() => removePost(post.id)} disabled={deletingId === post.id} aria-label={`Delete post by ${post.author.name}`}>{deletingId === post.id ? "…" : "×"}</button>}</header>
                {post.content && <p className="dashboard-post-copy">{post.content}</p>}
                {post.imageUrl && <div className="dashboard-post-image"><Image src={post.imageUrl} alt={`Update posted by ${post.author.name}`} fill sizes="(max-width: 768px) 100vw, 760px" unoptimized /></div>}
                <footer className="dashboard-post-actions">
                    {!isAdmin ? <button type="button" className={`post-like-button${likedPosts.has(post.id) ? " is-liked" : ""}`} onClick={() => likePost(post.id)} disabled={likingId === post.id} aria-label={`Like this post. ${likeCounts[post.id] || 0} likes`} aria-pressed={likedPosts.has(post.id)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>
                        <span>{likeCounts[post.id] || 0}</span>
                    </button> : <span className="post-like-count" aria-label={`${likeCounts[post.id] || 0} likes`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>
                        <span>{likeCounts[post.id] || 0}</span>
                    </span>}
                </footer>
            </article>) : <div className="post-empty surface"><span>AT</span><div><strong>No team updates yet</strong><p>Announcements from team administrators will appear here.</p></div></div>}
        </div>
    </section>;
}
