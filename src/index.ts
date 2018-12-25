import { Recorder } from './recorder';

const registerUxRecorder = () => {
    const scriptHostUrl = document.getElementById('ux-recorder-script-tag') as HTMLScriptElement;
    const recorder = new Recorder(new URL(scriptHostUrl.src).origin, document);
    document.defaultView["UX-Recorder"] = recorder.sessionData;
    recorder.init();
}

if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', registerUxRecorder);
else registerUxRecorder();
