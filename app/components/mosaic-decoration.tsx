type MosaicDecorationProps = {
  className?: string;
  variant: "footer" | "home";
};

const diamondPositions = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

function DiamondPattern() {
  return (
    <div className="mosaic-diamond-pattern">
      {diamondPositions.map((position) => (
        <span className={`mosaic-diamond mosaic-diamond--${position}`} key={position} />
      ))}
    </div>
  );
}

export function MosaicDecoration({ className, variant }: MosaicDecorationProps) {
  return (
    <div
      aria-hidden="true"
      className={`mosaic-decoration mosaic-decoration--${variant}${className ? ` ${className}` : ""}`}
    >
      <div className="mosaic-square mosaic-square--monogram">
        <span>Aa</span>
      </div>
      <div className="mosaic-square mosaic-square--stripe mosaic-square--stripe-small" />
      <div className="mosaic-square mosaic-square--stripe mosaic-square--stripe-large" />
      <div className="mosaic-square mosaic-square--diamonds">
        <DiamondPattern />
      </div>
    </div>
  );
}
