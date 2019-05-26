import { RecorderService } from './services/recorder-service';

const registerUxRecorder = () => {
    const scriptElement = document.getElementById('ux-recorder-script-tag') as HTMLScriptElement | null;
    const baseSessionApiUrl = scriptElement.getAttribute('session-api-url') || 'http://localhost:8080/api/projects/';
    const baseEventApiUrl = scriptElement.getAttribute('event-api-url') || 'http://localhost:8080/api/projects/';
    const recorder = new RecorderService(scriptElement ? new URL(scriptElement.src).origin : '', baseSessionApiUrl, baseEventApiUrl, 'test', document);
    recorder.init().then((sessionData) => document.defaultView["UX-Recorder"] = sessionData);
}

if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', registerUxRecorder);
else registerUxRecorder();
