export const icecastConfig = {
  hostname: process.env.ICECAST_HOSTNAME!,
  port: parseInt(process.env.ICECAST_PORT!),
  mountPoint: process.env.ICECAST_MOUNT_POINT!,
  password: process.env.ICECAST_PASSWORD!,
  getStreamUrl: () => {
    return `http://${icecastConfig.hostname}:${icecastConfig.port}${icecastConfig.mountPoint}`;
  },
  getAdminUrl: () => {
    return `http://${icecastConfig.hostname}:${icecastConfig.port}/admin`;
  }
};
