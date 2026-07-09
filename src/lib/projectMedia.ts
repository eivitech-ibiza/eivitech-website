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

    "/media/projects/casa-vadella/cover.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-investment-villa-makeover-cover.webp",
    "/media/projects/casa-vadella/vadella-01.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-open-plan-living-room.webp",
    "/media/projects/casa-vadella/vadella-02.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-dining-living-space.webp",
    "/media/projects/casa-vadella/vadella-03.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-fireplace-living-detail.webp",
    "/media/projects/casa-vadella/vadella-04.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-covered-terrace.webp",
    "/media/projects/casa-vadella/vadella-05.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-mediterranean-landscape.webp",
    "/media/projects/casa-vadella/vadella-06.jpg": "/media/projects/casa-vadella/casa-vadella-ibiza-bathroom-blue-microcement.webp",

    "/media/projects/casa-charlie/cover.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-authentic-finca-restoration-cover.webp",
    "/media/projects/casa-charlie/charlie-01.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-stone-interior-hall.webp",
    "/media/projects/casa-charlie/charlie-02.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-restored-stone-room.webp",
    "/media/projects/casa-charlie/charlie-03.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-stone-wall-wood-beams.webp",
    "/media/projects/casa-charlie/charlie-04.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-rustic-living-travertine-floor.webp",
    "/media/projects/casa-charlie/charlie-05.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-stone-kitchen.webp",
    "/media/projects/casa-charlie/charlie-06.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-kitchen-island.webp",
    "/media/projects/casa-charlie/charlie-07.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-bathroom-freestanding-tub.webp",
    "/media/projects/casa-charlie/charlie-08.jpg": "/media/projects/casa-charlie/casa-charlie-ibiza-white-finca-exterior.webp",

    "/media/projects/proyecto-paisajismo-exterior/cover.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-low-maintenance-mediterranean-landscape-cover.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-01.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-gravel-driveway-natural-stone-wall.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-02.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-gravel-garden-plant-island.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-03.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-mediterranean-gravel-paths.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-04.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-dry-beach-cactus-garden.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-05.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-cactus-sand-garden.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-06.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-pool-shade-sail-cactus-landscape.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-07.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-hammock-relax-area.webp",
    "/media/projects/proyecto-paisajismo-exterior/paisajismo-08.jpg": "/media/projects/proyecto-paisajismo-exterior/paisajismo-exterior-ibiza-villa-terrace-tropical-plants.webp",
  };

  return mediaRewrites[path] || path;
}
