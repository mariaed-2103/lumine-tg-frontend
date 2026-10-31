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
