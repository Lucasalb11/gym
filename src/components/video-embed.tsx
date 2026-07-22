"use client";

import { useState } from "react";
import { Play } from "lucide-react";

function videoIdOf(url: string): string | null {
  const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

/** Player de vídeo sob demanda: só carrega o iframe quando o usuário pede. */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const id = videoIdOf(url);

  // URL antiga (busca) ou não reconhecida: cai para link externo
  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Play className="size-4" aria-hidden />
        Ver vídeo da técnica
      </a>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Assistir vídeo: ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-6 translate-x-0.5" aria-hidden />
          </span>
        </span>
      </button>
    );
  }

  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
      title={`Vídeo: ${title}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video w-full rounded-lg border-0"
    />
  );
}
