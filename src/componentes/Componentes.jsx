export function Card({titulo, children}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

export const InputGroup = ({
  label,
  value,
  onChange,
  unit,
  disabled = false,
  type = "number",
}) => (
  <div>
    <label className="block text-start text-xs font-medium text-slate-600 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${disabled ? "bg-slate-100 text-slate-500" : "bg-white"}`}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
          {unit}
        </span>
      )}
    </div>
  </div>
);

export const Select = ({ label, value, onChange, options }) => (
  <div className="col-span-2 sm:col-span-1">

    <label className="block text-start text-xs font-medium text-slate-600 mb-1 ">
      {label}
    </label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2.5 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default Card;
