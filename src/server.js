import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`ChartBackend listening on :${config.port} (provider=${config.aiProvider}, appCheckEnforced=${config.appCheckEnforced})`);
});
