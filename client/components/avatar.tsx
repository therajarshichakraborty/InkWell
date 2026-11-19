import Image from "next/image";
import { cn, initials } from "@/lib/utils";

type AvatarProps = {
  name: string;
  image: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ name, image, size = 28, className }: AvatarProps) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground",
        className,
      )}>
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes={`${size * 2}px`}
          className='object-cover'
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
