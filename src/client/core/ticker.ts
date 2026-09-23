/**
 * One requestAnimationFrame loop for the whole page. It only runs while
 * something is subscribed, so an idle page costs nothing.
 */
export type Tick = (time: number, dtMs: number) => void;

const subscribers = new Set<Tick>();
let frame = 0;
let last = 0;

function loop(time: number): void {
  const dt = last ? Math.min(64, time - last) : 16.7;
  last = time;
  for (const fn of Array.from(subscribers)) fn(time, dt);
  if (subscribers.size) {
    frame = requestAnimationFrame(loop);
  } else {
    frame = 0;
    last = 0;
  }
}

export function addTick(fn: Tick): () => void {
  subscribers.add(fn);
  if (!frame) frame = requestAnimationFrame(loop);
  return () => {
    subscribers.delete(fn);
  };
}
