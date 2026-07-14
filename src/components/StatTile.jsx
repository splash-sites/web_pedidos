export default function StatTile({ label, value, sublabel }) {
  return (
    <div className="flex-1 rounded-lg bg-white p-5 shadow-sm">
      <p className="text-sm text-brown-dark/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-brown-darker">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-brown-dark/50">{sublabel}</p>}
    </div>
  )
}
