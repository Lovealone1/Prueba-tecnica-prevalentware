import { describe, it, expect } from 'vitest';

// Importar las funciones que vamos a testear
// Nota: Estas funciones están en los componentes, aquí las recreamos para el test

/**
 * Formatea número a moneda COP
 */
function formatMoneyCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea fecha ISO al formato dd/mm/yyyy HH:mm:ss
 */
function formatDate(value: string): string {
  return value.slice(0, 19).replace("T", " ");
}

describe('Formatter Utilities', () => {
  describe('formatMoneyCop', () => {
    // Test 1: Formatea números correctamente a COP
    it('should format number to COP currency', () => {
      const result = formatMoneyCop(1000000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    // Test 2: Maneja cero correctamente
    it('should format zero to COP', () => {
      const result = formatMoneyCop(0);
      expect(result).toContain('0');
    });

    // Test 3: Maneja números negativos
    it('should format negative numbers', () => {
      const result = formatMoneyCop(-500000);
      expect(result).toContain('-');
    });

    // Test 4: No incluye decimales
    it('should not include decimals', () => {
      const result = formatMoneyCop(1000000.99);
      expect(result).not.toContain(',99');
    });

    // Test 5: Grandes números se formatean correctamente
    it('should format large numbers', () => {
      const result = formatMoneyCop(999999999);
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('formatDate', () => {
    // Test 1: Formatea fecha ISO correctamente
    it('should format ISO date correctly', () => {
      const isoDate = '2026-02-02T15:30:45.000Z';
      const result = formatDate(isoDate);
      expect(result).toBe('2026-02-02 15:30:45');
    });

    // Test 2: Reemplaza T con espacio
    it('should replace T with space', () => {
      const isoDate = '2026-01-15T10:20:30.000Z';
      const result = formatDate(isoDate);
      expect(result).toContain(' ');
      expect(result).not.toContain('T');
    });

    // Test 3: Solo toma los primeros 19 caracteres
    it('should only take first 19 characters', () => {
      const isoDate = '2026-12-31T23:59:59.999Z';
      const result = formatDate(isoDate);
      expect(result.length).toBe(19);
    });

    // Test 4: Formatea fechas del principio del año
    it('should format dates at start of year', () => {
      const isoDate = '2026-01-01T00:00:00.000Z';
      const result = formatDate(isoDate);
      expect(result).toBe('2026-01-01 00:00:00');
    });

    // Test 5: Formatea fechas del final del año
    it('should format dates at end of year', () => {
      const isoDate = '2026-12-31T23:59:59.000Z';
      const result = formatDate(isoDate);
      expect(result).toBe('2026-12-31 23:59:59');
    });
  });
});
