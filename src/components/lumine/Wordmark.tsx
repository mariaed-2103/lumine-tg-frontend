import { Spark } from "./Spark";

export function Wordmark() {
  return (
    <div className="relative inline-flex items-end font-display text-5xl font-bold tracking-tight text-wine sm:text-6xl">
      <span>Lum</span>
      <span className="relative text-berry">
        <Spark className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 text-rose sm:-top-4 sm:h-5 sm:w-5" />
        <span className="relative">i</span>
      </span>
      <span>ne</span>
    </div>
  );
}
