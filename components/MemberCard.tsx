import Image from "next/image";
import type { Member } from "@/lib/types";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <article className="bg-white/70 border border-green/10 rounded-md overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full aspect-[4/3] bg-green/5">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.full_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-green/30 font-display text-4xl">
            {member.full_name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg text-green">{member.full_name}</h3>
        <p className="text-xs uppercase tracking-wide text-red font-semibold mt-1">
          {member.role}
        </p>
        <p className="text-sm text-ink/70 mt-3 leading-relaxed">{member.bio}</p>
      </div>
    </article>
  );
}
