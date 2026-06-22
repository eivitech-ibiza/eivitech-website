type EivitechLogoProps = {
  className?: string;
};

export function EivitechLogo({ className = "" }: EivitechLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 104"
      role="img"
      aria-labelledby="eivitech-logo-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="eivitech-logo-title">Eivitech instalaciones y reformas</title>
      <g transform="translate(3 5)">
        <path d="M44 0C24 2 8 16 2 36l89-23C79 5 62-2 44 0Z" fill="#de9650" />
        <path d="M0 43c0 24 19 43 43 43 11 0 22-4 30-12l-8-30-39 10-4-14 58-15 13 51c9-13 11-31 3-46L0 43Z" fill="#2b211c" />
        <path d="M30 57 64 48l3 11-34 9-3-11Z" fill="#f7f2eb" opacity="0.92" />
      </g>
      <g transform="translate(112 27)">
        <text
          x="0"
          y="30"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="38"
          fontWeight="800"
          letterSpacing="-1.5"
          fill="#2b211c"
        >
          EIVI
        </text>
        <text
          x="105"
          y="30"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="38"
          fontWeight="800"
          letterSpacing="-1.5"
          fill="#de9650"
        >
          TECH
        </text>
        <text
          x="4"
          y="64"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="18"
          fontWeight="800"
          letterSpacing="0.5"
          fill="#2b211c"
        >
          INSTALACIONES | REFORMAS
        </text>
      </g>
    </svg>
  );
}
