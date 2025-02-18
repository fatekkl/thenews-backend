export default function differenceInDays(date1: string, date2: string): number {
    // Supondo que a string venha no formato "YYYY-MM-DD HH:MM:SS"
    // 1) Pega só a parte "YYYY-MM-DD"
    const [ dayPart1 ] = date1.split(" "); // ex.: "2025-02-18"
    const [ dayPart2 ] = date2.split(" "); // ex.: "2025-02-17"
  
    // 2) Cria objeto Date só com a data, ignorando horário.
    //    Obs: new Date("YYYY-MM-DD") normalmente interpreta como UTC ou assume a 00:00 local,
    //    dependendo do ambiente. Para um streak simples, costuma funcionar.
    const d1 = new Date(dayPart1).getTime();
    const d2 = new Date(dayPart2).getTime();
  
    // 3) Diferença em ms
    const diffInMs = Math.abs(d1 - d2);
  
    // 4) Converte para dias (inteiros)
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }
  