

export default function getNow() {
    const now = new Date();
    now.setHours(now.getHours() - 3); // 🔹 Ajusta para UTC-3
    const createdAt = now.toISOString().replace("T", " ").slice(0, 19); // Formato YYYY-MM-DD HH:MM:SS


    return createdAt
}