type SparkProps = {
  className?: string;
};

export function Spark({ className }: SparkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 0.5 L14.4 9.6 L23.5 12 L14.4 14.4 L12 23.5 L9.6 14.4 L0.5 12 L9.6 9.6 Z" />
    </svg>
  );
}
