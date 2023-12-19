import { join } from 'path';
import { getTokenGDrive } from 'utils-google-drive';
getTokenGDrive({
  pathCredentials: join(process.cwd(), 'credentials', 'drive-credentials.json'),
});
