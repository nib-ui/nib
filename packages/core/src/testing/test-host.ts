import type { Host, Size } from '../host.ts';
import type { Intent, NibEvent, Part } from '../types.ts';
import { fakeClock, type FakeClock } from './fake-clock.ts';
import { fakeGeometry, type FakeGeometry } from './fake-geometry.ts';

export interface TestHost {
  /** Pass to a controller as its host. */
  host: Host;
  clock: FakeClock;
  geometry: FakeGeometry;
  /** Every intent returned by `fire`, in order. */
  intents: Intent[];
  /** Whether the last fired event had preventDefault called. */
  prevented: boolean;
  /** Sends a structural event to a part, as a binding would, and returns the intents. */
  fire(part: Part, type: string, init?: Omit<Partial<NibEvent>, 'type' | 'preventDefault'>): readonly Intent[];
}

/** The host tests cross a controller's interface with: fake clock, fake geometry, intent log. */
export function createTestHost({ viewport }: { viewport?: Size } = {}): TestHost {
  const clock = fakeClock();
  const geometry = fakeGeometry(viewport);
  const t: TestHost = {
    host: { clock, geometry },
    clock,
    geometry,
    intents: [],
    prevented: false,
    fire(part, type, init = {}) {
      const handler = part.on[type];
      if (!handler) throw new Error(`Part ${String(part.attrs['id'] ?? '(no id)')} has no ${type} handler`);
      t.prevented = false;
      const intents = handler({ ...init, type, preventDefault: () => void (t.prevented = true) });
      t.intents.push(...intents);
      return intents;
    },
  };
  return t;
}
