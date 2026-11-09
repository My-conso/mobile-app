import { fr, mg } from '../locales/locales';

type Tree = { [k: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
   return Object.entries(tree).reduce<Record<string, string>>((acc, [k, v]) => {
      if (typeof v === 'string') acc[prefix + k] = v;
      else Object.assign(acc, flatten(v, `${prefix}${k}.`));
      return acc;
   }, {});
}

const placeholders = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map(m => m[1]).sort();

describe('traductions fr / mg', () => {
   const frFlat = flatten(fr as unknown as Tree);
   const mgFlat = flatten(mg as unknown as Tree);

   it('ont exactement les mêmes clés', () => {
      expect(Object.keys(mgFlat).sort()).toEqual(Object.keys(frFlat).sort());
   });

   it('n’ont aucune valeur vide', () => {
      for (const [k, v] of [...Object.entries(frFlat), ...Object.entries(mgFlat)]) {
         expect([k, v.trim().length > 0]).toEqual([k, true]);
      }
   });

   it('utilisent les mêmes variables {{…}} dans chaque langue', () => {
      for (const k of Object.keys(frFlat)) {
         expect([k, placeholders(mgFlat[k])]).toEqual([k, placeholders(frFlat[k])]);
      }
   });
});
