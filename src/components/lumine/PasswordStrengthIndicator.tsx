import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { computeStrength } from "@/lib/validation";

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => computeStrength(password), [password]);
  const { label, colorClass, width } = strengthMeta(strength);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="h-full flex-1 rounded-full bg-petal/40">
            <div
              className={`h-full ${width >= step ? colorClass : "bg-petal/40"} rounded-full transition-all duration-300`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles size={12} className={colorClass.replace("bg-", "text-")} />
        <span>Força da senha:</span>
        <span className={colorClass.replace("bg-", "text-")}>{label}</span>
      </div>
    </div>
  );
}

function strengthMeta(strength: number) {
  if (strength <= 1) {
    return { label: "Fraca", colorClass: "bg-petal", width: 1 };
  }
  if (strength === 2) {
    return { label: "Média", colorClass: "bg-rose", width: 2 };
  }
  if (strength === 3) {
    return { label: "Forte", colorClass: "bg-berry", width: 3 };
  }
  return { label: "Muito forte", colorClass: "bg-wine", width: 4 };
}
