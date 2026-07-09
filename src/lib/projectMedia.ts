export function resolveProjectMediaPath(path: string) {
  const mediaRewrites: Record<string, string> = {
    "/media/projects/casa-vinya/cover.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-luxury-mediterranean-villa-cover.webp",
    "/media/projects/casa-vinya/IMG_2597.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-living-room-fireplace.webp",
    "/media/projects/casa-vinya/IMG_2599.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-open-plan-living.webp",
    "/media/projects/casa-vinya/IMG_2603.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-kitchen-island-wood.webp",
    "/media/projects/casa-vinya/IMG_2610.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-natural-wood-storage.webp",
    "/media/projects/casa-vinya/IMG_2612.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-bedroom-terrace.webp",
    "/media/projects/casa-vinya/IMG_2614.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-bathroom-freestanding-tub.webp",
    "/media/projects/casa-vinya/IMG_2616.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-double-vanity.webp",
    "/media/projects/casa-vinya/IMG_2622.jpg": "/media/projects/casa-vinya/casa-vinya-ibiza-stone-shower-detail.webp",

    "/media/projects/casa-mediterraneo/cover.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-warm-contemporary-apartment-cover.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-01.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-dining-kitchen.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-02.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-kitchen-front.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-03.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-kitchen-wood-cabinets.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-04.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-custom-wood-dining-table.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-05.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-bathroom-vanity.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-06.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-bathroom-shower.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-07.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-textured-wall-lighting.webp",
    "/media/projects/casa-mediterraneo/mediterraneo-08.jpg": "/media/projects/casa-mediterraneo/casa-mediterraneo-ibiza-microcement-material-detail.webp",
  };

  return mediaRewrites[path] || path;
}
