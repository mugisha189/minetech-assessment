const variants: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high:     'bg-orange-100 text-orange-800 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  low:      'bg-green-100 text-green-800 border-green-200',
  positive: 'bg-green-100 text-green-800 border-green-200',
  negative: 'bg-red-100 text-red-800 border-red-200',
  neutral:  'bg-gray-100 text-gray-700 border-gray-200',
  default:  'bg-blue-50 text-blue-800 border-blue-200',
};

export function Badge({ label, variant }: { label: string; variant?: string }) {
  const cls = variants[variant ?? label] ?? variants.default;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label.replace(/_/g, ' ')}
    </span>
  );
}
