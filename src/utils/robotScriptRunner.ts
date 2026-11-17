import { GameEngine } from '../three/GameEngine';

export interface RobotScriptController {
  stop: () => void;
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...fnArgs: unknown[]) => Promise<void>;

export function runRobotScript(
  code: string,
  engine: GameEngine,
  callbacks: {
    onLog: (msg: string) => void;
    onError: (err: string) => void;
    onFinish: () => void;
  }
): RobotScriptController {
  let cancelled = false;

  const ensureActive = () => {
    if (cancelled) {
      throw new Error('__SCRIPT_CANCELLED__');
    }
  };

  const sleep = (seconds: number) =>
    new Promise<void>((resolve, reject) => {
      if (cancelled) {
        reject(new Error('__SCRIPT_CANCELLED__'));
        return;
      }
      const ms = Math.max(0, seconds * 1000);
      const timer = window.setTimeout(() => {
        if (cancelled) {
          reject(new Error('__SCRIPT_CANCELLED__'));
        } else {
          resolve();
        }
      }, ms);

      // Fast check interval so stopping cancels immediately
      const checkCancel = window.setInterval(() => {
        if (cancelled) {
          clearTimeout(timer);
          clearInterval(checkCancel);
          reject(new Error('__SCRIPT_CANCELLED__'));
        }
      }, 40);

      window.setTimeout(() => clearInterval(checkCancel), ms + 50);
    });

  const clamp01 = (v: number) => Math.max(0, Math.min(1, Number(v) || 0));
  const clamp11 = (v: number) => Math.max(-1, Math.min(1, Number(v) || 0));

  const robot = {
    forward: (speed = 0.65) => {
      ensureActive();
      engine.setAutoControl(clamp01(speed), 0);
    },
    backward: (speed = 0.5) => {
      ensureActive();
      engine.setAutoControl(-clamp01(speed), 0);
    },
    left: (speed = 0.6) => {
      ensureActive();
      engine.setAutoControl(0, clamp01(speed));
    },
    right: (speed = 0.6) => {
      ensureActive();
      engine.setAutoControl(0, -clamp01(speed));
    },
    drive: (throttle: number, steer: number) => {
      ensureActive();
      engine.setAutoControl(clamp11(throttle), clamp11(steer));
    },
    setMotors: (leftMotor: number, rightMotor: number) => {
      ensureActive();
      const l = clamp11(leftMotor);
      const r = clamp11(rightMotor);
      const throttle = (l + r) * 0.5;
      const steer = clamp11(r - l);
      engine.setAutoControl(throttle, steer);
    },
    set_motors: (leftMotor: number, rightMotor: number) => {
      robot.setMotors(leftMotor, rightMotor);
    },
    stop: () => {
      engine.setAutoControl(0, 0, false);
    },
    boost: (active: boolean) => {
      ensureActive();
      engine.setAutoBoost(Boolean(active));
    },
    scan: () => {
      ensureActive();
      engine.triggerScan(false);
    },
    getState: () => {
      ensureActive();
      return engine.getAutoTelemetry();
    },
    turnAngle: async (degrees: number, speed = 0.65) => {
      ensureActive();
      const startDeg = engine.getAutoTelemetry().headingDeg;
      const targetDeg = ((startDeg + degrees) % 360 + 360) % 360;
      const dir = degrees >= 0 ? 1 : -1;
      const spd = Math.max(0.25, clamp01(speed));

      const maxDurationMs = 8000;
      const startTime = performance.now();

      while (!cancelled && performance.now() - startTime < maxDurationMs) {
        const curDeg = engine.getAutoTelemetry().headingDeg;
        let diff = ((targetDeg - curDeg + 540) % 360) - 180;
        if (Math.abs(diff) <= 3.5) break;

        const slowFactor = Math.min(1, Math.max(0.35, Math.abs(diff) / 45));
        engine.setAutoControl(0, dir * spd * slowFactor);
        await sleep(0.02);
      }

      engine.setAutoControl(0, 0);
    },
    moveDistance: async (meters: number, speed = 0.65) => {
      ensureActive();
      const start = engine.getAutoTelemetry();
      const targetDist = Math.abs(meters);
      const dir = meters >= 0 ? 1 : -1;
      const spd = Math.max(0.2, clamp01(speed));

      const maxDurationMs = Math.max(2000, targetDist * 450);
      const startTime = performance.now();

      while (!cancelled && performance.now() - startTime < maxDurationMs) {
        const cur = engine.getAutoTelemetry();
        const traveled = Math.hypot(cur.x - start.x, cur.z - start.z);
        const remaining = targetDist - traveled;
        if (remaining <= 0.35) break;

        const slowFactor = Math.min(1, Math.max(0.35, remaining / 2.5));
        engine.setAutoControl(dir * spd * slowFactor, 0);
        await sleep(0.02);
      }

      engine.setAutoControl(0, 0);
    },
  };

  const log = (...args: unknown[]) => {
    if (cancelled) return;
    const text = args
      .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join(' ');
    callbacks.onLog(text);
  };

  (async () => {
    try {
      const fn = new AsyncFunction('robot', 'sleep', 'log', code);
      await fn(robot, sleep, log);
      if (!cancelled) {
        engine.clearAutoControl();
        callbacks.onFinish();
      }
    } catch (err) {
      engine.clearAutoControl();
      if (err instanceof Error && err.message === '__SCRIPT_CANCELLED__') {
        callbacks.onFinish();
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      callbacks.onError(message);
      callbacks.onFinish();
    }
  })();

  return {
    stop: () => {
      cancelled = true;
      engine.clearAutoControl();
    },
  };
}
