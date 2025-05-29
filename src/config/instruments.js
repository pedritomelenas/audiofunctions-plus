import * as Tone from 'tone';

export const InstrumentFrequencyType = {
  continuous: 'continuous',
  discretePitchClassBased: 'discretePitchClassBased'
};

// Create a function to set up the organ components
const createOrganInstrument = () => {
  const trem = new Tone.Tremolo({
    frequency: 3,
    depth: 0.2,
    spread: 0
  }).start();

  const saxPartials = [1, 0.7, 0.5, 0.4, 0.3, 0.2];
  
  const saxFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 1000,
    rolloff: -12,
    Q: 1
  });

  const saxEnv = new Tone.AmplitudeEnvelope({
    attack: 0.02,
    decay: 0.1,
    sustain: 0.8,
    release: 0.3
  });

  const saxOsc = new Tone.FatOscillator({
    type: "custom",
    partials: saxPartials,
    count: 3,
    spread: 20
  });

  // Wire up the components
  saxOsc.connect(trem).connect(saxFilter).connect(saxEnv);
  
  // Return an object that includes all components for proper cleanup
  return {
    oscillator: saxOsc,
    envelope: saxEnv,
    tremolo: trem,
    filter: saxFilter,
    start: () => saxOsc.start(),
    stop: () => saxOsc.stop(),
    dispose: () => {
      saxOsc.dispose();
      saxEnv.dispose();
      trem.dispose();
      saxFilter.dispose();
    },
    triggerAttack: (freq) => {
      saxOsc.frequency.setValueAtTime(freq, Tone.now());
      saxEnv.triggerAttack();
    },
    triggerRelease: () => {
      saxEnv.triggerRelease();
    },
    connect: (dest) => saxEnv.connect(dest),
    disconnect: () => saxEnv.disconnect()
  };
};

const generatePitchClasses = () => {
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octaves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const pitchClasses = [];
  
  for (let octave of octaves) {
    for (let note of notes) {
      pitchClasses.push(`${note}${octave}`);
    }
  }
  return pitchClasses;
};

const allPitchClasses = generatePitchClasses();

export const getPitchClasses = (from, to) => {
  const beginIdx = allPitchClasses.indexOf(from);
  const endIdx = allPitchClasses.indexOf(to);
  return allPitchClasses.slice(beginIdx, endIdx + 1);
};

export const createInstruments = () => [
  {
    name: "clarinet",
    instrument: new Tone.FMSynth({
      volume: 0,
      detune: 3,
      portamento: 0,
      harmonicity: 2,
      oscillator: {
        partialCount: 0,
        partials: [],
        phase: 0,
        type: "sine",
      },
      envelope: {
        attack: 0.21000000000000005,
        attackCurve: "linear",
        decay: 0.1,
        decayCurve: "exponential",
        release: 0.05,
        releaseCurve: "exponential",
        sustain: 1,
      },
      modulation: {
        partialCount: 0,
        partials: [],
        phase: 0,
        type: "triangle",
      },
      modulationEnvelope: {
        attack: 0.20000000000000004,
        attackCurve: "linear",
        decay: 0.01,
        decayCurve: "exponential",
        release: 0.5,
        releaseCurve: "exponential",
        sustain: 1,
      },
      modulationIndex: 1,
    }),
    instrumentType: InstrumentFrequencyType.continuous,
    frequencyRange: {
      min: 150,
      max: 2000,
    },
  },
  {
    name: "flute",
    instrument: new Tone.FMSynth({
      harmonicity: 1.0,
      modulationIndex: 0.5,
      oscillator: { type: "sine" },
      envelope: { 
        attack: 0.2, 
        decay: 0.1, 
        sustain: 0.9, 
        release: 0.5 
      },
      modulation: { type: "triangle" },
      modulationEnvelope: { 
        attack: 0.3, 
        decay: 0.2, 
        sustain: 0.5, 
        release: 0.2 
      }
    }),
    instrumentType: InstrumentFrequencyType.continuous,
    frequencyRange: {
      min: 250,
      max: 2300,  // Flute typically has a higher range than clarinet
    },
  },
  {
    name: "organ",
    instrument: createOrganInstrument(),
    instrumentType: InstrumentFrequencyType.continuous,
    frequencyRange: {
      min: 100,
      max: 2500,
    },
  },
  {
    name: "guitar",
    instrument: new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 500,
      resonance: 0.99,
    }),
    instrumentType: InstrumentFrequencyType.discretePitchClassBased,
    availablePitchClasses: getPitchClasses("C3", "C6"),
  },
]; 