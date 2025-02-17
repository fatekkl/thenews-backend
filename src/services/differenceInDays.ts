function differenceInDays(date1: string, date2: string): number {
    // Convertendo a string no formato "YYYY-MM-DD HH:MM:SS" para um objeto Date
    const d1 = new Date(date1.replace(" ", "T")).getTime();
    const d2 = new Date(date2.replace(" ", "T")).getTime();

    // Diferença em milissegundos
    const diffInMs = Math.abs(d2 - d1);

    // Converter para dias
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

export default differenceInDays;
