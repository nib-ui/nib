import { useToaster } from '@nib-ui/react/toaster';

export default function ToasterReact() {
  const toaster = useToaster({ id: 'tr' });
  const notify = () =>
    toaster.toast({
      title: 'Added to cart',
      body: 'Kenya Nyeri ×2',
      tone: 'success',
      action: { label: 'Undo', onAction: () => undefined },
    });
  return (
    <>
      <button type="button" className="nib-button nib-button--outline" onClick={notify}>
        Notify
      </button>
      <section className="nib-toaster" {...toaster.part('region')}>
        {toaster.state.toasts.map((t) => (
          <div key={t.key} className="nib-toast" {...toaster.part('toast', t.key)}>
            <p className="nib-toast__title">{t.title}</p>
            {t.body && <p className="nib-toast__body">{t.body}</p>}
            <div className="nib-toast__actions">
              {t.action && (
                <button className="nib-button" {...toaster.part('action', t.key)}>
                  {t.action.label}
                </button>
              )}
              <button className="nib-button" {...toaster.part('close', t.key)}>
                Close
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
