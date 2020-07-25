import WebMidi, { Input, Output } from "webmidi";
import { state, MidiConnectionState } from "./state";
import { isConnected, isConnecting } from "./computed";
import { logger } from "../../../util";
import { Block } from "../../../definitions";

// Local states

let loadMidiPromise = (null as unknown) as Promise<void>;

// Helpers

const setConnectionState = (value: MidiConnectionState): void => {
  state.connectionState = value;
};

const connectionWatcher = async (): Promise<void> => {
  if (!isConnected() && !isConnecting()) {
    loadMidi();
  }

  setTimeout(() => connectionWatcher(), 4000);
};

const assignInputs = () => {
  state.inputs = WebMidi.inputs;
  state.outputs = WebMidi.outputs;
};

// Actions

export const findInputOutput = async (
  inputId: string
): Promise<{ input: Input; output: Output }> => {
  await loadMidi();

  const input = WebMidi.inputs.find((input: Input) => input.id === inputId);
  if (!input) {
    // @TODO: show alert warning
    throw new Error(`CANNOT FIND INPUT ${inputId}`);
  }
  const output = WebMidi.outputs.find(
    (output: Output) => output.name === input.name
  );
  if (!output) {
    // @TODO: show alert warning
    throw new Error(`CANNOT FIND OUTPUT FOR INPUT ${inputId}`);
  }

  return { input, output };
};

export const loadMidi = async (): Promise<void> => {
  if (loadMidiPromise) {
    return loadMidiPromise;
  }
  if (WebMidi.enabled) {
    setConnectionState(MidiConnectionState.Open);
    return;
  }

  loadMidiPromise = newMidiLoadPromise();

  return loadMidiPromise;
};

const newMidiLoadPromise = async (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (WebMidi.enabled) {
      setConnectionState(MidiConnectionState.Open);
      return resolve();
    }

    setConnectionState(MidiConnectionState.Pending);
    WebMidi.enable(function (error) {
      if (error) {
        logger.error("Failed to load WebMidi", error);
        reject(error);
      } else {
        assignInputs();
        setConnectionState(MidiConnectionState.Open);
        loadMidiPromise = (null as unknown) as Promise<void>;
        return resolve();
      }
    }, true);
  });

const isControlDisabled = (block: Block, key: string): boolean =>
  state.disableUiControls.some((d) => d.key === key && d.block === block);

const disableControl = (block: Block, key: string): void => {
  const isDisabled = isControlDisabled(block, key);
  if (!isDisabled) {
    state.disableUiControls.push({ block, key });
  }
};

// Export

export interface IMidiActions {
  startConnectionWatcher: () => Promise<void>;
  loadMidi: () => Promise<void>;
  findInputOutput: (
    inputId: string
  ) => Promise<{ input: Input; output: Output }>;
  disableControl: (block: Block, key: string) => void;
  isControlDisabled: (block: Block, key: string) => boolean;
}

export const midiStoreActions: IMidiActions = {
  startConnectionWatcher: () => connectionWatcher(),
  loadMidi,
  findInputOutput,
  disableControl,
  isControlDisabled,
};