type EivitechLogoProps = {
  className?: string;
};

const logoSrc = "/ibiza-project-accelerator/media/brand/eivitech-logo-light.png";

export function EivitechLogo({ className = "" }: EivitechLogoProps) {
  const classes = ["block", "h-auto", "object-contain", className].filter(Boolean).join(" ");

  return (
    <img
      src={logoSrc}
      alt="Eivitech instalaciones y reformas"
      className={classes}
      loading="eager"
      decoding="async"
    />
  );
}
