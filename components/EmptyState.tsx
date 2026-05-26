export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-20 text-center">
      <div className="mb-4 text-5xl">📭</div>
      <h3 className="mb-2 text-lg font-semibold text-slate-300">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
