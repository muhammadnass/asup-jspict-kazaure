import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 shrink-0"
      aria-label="ASUP ICT Kazaure — go to homepage"
    >
      <Image
        src="/logo.png"
        alt="ASUP — Academic Staff Union of Polytechnics logo"
        width={48}
        height={48}
        className="rounded-full object-contain"
        priority
      />
      <span className="leading-tight">
        <span className="block font-display font-semibold text-green text-base sm:text-lg">
          ASUP &mdash; ICT Kazaure
        </span>
        <span className="block text-[11px] uppercase tracking-wider text-green/60 font-body">
          Jigawa State Polytechnic Chapter
        </span>
      </span>
    </Link>
  );
}
