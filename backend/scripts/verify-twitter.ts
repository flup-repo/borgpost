import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verifyTwitterCredentials() {
  console.log('Verifying Twitter credentials...');

  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    console.error('❌ Missing Twitter credentials in .env file');
    return;
  }

  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  const rwClient = client.readWrite;

  try {
    console.log('Attempting to fetch user details (v2.me)...');
    const me = await rwClient.v2.me();
    console.log(`✅ Successfully logged in as: ${me.data.username} (ID: ${me.data.id})`);
  } catch (error) {
    console.error('❌ Failed to fetch user details:', error.message);
    if (error.code === 403) {
      console.error('This usually indicates invalid credentials or lack of API access.');
    }
    return;
  }

  try {
    console.log('\nAttempting to check Write permissions (posting a test tweet)...');
    console.log('NOTE: This WILL create a real tweet if successful. You should delete it manually.');
    const testTweet = await rwClient.v2.tweet(`Test tweet from BorgPost verification script at ${new Date().toISOString()}`);
    console.log(`✅ Successfully posted tweet! ID: ${testTweet.data.id}`);
    console.log(`Text: ${testTweet.data.text}`);

    // Optional: Attempt to delete it immediately
    try {
      console.log('Attempting to clean up (delete) the test tweet...');
      await rwClient.v2.deleteTweet(testTweet.data.id);
      console.log('✅ Successfully deleted test tweet.');
    } catch (delError) {
      console.warn('⚠️ Could not delete test tweet. You may need to delete it manually.');
    }

  } catch (error) {
    console.error('\n❌ FAILED to post tweet.');
    console.error(`Error Code: ${error.code}`);
    console.error(`Message: ${error.message}`);

    if (error.data) {
      console.error('API Response Data:', JSON.stringify(error.data, null, 2));
    }

    if (error.code === 403) {
      console.error('\n--- DIAGNOSIS ---');
      console.error('You have "Read-Only" permissions on your Access Token.');
      console.error('Even if your App Settings say "Read and Write", the Access Token itself was generated BEFORE that change or defaulted to Read-Only.');
      console.error('SOLUTION: Go to Twitter Developer Portal -> Keys and Tokens -> Access Token and Secret -> Click "Regenerate".');
    }
  }
}

verifyTwitterCredentials();
