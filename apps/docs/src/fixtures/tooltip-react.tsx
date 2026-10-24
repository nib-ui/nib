import { useTooltip } from '@nib-ui/react/tooltip';

export default function TooltipReact() {
  const tooltip = useTooltip({ id: 'tt' });
  return (
    <span className="fixture-tooltip">
      <button type="button" className="nib-button nib-button--outline" {...tooltip.part('trigger')}>
        Copy
      </button>
      <span className="nib-tooltip" {...tooltip.part('tooltip')}>
        Copies the order id
      </span>
    </span>
  );
}
