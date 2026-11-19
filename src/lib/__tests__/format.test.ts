import {
   formatDate,
   formatDateLong,
   formatInput,
   formatMoney,
   formatNumber,
   parseDecimal,
} from '../format';

describe('format', () => {
   it('argent : espace pour les milliers, sans décimales', () => {
      expect(formatMoney(14222.2222, 'Ar')).toBe('14 222 Ar');
      expect(formatMoney(1234567, 'Ar')).toBe('1 234 567 Ar');
      expect(formatMoney(0, 'Ar')).toBe('0 Ar');
   });
   it('décimales avec virgule', () => {
      expect(formatNumber(2.8444, 2)).toBe('2,84');
      expect(formatNumber(35.156, 1)).toBe('35,2');
      expect(formatNumber(-0.001, 2)).toBe('0,00');
   });
   it('parseDecimal accepte virgule et point', () => {
      expect(parseDecimal('4,2')).toBe(4.2);
      expect(parseDecimal('4.2')).toBe(4.2);
      expect(parseDecimal(' 1 000,5 ')).toBe(1000.5);
      expect(parseDecimal('')).toBeNull();
      expect(parseDecimal('abc')).toBeNull();
      expect(parseDecimal('4,2,1')).toBeNull();
   });
   it('dates en français', () => {
      const iso = new Date(2026, 2, 30, 12).toISOString();
      expect(formatDate(iso)).toBe('30 mars 2026');
      expect(formatDateLong(iso)).toBe('lundi 30 mars 2026');
   });

   it('formats numeric fields while typing', () => {
      expect(formatInput('12500')).toBe('12 500');
      expect(formatInput('1 234 567')).toBe('1 234 567');
      expect(formatInput('4500.5')).toBe('4 500,5');
      expect(formatInput('4,')).toBe('4,');
      expect(formatInput('abc')).toBe('');
      expect(parseDecimal(formatInput('12500,5'))).toBe(12500.5);
   });
});
