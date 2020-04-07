export type CallbackDelegate = (possibleError?: any) => void;

export type JobStepDelegate = (callback: CallbackDelegate) => void;

export type ProxyStepDelegate = (actualStep: JobStepDelegate, callback: CallbackDelegate) => void;