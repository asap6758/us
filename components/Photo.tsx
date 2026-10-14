"use client";

import { useRef } from "react";

export function Photo({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number | null;
  height: number | null;
  alt: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="zoomable" onClick={() => ref.current?.showModal()} aria-label="View photo">
        <img src={src} width={width ?? undefined} height={height ?? undefined} alt={alt} loading="lazy" decoding="async" />
      </button>
      <dialog ref={ref} className="lightbox" onClick={() => ref.current?.close()}>
        <img src={src} alt={alt} />
      </dialog>
    </>
  );
}
