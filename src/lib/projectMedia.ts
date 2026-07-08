export function resolveProjectMediaPath(path: string) {
  const casaVinyaRewrites: Record<string, string> = {
    "/media/projects/casa-vinya/cover.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-luxury-mediterranean-villa-cover.webp",
    "/media/projects/casa-vinya/IMG_2597.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-living-room-fireplace.webp",
    "/media/projects/casa-vinya/IMG_2599.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-open-plan-living.webp",
    "/media/projects/casa-vinya/IMG_2603.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-kitchen-island-wood.webp",
    "/media/projects/casa-vinya/IMG_2610.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-natural-wood-storage.webp",
    "/media/projects/casa-vinya/IMG_2612.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-bedroom-terrace.webp",
    "/media/projects/casa-vinya/IMG_2614.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-bathroom-freestanding-tub.webp",
    "/media/projects/casa-vinya/IMG_2616.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-double-vanity.webp",
    "/media/projects/casa-vinya/IMG_2622.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-stone-shower-detail.webp",
  };

  return casaVinyaRewrites[path] || path;
}
