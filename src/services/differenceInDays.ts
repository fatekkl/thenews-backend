

function differenceInDays(date1: string, date2: string) {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();

    // Diferença em milissegundos
    const diffInMs = Math.abs(d2 - d1);

    // Converter para dias
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

export default differenceInDays