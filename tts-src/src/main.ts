import './app_clean.css';
import { setupTextToSpeech, cleanupTextToSpeech } from './tasks/text-to-speech';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="app-container">
    <main class="main-content">
      <div id="task-stage" class="task-stage"></div>
    </main>
  </div>
`;

const stage = app.querySelector('#task-stage') as HTMLElement;
setupTextToSpeech(stage);

// Expose cleanup for hot-reload / debugging.
(window as any).cleanupActiveTask = () => cleanupTextToSpeech();
