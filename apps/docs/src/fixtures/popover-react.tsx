import { usePopover } from '@nib-ui/react/popover';

export default function PopoverReact() {
  const popover = usePopover({ id: 'pp' });
  return (
    <div className="fixture-popover">
      <button type="button" className="nib-button nib-button--outline" {...popover.part('trigger')}>
        Filters
      </button>
      <div className="nib-popover" {...popover.part('content')}>
        <button type="button" className="nib-button">
          Apply
        </button>
      </div>
    </div>
  );
}
