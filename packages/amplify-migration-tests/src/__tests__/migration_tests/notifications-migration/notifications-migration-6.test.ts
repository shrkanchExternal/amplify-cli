import {
  addAuthWithDefault,
  addNotificationChannel,
  amplifyPushAuth,
  createNewProjectDir,
  deleteProject,
  deleteProjectDir,
} from '@aws-amplify/amplify-e2e-core';
import { initJSProjectWithProfileV4_52_0, versionCheck } from '../../../migration-helpers';
import { addLegacySmsNotificationChannel } from '../../../migration-helpers/notifications-helpers';
import { getShortId } from '../../../migration-helpers/utils';

describe('amplify add notifications', () => {
  let projectRoot: string;
  const migrateFromVersion = { v: '10.0.0' };
  const migrateToVersion = { v: 'uninitialized' };

  beforeEach(async () => {
    projectRoot = await createNewProjectDir('notification-migration-3');
    await versionCheck(process.cwd(), false, migrateFromVersion);
    await versionCheck(process.cwd(), true, migrateToVersion);
  });

  afterEach(async () => {
    await deleteProject(projectRoot, undefined, true);
    deleteProjectDir(projectRoot);
  });

  it('should add in app notifications if analytics then another notification channel and auth added with an older version', async () => {
    expect(migrateFromVersion.v).not.toEqual(migrateToVersion.v);
    const settings = { resourceName: `notification${getShortId()}` };

    await initJSProjectWithProfileV4_52_0(projectRoot, {}, false);
    await addAuthWithDefault(projectRoot, true);
    await addLegacySmsNotificationChannel(projectRoot, settings.resourceName);
    await addNotificationChannel(projectRoot, settings, 'In-App Messaging', true, true, true);
    await amplifyPushAuth(projectRoot, true);
  });
});
