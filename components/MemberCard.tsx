import Image from "next/image";
import type { Member } from "@/lib/types";

export default function MemberCard({ member }: { member: Member }) {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
      <div className="relative w-full aspect-[4/3] bg-blue-50">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.full_name}
            fill
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-asup-primary">
            {member.full_name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-asup-primary text-base leading-tight">
          {member.full_name}
        </h3>
        <p className="text-xs font-semibold text-asup-secondary mt-1 uppercase tracking-wide">
          {member.role}
        </p>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-4">
          {member.bio}
        </p>
      </div>
    </article>
  );
}