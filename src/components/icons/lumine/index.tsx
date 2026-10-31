import type { ReactNode } from "react";

type IconProps = { className?: string; size?: number };

function Icon({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ? `shrink-0 ${className}` : "shrink-0"}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" fill="#F5A8BC" fillOpacity=".3" />
      <path d="M12 7v5l3.2 2" />
    </Icon>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="2.5" fill="#F5A8BC" fillOpacity=".35" />
      <path d="M9 4.5v-1h6v1M8.5 10h7M8.5 14h5" />
      <path d="m14 17 1.2 1.2 2.3-2.5" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6.5 9 5.5 5.5L17.5 9" />
      <path d="m9 9 3 3 3-3" fill="#F5A8BC" fillOpacity=".25" stroke="none" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.8" cy="10.8" r="6.2" fill="#F5A8BC" fillOpacity=".25" />
      <path d="m15.4 15.4 4.2 4.2" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5m7 7-7-7 7-7" />
    </Icon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m14.8 5.2 4 4M4.5 19.5l4.1-.8L19 8.3a2.1 2.1 0 0 0-3-3L5.3 16.1l-.8 3.4Z" />
      <path d="m6.5 16.4 1.3 1.2" fill="#F5A8BC" fillOpacity=".35" />
    </Icon>
  );
}

export function DeleteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.5 8.5h7v10h-7z" fill="#F5A8BC" fillOpacity=".25" stroke="none" />
      <path d="M4.5 7h15M9 7V4.5h6V7m-8 0 .8 13h8.4L17 7M10 10v7m4-7v7" />
    </Icon>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 7h13M5 12h9M5 17h5" />
    </Icon>
  );
}

export function ProcedureIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 3.5c.8 4.5 2.5 6.2 8.5 8.5-6 2.2-7.7 4-8.5 8.5-.8-4.5-2.5-6.3-8.5-8.5 6-2.3 7.7-4 8.5-8.5Z"
        fill="#F5A8BC"
        fillOpacity=".35"
      />
      <path d="M12 3.5c.8 4.5 2.5 6.2 8.5 8.5-6 2.2-7.7 4-8.5 8.5-.8-4.5-2.5-6.3-8.5-8.5 6-2.3 7.7-4 8.5-8.5Z" />
    </Icon>
  );
}

export function PixIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 20.5 12 12 20.5 3.5 12Z" />
      <path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" fill="#F5A8BC" fillOpacity=".35" stroke="none" />
    </Icon>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M3 10V9a3.5 3.5 0 0 1 3.5-3.5h11A3.5 3.5 0 0 1 21 9v1Z"
        fill="#F5A8BC"
        fillOpacity=".35"
        stroke="none"
      />
      <rect x="3" y="5.5" width="18" height="13" rx="3.5" />
      <path d="M3 10h18M7 15h3.5" />
    </Icon>
  );
}

export function CashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="3" />
      <circle cx="12" cy="12" r="2.6" fill="#F5A8BC" fillOpacity=".35" />
      <path d="M6 12h.01M18 12h.01" strokeWidth="2.2" />
    </Icon>
  );
}

export function UnexpectedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 3C12 3 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 3 12 3Z"
        fill="currentColor"
        fillOpacity=".22"
      />
      <path d="M12 11v3.5M12 17.4h.01" />
    </Icon>
  );
}

export function PaymentMiniIcon({ label }: { label: string }) {
  const normalizedLabel = (label ?? "").toLowerCase();
  const className = "shrink-0 text-[#E8698A]";

  if (normalizedLabel.includes("pix")) return <PixIcon className={className} size={14} />;
  if (normalizedLabel.includes("cart")) return <CardIcon className={className} size={14} />;
  if (normalizedLabel.includes("dinheiro")) return <CashIcon className={className} size={14} />;

  return <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8698A]" />;
}
