import { useDialog } from '@nib-ui/react/dialog';

export default function DialogReact() {
  const dialog = useDialog({ id: 'dl' });
  return (
    <div>
      <button type="button" className="nib-button nib-button--outline" {...dialog.part('trigger')}>
        Archive
      </button>
      <dialog className="nib-dialog" {...dialog.part('dialog')}>
        <div className="nib-dialog__header">
          <h2 className="nib-dialog__title" {...dialog.part('title')}>
            Archive order #1042?
          </h2>
        </div>
        <p className="nib-dialog__body" {...dialog.part('description')}>
          You can restore it from the archive later.
        </p>
        <div className="nib-dialog__footer nib-action-row">
          <button type="button" className="nib-button" {...dialog.part('close')}>
            Cancel
          </button>
          <button type="button" className="nib-button nib-button--primary">
            Archive
          </button>
        </div>
      </dialog>
    </div>
  );
}
