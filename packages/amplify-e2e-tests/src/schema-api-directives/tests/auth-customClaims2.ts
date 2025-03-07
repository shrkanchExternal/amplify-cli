/* eslint-disable */
import path from 'path';
import fs from 'fs-extra';
import {
  addAuthWithPreTokenGenerationTrigger,
  addApiWithCognitoUserPoolAuthTypeWhenAuthExists,
  updateAuthAddUserGroups,
  amplifyPush,
} from '@aws-amplify/amplify-e2e-core';

import { getUserPoolId, configureAmplify, setupUser, signInUser, getConfiguredAppsyncClientCognitoAuth } from '../authHelper';

import { updateSchemaInTestProject, testMutation } from '../common';

const GROUPNAME = 'Moderator';
const USERNAME = 'user1';
const PASSWORD = 'user1Password';

export async function runTest(projectDir: string, testModule: any) {
  await addAuthWithPreTokenGenerationTrigger(projectDir);
  updateTriggerHandler(projectDir);
  await updateAuthAddUserGroups(projectDir, [GROUPNAME]);
  await addApiWithCognitoUserPoolAuthTypeWhenAuthExists(projectDir, { transformerVersion: 2 });
  updateSchemaInTestProject(projectDir, testModule.schema);
  await amplifyPush(projectDir);

  const awsconfig = configureAmplify(projectDir);
  const userPoolId = getUserPoolId(projectDir);

  await setupUser(userPoolId, USERNAME, PASSWORD, GROUPNAME);

  const user = await signInUser(USERNAME, PASSWORD);
  const appSyncClient = getConfiguredAppsyncClientCognitoAuth(awsconfig.aws_appsync_graphqlEndpoint, awsconfig.aws_appsync_region, user);

  await testMutation(appSyncClient, createPostMutation, undefined, expectedResultCreatePostMutation);
}

export function updateTriggerHandler(projectDir: string) {
  const backendFunctionDirPath = path.join(projectDir, 'amplify', 'backend', 'function');
  const functionName = fs.readdirSync(backendFunctionDirPath)[0];
  const triggerHandlerFilePath = path.join(backendFunctionDirPath, functionName, 'src', 'alter-claims.js');
  fs.writeFileSync(triggerHandlerFilePath, func);
}

// schema
export const schema = `
#error: two @model on type Post
#change: removed on @model
type Post
@model
@auth(rules: [
  {allow: owner, identityClaim: "username"},
  {allow: groups, groups: ["Moderator"], groupClaim: "user_groups"}
])
{
  id: ID!
  owner: String
  name: String
  content: String
}
##customClaims`;

export const func = `
exports.handler = async event => {
  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        username: event.userName
      }
    }
  };
  return event;
};
`;

export const createPostMutation = `
mutation CreatePost {
  createPost(input: {
    id: "1",
    name: "post1",
    content: "post1 content"
  }) {
    id
    owner
    name
    content
    createdAt
    updatedAt
  }
}
`;

export const expectedResultCreatePostMutation = {
  data: {
    createPost: {
      id: '1',
      owner: 'user1',
      name: 'post1',
      content: 'post1 content',
      createdAt: '<check-defined>',
      updatedAt: '<check-defined>',
    },
  },
};
/* eslint-enable */
