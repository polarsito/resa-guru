import { config } from 'dotenv';
config();

import '@sapphire/plugin-i18next/register';
import { container } from '@sapphire/framework';
import { RESAGuru } from '@lib/structures/RESAGuru';

const main = async (): Promise<void> => {
  const client = new RESAGuru();
  try {
    await client.initialize();
  } catch (err) {
    container.logger.fatal(err);
    client.destroy();
    process.exit(1);
  }
};

main();

process.on('unhandledRejection', (error) => {
  container.logger.error(error);
});
