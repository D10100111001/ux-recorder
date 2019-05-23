import { RecorderService } from './services/recorder-service';

const registerUxRecorder = () => {
    const scriptHostUrl = document.getElementById('ux-recorder-script-tag') as HTMLScriptElement | null;
    const recorder = new RecorderService(scriptHostUrl ? new URL(scriptHostUrl.src).origin : '', 'test', document);
    recorder.init().then((sessionData) => document.defaultView["UX-Recorder"] = sessionData);
}

if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', registerUxRecorder);
else registerUxRecorder();
