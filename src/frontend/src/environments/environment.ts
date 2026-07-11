export const environment = {
  production: false,
  // Direct API URL (aligned with launchSettings.json http profile).
  // Angular proxy.conf.json also forwards /api and /hub → localhost:5000.
  apiUrl: 'http://localhost:5000/api',
  hubUrl: 'http://localhost:5000/hub/notificacoes',
};
