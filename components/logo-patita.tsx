import Image from "next/image"

export function LogoPatita({ className }: { className?: string }) {
  return (
    <Image
      src="/patita.png"
      alt="Patita Andrea Peluquería Canina"
      width={36}
      height={36}
      className={className}
    />
  )
}