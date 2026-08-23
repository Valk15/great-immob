import Image from "next/image";
import { LISTING } from "@/lib/listing";

export function PhotoGrid() {
  const [hero, ...rest] = LISTING.photos;
  return (
    <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[28rem]">
      <div className="relative md:col-span-2 md:row-span-2 min-h-56 overflow-hidden bg-mist">
        <Image src={hero.src} alt={hero.alt} fill className="object-cover" priority sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
      {rest.slice(0, 4).map((photo) => (
        <div key={photo.src} className="relative hidden min-h-32 overflow-hidden bg-mist md:block">
          <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="25vw" />
        </div>
      ))}
    </div>
  );
}
