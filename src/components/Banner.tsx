import Image from "next/image";

/** Header resmi VIERA (dipotong dari gambar direction). */
export function Banner() {
  return (
    <header className="bg-[linear-gradient(to_bottom,var(--color-brand)_64%,var(--color-accent)_64%)]">
      <Image
        src="/banner.png"
        alt="VIERA — Listening and Reading Comprehension Module"
        width={1919}
        height={156}
        preload
        className="mx-auto block h-auto w-full max-w-[1040px]"
      />
    </header>
  );
}
