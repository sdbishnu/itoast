import { RUNTIME_STATES } from "./runtime-state.js";
import { RuntimeError } from "./runtime-error.js";

const VALID_TRANSITIONS = Object.freeze({
  [RUNTIME_STATES.CREATED]: [
    RUNTIME_STATES.STARTING,
    RUNTIME_STATES.STOPPED
  ],
  [RUNTIME_STATES.STARTING]: [
    RUNTIME_STATES.RUNNING,
    RUNTIME_STATES.FAILED
  ],
  [RUNTIME_STATES.RUNNING]: [
    RUNTIME_STATES.STOPPING,
    RUNTIME_STATES.FAILED
  ],
  [RUNTIME_STATES.STOPPING]: [
    RUNTIME_STATES.STOPPED,
    RUNTIME_STATES.FAILED
  ],
  [RUNTIME_STATES.STOPPED]: [
    RUNTIME_STATES.STARTING
  ],
  [RUNTIME_STATES.FAILED]: [
    RUNTIME_STATES.STOPPING,
    RUNTIME_STATES.STOPPED
  ]
});

export function canTransition(currentState, nextState) {
  return VALID_TRANSITIONS[currentState]?.includes(nextState) ?? false;
}

export function transitionState(currentState, nextState) {
  if (!canTransition(currentState, nextState)) {
    throw new RuntimeError(
      `Invalid runtime state transition: ${currentState} -> ${nextState}`,
      "RUNTIME_INVALID_STATE_TRANSITION",
      {
        currentState,
        nextState
      }
    );
  }

  return nextState;
}
