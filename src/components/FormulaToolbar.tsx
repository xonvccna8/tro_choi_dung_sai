import { ChemText } from "./ChemText";

const categories = [
  {
    label: "Acid & Base",
    items: [
      { display: "H2SO4", insert: "H2SO4" },
      { display: "HCl", insert: "HCl" },
      { display: "HNO3", insert: "HNO3" },
      { display: "H3PO4", insert: "H3PO4" },
      { display: "H2CO3", insert: "H2CO3" },
      { display: "CH3COOH", insert: "CH3COOH" },
      { display: "NaOH", insert: "NaOH" },
      { display: "KOH", insert: "KOH" },
      { display: "Ca(OH)2", insert: "Ca(OH)2" },
      { display: "Ba(OH)2", insert: "Ba(OH)2" },
      { display: "NH3", insert: "NH3" },
    ],
  },
  {
    label: "Muoi & Oxit",
    items: [
      { display: "NaCl", insert: "NaCl" },
      { display: "CaCO3", insert: "CaCO3" },
      { display: "Na2CO3", insert: "Na2CO3" },
      { display: "Na2SO4", insert: "Na2SO4" },
      { display: "FeCl3", insert: "FeCl3" },
      { display: "AlCl3", insert: "AlCl3" },
      { display: "CuSO4", insert: "CuSO4" },
      { display: "AgNO3", insert: "AgNO3" },
      { display: "CO2", insert: "CO2" },
      { display: "SO2", insert: "SO2" },
      { display: "Fe2O3", insert: "Fe2O3" },
      { display: "Al2O3", insert: "Al2O3" },
    ],
  },
  {
    label: "Huu co",
    items: [
      { display: "CH4", insert: "CH4" },
      { display: "C2H4", insert: "C2H4" },
      { display: "C2H2", insert: "C2H2" },
      { display: "C2H5OH", insert: "C2H5OH" },
      { display: "CH3CHO", insert: "CH3CHO" },
      { display: "CH3COOH", insert: "CH3COOH" },
      { display: "C6H12O6", insert: "C6H12O6" },
      { display: "C12H22O11", insert: "C12H22O11" },
      { display: "(C6H10O5)n", insert: "(C6H10O5)n" },
      { display: "CH3COOC2H5", insert: "CH3COOC2H5" },
      { display: "C6H5OH", insert: "C6H5OH" },
      { display: "C6H5NH2", insert: "C6H5NH2" },
    ],
  },
  {
    label: "Ion",
    items: [
      { display: "H^{+}", insert: "H^{+}" },
      { display: "OH^{-}", insert: "OH^{-}" },
      { display: "Na^{+}", insert: "Na^{+}" },
      { display: "Fe^{2+}", insert: "Fe^{2+}" },
      { display: "Fe^{3+}", insert: "Fe^{3+}" },
      { display: "Cu^{2+}", insert: "Cu^{2+}" },
      { display: "Al^{3+}", insert: "Al^{3+}" },
      { display: "Ca^{2+}", insert: "Ca^{2+}" },
      { display: "NH4^{+}", insert: "NH4^{+}" },
      { display: "SO4^{2-}", insert: "SO4^{2-}" },
      { display: "NO3^{-}", insert: "NO3^{-}" },
      { display: "CO3^{2-}", insert: "CO3^{2-}" },
      { display: "Cl^{-}", insert: "Cl^{-}" },
      { display: "HCO3^{-}", insert: "HCO3^{-}" },
    ],
  },
  {
    label: "Ky hieu dac biet",
    items: [
      { display: "→", insert: " -> " },
      { display: "⇌", insert: " <-> " },
      { display: "Δ", insert: "(delta)" },
      { display: "°C", insert: "(deg)C" },
      { display: "↑", insert: " ↑ " },
      { display: "↓", insert: " ↓ " },
      { display: "xt", insert: " (xt) " },
      { display: "t°", insert: " (t(deg)) " },
    ],
  },
];

type Props = {
  onInsert: (text: string) => void;
};

export function FormulaToolbar({ onInsert }: Props) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">
        🧪 Bam vao o nhap truoc → bam cong thuc de chen:
      </p>
      {categories.map((cat) => (
        <div key={cat.label}>
          <p className="mb-1 text-xs font-semibold text-violet-600">{cat.label}</p>
          <div className="flex flex-wrap gap-1">
            {cat.items.map((item) => (
              <button
                key={item.insert + item.display}
                type="button"
                onClick={() => onInsert(item.insert)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm transition hover:border-violet-400 hover:bg-violet-50"
                title={`Chen: ${item.insert}`}
              >
                <ChemText text={item.display} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
