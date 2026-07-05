export interface WeeklyBalance {
  pactadas: number;
  trabajadas: number;
  ajustes: number;
  saldo: number;
}

/** Saldo semanal = horas pactadas − horas trabajadas efectivas + ajustes (regla de negocio 4). */
export function computeBalance(params: {
  pactadas: number;
  trabajadasMinutes: number;
  ajustes: number;
}): WeeklyBalance {
  const trabajadas = Math.round((params.trabajadasMinutes / 60) * 100) / 100;
  const saldo = Math.round((params.pactadas - trabajadas + params.ajustes) * 100) / 100;
  return { pactadas: params.pactadas, trabajadas, ajustes: params.ajustes, saldo };
}
