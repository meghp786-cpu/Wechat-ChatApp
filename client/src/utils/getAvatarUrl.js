export const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return "";
    
    // If the database has a full localhost URL, replace it with VITE_API_URL dynamically
    if (avatarUrl.includes("localhost") || avatarUrl.includes("127.0.0.1")) {
        return avatarUrl.replace(/^https?:\/\/[^\/]+/, import.meta.env.VITE_API_URL || "");
    }
    
    // If you later change the backend to save relative paths like "/uploads/...", prepend the base URL
    if (avatarUrl.startsWith("/uploads")) {
        return `${import.meta.env.VITE_API_URL || ""}${avatarUrl}`;
    }

    // Default avatars (like Dicebear) or valid absolute URLs
    return avatarUrl;
};
