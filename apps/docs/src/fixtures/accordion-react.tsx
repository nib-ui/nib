import { disclosureApg } from '@nib-ui/core/disclosure/apg';
import type { AccordionOptions } from '@nib-ui/core/disclosure';
import { useAccordion } from '@nib-ui/react/disclosure';
import { caseOptions } from './apg-case.ts';

export default function AccordionReact() {
  const options = caseOptions(disclosureApg) as unknown as AccordionOptions;
  const accordion = useAccordion(options);
  return (
    <div className="nib-accordion">
      {options.items.map((item) => (
        <div key={item.key} className="nib-accordion__item">
          <h3 className="nib-accordion__heading">
            <button type="button" className="nib-disclosure__trigger" {...accordion.part('trigger', item.key)}>
              {item.key}
            </button>
          </h3>
          <div className="nib-disclosure__panel" {...accordion.part('panel', item.key)}>
            {item.key}
          </div>
        </div>
      ))}
    </div>
  );
}
