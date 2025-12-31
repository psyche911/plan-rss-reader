export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL color
    // Hue: based on hash
    // Saturation: 65-80% for vibrancy
    // Lightness: 80-90% for pastel/readable background

    const h = Math.abs(hash) % 360;
    const s = 70 + (Math.abs(hash) % 20);
    const l = 85 + (Math.abs(hash) % 10);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

export function stringToDarkColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    const s = 60 + (Math.abs(hash) % 20);
    const l = 25 + (Math.abs(hash) % 10); // Darker for dark mode backgrounds

    return `hsl(${h}, ${s}%, ${l}%)`;
}
