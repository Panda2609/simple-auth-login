import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true
})
export class FormatTimePipe implements PipeTransform {
  /**
   * Transforma minutos a un formato legible: días, horas, minutos y segundos
   * @param minutes - Número de minutos
   * @returns String formateado como "Xd Xh Xm Xs" o solo las unidades no cero
   */
  transform(minutes: number | null | undefined): string {
    if (minutes === null || minutes === undefined || minutes < 0) {
      return 'Sesión expirada';
    }

    // Convertir minutos a segundos totales
    const totalSeconds = Math.floor(minutes * 60);

    // Calcular unidades
    const days = Math.floor(totalSeconds / 86400); // 86400 = 24 * 60 * 60
    const hours = Math.floor((totalSeconds % 86400) / 3600); // 3600 = 60 * 60
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Construir string con solo las unidades no cero
    const parts: string[] = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
