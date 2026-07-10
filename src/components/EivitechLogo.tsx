type EivitechLogoProps = {
  className?: string;
};

const logoSrc = `${import.meta.env.BASE_URL}media/brand/eivitech-logo.svg?v=cb3a8cdf`;

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
