import { datePickerApg } from '@nib-ui/core/date-picker/apg';
import type { DatePickerOptions } from '@nib-ui/core/date-picker';
import { useDatePicker } from '@nib-ui/react/date-picker';
import { caseOptions } from './apg-case.ts';

export default function DatePickerReact() {
  const dp = useDatePicker(caseOptions(datePickerApg) as DatePickerOptions);
  return (
    <div className="nib-calendar">
      <div className="nib-calendar__header">
        <button className="nib-button" {...dp.part('prev')}>
          ‹
        </button>
        <h2 className="nib-calendar__title" {...dp.part('title')}>
          {dp.state.title}
        </h2>
        <button className="nib-button" {...dp.part('next')}>
          ›
        </button>
      </div>
      <table className="nib-calendar__grid" {...dp.part('grid')}>
        <thead>
          <tr>
            {dp.state.weekdays.map((w, i) => (
              <th key={i} scope="col" {...dp.part('weekday', String(i))}>
                {w.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dp.state.weeks.map((week, w) => (
            <tr key={w}>
              {week.map((cell, i) =>
                cell ? (
                  <td key={cell.date} {...dp.part('day', cell.date)}>
                    {cell.text}
                  </td>
                ) : (
                  <td key={i} />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
