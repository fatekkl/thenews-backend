export function countSundaysBetween(startStr: string, endStr: string): number {
    // Extrai somente a parte "YYYY-MM-DD" das strings de data
    const [startDay] = startStr.split(" ");
    const [endDay] = endStr.split(" ");
    
    // Cria os objetos Date usando somente a data (horário será 00:00)
    const start = new Date(startDay);
    const end = new Date(endDay);

    let count = 0;
    const current = new Date(start);
    // Inicia a contagem a partir do dia seguinte ao dia de start
    current.setDate(current.getDate() + 1);

    while (current <= end) {
        if (current.getDay() === 0) { // 0 representa domingo
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
}
