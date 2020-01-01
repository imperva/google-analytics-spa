
export function hash(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    const hashLength = length || 6;

    for (let i = 0; i < hashLength; i += 1) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return text;
}
