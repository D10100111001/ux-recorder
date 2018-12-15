import { Recorder } from './recorder';

const registerUxRecorder = (e: Event) => {
    const recorder = new Recorder(document);
    document.defaultView["UX-Recorder"] = recorder.sessionData;
    recorder.init();
}

document.addEventListener('DOMContentLoaded', registerUxRecorder);