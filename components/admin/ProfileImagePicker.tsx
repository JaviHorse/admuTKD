"use client";

import Image from "next/image";
import { useId, useState } from "react";

export default function ProfileImagePicker({ value, name, onChange }: { value: string; name: string; onChange: (value: string) => void }) {
    const inputId = useId();
    const [error, setError] = useState("");
    const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AT";

    async function handleFile(file?: File) {
        setError("");
        if (!file) return;
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return setError("Choose a JPEG, PNG, or WebP image.");
        if (file.size > 5 * 1024 * 1024) return setError("The original image must be smaller than 5 MB.");
        try {
            const source = await createImageBitmap(file);
            const size = Math.min(source.width, source.height);
            const canvas = document.createElement("canvas");
            canvas.width = 720;
            canvas.height = 720;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Image processing is unavailable.");
            context.drawImage(source, (source.width - size) / 2, (source.height - size) / 2, size, size, 0, 0, 720, 720);
            source.close();
            const result = canvas.toDataURL("image/jpeg", .82);
            if (result.length > 1_500_000) throw new Error("The processed image is still too large. Try a smaller file.");
            onChange(result);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not process this image.");
        }
    }

    return <div className="profile-image-picker">
        <div className="profile-image-preview">{value ? <Image src={value} alt={`${name || "Profile"} preview`} fill sizes="96px" unoptimized /> : <span>{initials}</span>}</div>
        <div className="profile-image-controls"><label htmlFor={inputId} className="btn btn-secondary btn-sm">{value ? "Replace photo" : "Upload photo"}</label><input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => handleFile(event.target.files?.[0])} />{value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>Remove</button>}<small>Square crop · JPEG, PNG or WebP · 5 MB max</small>{error && <span className="form-error">{error}</span>}</div>
    </div>;
}
