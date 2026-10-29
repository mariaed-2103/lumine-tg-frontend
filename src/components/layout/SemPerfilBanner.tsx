import { Link } from "@tanstack/react-router";

interface Props {
  /** passar true enquanto o perfil ainda não foi carregado */
  loading?: boolean;
}

export function SemPerfilBanner({ loading }: Props) {
  if (loading) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-petal bg-pale px-4 py-3 text-sm text-wine mb-4">
      <span>
        Você ainda não possui um perfil de empresa cadastrado.
        Complete seu perfil para usar todos os módulos corretamente.
      </span>
      <Link
        to="/perfil-empresa"
        className="shrink-0 font-semibold text-berry underline underline-offset-2 hover:text-rose"
      >
        Completar agora →
      </Link>
    </div>
  );
}
