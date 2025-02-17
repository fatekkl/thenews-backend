export function countSundaysBetween(startStr: string, endStr: string): number {
    const start = new Date(startStr.replace(" ", "T"));
    const end = new Date(endStr.replace(" ", "T"));

    let count = 0;
    const current = new Date(start);
    current.setDate(current.getDate() + 1);

    while (current <= end) {
        if (current.getDay() === 0) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
}