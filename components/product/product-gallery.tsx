"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  images: string[];
  name: string;
  discount: number | null;
  inStock: boolean;
}

export function ProductGallery({ images, name, discount, inStock }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : ["/placeholder-product.svg"];
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-background border border-border">
        <Image
          src={gallery[selected]}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {discount && (
          <Badge variant="destructive" className="absolute top-4 left-4 text-sm px-3 py-1">
            -{discount}% OFF
          </Badge>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="secondary" className="text-lg px-4 py-2">Out of Stock</Badge>
          </div>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`View image ${index + 1} of ${name}`}
              aria-current={selected === index}
              onClick={() => setSelected(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 bg-background transition-colors",
                selected === index ? "border-primary" : "border-transparent hover:border-border"
              )}
            >
              <Image
                src={image}
                alt={`${name} - view ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
