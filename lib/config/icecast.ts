export const icecastConfig = {
  hostname: process.env.ICECAST_HOSTNAME || '212.84.160.3',
  port: parseInt(process.env.ICECAST_PORT || '5994'),
  mountPoint: process.env.ICECAST_MOUNT_POINT || '/stream',
  password: process.env.ICECAST_PASSWORD || '279687377dj',
  getStreamUrl: () => {
    return `http://${icecastConfig.hostname}:${icecastConfig.port}${icecastConfig.mountPoint}`;
  },
  getAdminUrl: () => {
    return `http://${icecastConfig.hostname}:${icecastConfig.port}/admin`;
  }
};
