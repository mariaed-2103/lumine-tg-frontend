export function ClientAvatar({ name }: { name: string }) {
  const initial = (name ?? "").trim().charAt(0).toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="at-avatar relative grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-white bg-[radial-gradient(circle_at_30%_25%,#FFF8F5_0%,#FCE1E8_55%,#F5A8BC_130%)] font-display text-[15px] font-semibold text-[#6B1530] shadow-[0_4px_10px_-4px_rgba(107,21,48,0.35)]"
    >
      <span className="absolute left-[7px] top-[5px] h-[5px] w-[9px] -rotate-[30deg] rounded-full bg-white/80 blur-[1px]" />
      {initial}
    </span>
  );
}
