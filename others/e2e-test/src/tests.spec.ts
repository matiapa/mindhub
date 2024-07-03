/* eslint-disable no-console */
import {
  UpdateProfileReqDto,
  UsersApiFactory,
  FriendshipsApiFactory,
  RecommendationsApiFactory,
  InterestsApiFactory,
  RatesApiFactory,
  MessagesApiFactory,
  ProvidersApiFactory,
  TextsApiFactory,
  RecommendationDto,
  FriendshipDto,
  MessageDto,
  GivenRateDto,
  UserInterestDto,
  UserTextDto,
  ProviderConnectionDto,
} from 'user-api-sdk';
import { MongoClient } from "mongodb";
import fs from "fs";
import { ObjectId } from 'bson';

const host = process.env.E2E_API_URI!;
const idToken = process.env.E2E_ID_TOKEN!;

const TIMEOUT = 30000;

const usersApi = UsersApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const providersApi = ProvidersApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const interestsApi = InterestsApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const textsApi = TextsApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const recommendationsApi = RecommendationsApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const friendsApi = FriendshipsApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const ratesApi = RatesApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })
const messagesApi = MessagesApiFactory({ basePath: host, accessToken: () => idToken, isJsonMime: () => true })

// ------------------------------------------ TEST DATA ------------------------------------------

const authUserId = "b1816787-bb01-4c0d-b262-bb82bbdc83f3";
const userId1 = "668431ed79ebd5efafd499b1";
const userId2 = "668431f979ebd5efafd499b2";

const signupToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiMTgxNjc4Ny1iYjAxLTRjMGQtYjI2Mi1iYjgyYmJkYzgzZjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzE5ODg3NjM2LCJleHAiOjE3MTk4OTEyMzYsImlzcyI6ImNvZ25pdG8tc2lnbnVwLWhhbmRsZXIifQ.x3bgEOlaJH6ilXw6qJHNzhE3v0NA3dl55KbO6CjA9T0";

const profilePicFilePath = "data/profile_pic.png";

const twitterDataFilePath = "data/twitter-sample.zip";
const expectedTextsAmount = 50;
const expectedSampleText = {
  rawText: "A beautiful sunrise this morning! Every day is a new opportunity to chase our dreams. #MorningMotivation #Sunrise",
  language: "en",
};

const expectedPersonality = { o: 1, c: 0.8, e: 0.6, a: 0.8, n: 0.4 };

const expectedFirstRecommendationScore = {
  global: 0.1773672727272727,
  friendship: { score: 0.25338181818181815, by_ratings: 0, by_personality: 0.25338181818181815 },
  interests: {
    category: { artist: 0, track: 0 },
    score: 0,
  },
};

const picturesBucketUrl = "https://user-pictures-bucket-test.s3.amazonaws.com";

let i_test = 1;
const n_tests = 23;

const bar = () => `[${"=".repeat(i_test - 1) + " ".repeat(n_tests - (i_test - 1))}] (${Math.round(((i_test - 1) / n_tests) * 100)}%)`;

// -----------------------------------------------------------------------------------------------


describe('MindHub API Tests', () => {

  beforeAll(async () => {    
    console.log("Preparing database...")

    let client = new MongoClient(process.env.E2E_MONGO_URI!);

    client = await client.connect();

    const db = client.db("test");

    await db.collection("users").deleteMany({});
    await db.collection("providerconnections").deleteMany({});
    await db.collection("interests").deleteMany({});
    await db.collection("texts").deleteMany({});
    await db.collection("bigfive").deleteMany({});
    await db.collection("recommendations").deleteMany({});
    await db.collection("friendships").deleteMany({});
    await db.collection("messages").deleteMany({});
    await db.collection("rates").deleteMany({});

    await db.collection("users").insertMany([
      { _id: userId1 as any as ObjectId, email: "test1@test.com", profile: { name: "Test User 1", gender: "man", birthday: "1990-01-01", completed: true } },
      { _id: userId2 as any as ObjectId, email: "test2@test.com", profile: { name: "Test User 2", gender: "man", birthday: "1990-01-01", completed: true } }
    ]);

    await db.collection("bigfive").insertMany([
      { userId: userId1, o: 0.2, c: 0.4, e: 0.3, a: 0.5, n: 0.8 },
      { userId: userId2, o: 0.6, c: 0.1, e: 0.2, a: 0.8, n: 0.3 },
    ]);

    await db.collection("interests").insertMany([
      { userId: userId1, provider: "spotify", relevance: "normal", resource: {id: "track1", name: "Track 1", type: "track"} },
      { userId: userId1, provider: "spotify", relevance: "normal", resource: {id: "track2", name: "Track 2", type: "track"} },
    ]);

    await db.collection("friendships").insertMany([
      { proposer: userId1, target: authUserId, status: "pending" },
      { proposer: userId2, target: authUserId, status: "pending" },
    ]);

    await client.close();

    console.log("Done. Running tests...")
  }, TIMEOUT);

  // ---------------------------------------------------------------------------------

  describe('Sign up the user and complete profile', () => {
    it('should sign up a user', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await usersApi.usersControllerSignupUser({ token: signupToken });

      expect(response.status).toBe(201);
    }, TIMEOUT);

    it('should update authenticated user profile', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await usersApi.usersControllerUpdateProfile({
        gender: 'man',
        birthday: '1990-01-01',
        biography: 'Test bio'
      });

      expect(response.status).toBe(200);
    }, TIMEOUT);

    it('should get authenticated user information', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await usersApi.usersControllerGetOwnUser();

      expect(response.status).toBe(200);

      expect(response.data.profile).toEqual({
        name: "Test User",
        gender: 'man',
        birthday: '1990-01-01T00:00:00.000Z',
        biography: 'Test bio',
        completed: true,
      });
    }, TIMEOUT); 
  });

  describe('Upload a profile picture', () => {
    it('should be able to upload the picture', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response1 = await usersApi.usersControllerGetPictureUploadUrl('image/png');
      
      expect(response1.data).toBeDefined();

      const profilePicFile = fs.readFileSync(profilePicFilePath);

      let response2 = await fetch(response1.data, {
        method: 'PUT',
        headers: {
            'Content-Type': "img/png",
        },
        body: profilePicFile,
      });

      expect(response2.status).toBe(200);
      
      response2 = await fetch(`${picturesBucketUrl}/${authUserId}`)

      expect(response2.status).toBe(200);
    }, TIMEOUT);
  });

  // ---------------------------------------------------------------------------------

  describe('List and connect/remove providers', () => {
    it('should connect Twitter with data file', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      // Get the file upload URL

      const response1 = await providersApi.fileControllerGetFileUploadUrl("twitter")

      expect(response1.data).toBeDefined();

      // Upload the data file

      const twitterDataFile = fs.readFileSync(twitterDataFilePath);

      const response2 = await fetch(response1.data, {
        method: 'PUT',
        headers: {
            'Content-Type': "application/zip",
        },
        body: twitterDataFile,
      });

      expect(response2.status).toBe(200);

      // Wait for the file to be processed

      await new Promise((resolve, reject) => setTimeout(resolve, 5000))

      // Check that connection has been established

      const response3 = await providersApi.connectionsControllerGetConnections();

      expect(response3.data.connections.some((c: ProviderConnectionDto) => c.provider == "twitter" && c.lastProcessed && c.lastProcessed.success)).toBeTruthy();
    }, TIMEOUT);

    /* We left out this test because extracted texts are needed for the following stage
    it('should remove Twitter connection', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      // Remove the connection

      const response1 = await providersApi.connectionsControllerDeleteConnection("twitter")

      expect(response1.status).toBe(200);

      // Check that connection has been removed

      const response3 = await providersApi.connectionsControllerGetConnections();

      expect(response3.data.connections.some(c => c.provider == "twitter")).toBeFalsy();
    }, TIMEOUT);
    */
  });

  describe('List and create/delete texts', () => {
    it('should get own texts', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await textsApi.textsControllerGetOwn(0, 100);

      // The texts are coming from the Twitter connection

      expect(response.data.texts.length).toEqual(expectedTextsAmount);

      expect(response.data.texts.every((t: UserTextDto) => t.provider == "twitter")).toBeTruthy();

      expect(response.data.texts.some((t: UserTextDto) => t.rawText == expectedSampleText.rawText && t.language == expectedSampleText.language)).toBeTruthy();
    }, TIMEOUT);

    let createdTextId: string;
    it('should create a text', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await textsApi.textsControllerCreate({
        rawText: "Test text",
        language: 'es'
      });

      expect(response.status).toBe(201);

      // The text should now have been created

      const response2 = await textsApi.textsControllerGetOwn(0, 100, 'Test text');

      expect(response2.data.texts.some((t: UserTextDto) => t.rawText == 'Test text' && t.language == "es")).toBeTruthy();

      createdTextId = response2.data.texts.find((t: UserTextDto) => t.rawText == 'Test text')!._id;
    }, TIMEOUT);

    it('should delete a text', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await textsApi.textsControllerDelete(createdTextId);

      expect(response.status).toBe(200);

      // The text should not appear any more

      const response2 = await textsApi.textsControllerGetOwn(0, 100, 'Test text');

      expect(response2.data.texts.some((t: UserTextDto) => t.rawText == 'Test text')).toBeFalsy();
    }, TIMEOUT);
  });

  describe('List and create/delete interests', () => {
    let createdInterestId: string;
    it('should create an interest', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await interestsApi.interestsControllerCreate({
        relevance: 'favorite',
        resource: { id: 'track1', name: 'Track 1', type: 'track' }
      });

      expect(response.status).toBe(201);

      // The interest should now have been created

      const response2 = await interestsApi.interestsControllerGetOwn(0, 100, 'Track 1');

      expect(response2.data.interests.some((i: UserInterestDto) => i.resource.name == 'Track 1')).toBeTruthy();

      createdInterestId = response2.data.interests.find((i: UserInterestDto) => i.resource.name == 'Track 1')!._id;
    }, TIMEOUT);

    it('should get common interests', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await interestsApi.interestsControllerGetShared(userId1)

      expect(response.data.sharedInterests.length).toBe(1);
      

      expect(response.data.sharedInterests[0]).toEqual({
        relevances: [
          {
            userId: userId1,
            relevance: "normal",
          },
          {
            userId: authUserId,
            relevance: "favorite",
          },
        ],
        resource: { id: 'track1', name: 'Track 1', type: 'track' }
      });
    }, TIMEOUT);

    it('should delete an interest', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await interestsApi.interestsControllerDelete(createdInterestId);

      expect(response.status).toBe(200);

      // The interest should not appear any more

      const response2 = await interestsApi.interestsControllerGetOwn(0, 100, 'Track 1');

      expect(response2.data.interests.some((i: UserInterestDto) => i.resource.name == 'Track 1')).toBeFalsy();
    }, TIMEOUT);
  });

  describe('Check infered personality', () => {
    it('should get own personality', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      // Wait for personality infer to complete
      await new Promise((resolve, reject) => setTimeout(resolve, 5000))

      const response = await usersApi.usersControllerGetById(authUserId, ['personality']);

      expect(response.data.personality).toEqual(expectedPersonality);
    }, TIMEOUT);
  });

  // ---------------------------------------------------------------------------------

  describe('List and accept/reject recommendations', () => {
    let recommendedUserId1: string, recommendedUserId2: string;
    it('should get friendship recommendations', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      // Wait for recommendations generation to complete
      await new Promise((resolve, reject) => setTimeout(resolve, 5000))

      const response = await recommendationsApi.recommendationsControllerGetRecommendations([], 'affinity', 0, 10);

      // There are only two users with personality on the database, with no previous rates
      // nor recommendation reviews, so there must be two recommendations as well
      expect(response.data.recommendations.length).toEqual(2);

      expect(response.data.recommendations[0].user._id).toEqual(userId2);
      expect(response.data.recommendations[0].score).toEqual(expectedFirstRecommendationScore);

      recommendedUserId1 = response.data.recommendations[0].user._id;
      recommendedUserId2 = response.data.recommendations[1].user._id;
    }, TIMEOUT);

    it('should get public information of a user by ID', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await usersApi.usersControllerGetById(recommendedUserId1, []);

      expect(response.status).toBe(200);

      expect(response.data.profile).toBeDefined();
    }, TIMEOUT);

    it('should accept a friendship recommendation', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      // Accept the recommendation

      const response1 = await recommendationsApi.recommendationsControllerReviewRecommendation(recommendedUserId1, { accept: true });

      expect(response1.status).toBe(200);

      // Recommendation should not be present any more

      const response2 = await recommendationsApi.recommendationsControllerGetRecommendations([], 'affinity', 0, 10);

      expect(response2.data.recommendations.some((r: RecommendationDto) => r.user._id == recommendedUserId1)).toBeFalsy();

      // A friendship proposal must have been sent

      const response = await friendsApi.friendshipsControllerGetFriendships([], 'proposed');

      expect(response.data.friends.some((f: FriendshipDto) => f.user._id == recommendedUserId1)).toBeTruthy();
    }, TIMEOUT);

    it('should reject a friendship recommendation', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      // Reject the recommendation

      const response1 = await recommendationsApi.recommendationsControllerReviewRecommendation(recommendedUserId2, { accept: false });

      expect(response1.status).toBe(200);

      // Recommendation should not be present any more

      const response2 = await recommendationsApi.recommendationsControllerGetRecommendations([], 'affinity', 0, 10);

      expect(response2.data.recommendations.some((r: RecommendationDto) => r.user._id == recommendedUserId2)).toBeFalsy();
    }, TIMEOUT);
  });

  // ---------------------------------------------------------------------------------

  let friendId: string;

  describe('List and accept/reject friendships', () => {
    let friendshipProposerId1: string;
    let friendshipProposerId2: string;

    it('should get received friendship requests', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await friendsApi.friendshipsControllerGetFriendships([], 'received');

      // Two proposals are already inserted on DB
      expect(response.data.friends.length).toBe(2);

      friendshipProposerId1 = response.data.friends[0].user._id;
      friendshipProposerId2 = response.data.friends[1].user._id;
    }, TIMEOUT);

    it('should accept a friendship request', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await friendsApi.friendshipsControllerReviewRequest(friendshipProposerId1, { accept: true })

      expect(response.status).toBe(200);

      // Now the proposal should not be any more

      const response2 = await friendsApi.friendshipsControllerGetFriendships([], 'received');

      expect(response2.data.friends.some((f: FriendshipDto) => f.user._id == friendshipProposerId1)).toBeFalsy();

      // And the friendship should have been established

      const response3 = await friendsApi.friendshipsControllerGetFriendships([], 'established');

      expect(response3.data.friends.some((f: FriendshipDto) => f.user._id == friendshipProposerId1)).toBeTruthy();

      friendId = friendshipProposerId1;
    }, TIMEOUT);

    it('should reject a friendship request', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await friendsApi.friendshipsControllerReviewRequest(friendshipProposerId2, { accept: false })

      expect(response.status).toBe(200);

      // Now the proposal should not be any more

      const response2 = await friendsApi.friendshipsControllerGetFriendships([], 'received');

      expect(response2.data.friends.some((f: FriendshipDto) => f.user._id == friendshipProposerId2)).toBeFalsy();
    }, TIMEOUT);
  });

  describe('Message a friend', () => {
    it('should send a message', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await messagesApi.messagesControllerPostMessage({ receiverId: friendId, text: 'Hello!' });

      expect(response.status).toBe(201);
    }, TIMEOUT);

    it('should get messages with a specific user', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await messagesApi.messagesControllerGetMessages(friendId);

      expect(response.data.messages.some((m: MessageDto) => m.isOwn && m.text == "Hello!")).toBeTruthy();
    }, TIMEOUT);
  });

  describe('Rate a friend', () => {
    it('should send a rate', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await ratesApi.ratesControllerPostRate({ rateeId: friendId, rating: 5 });

      expect(response.status).toBe(201);
    }, TIMEOUT);

    it('should get given rates', async () => {
      console.log(`TEST ${i_test++}/${n_tests} ${bar()}`);

      const response = await ratesApi.ratesControllerGetGivenRates()

      expect(response.data.rates.some((r: GivenRateDto) => r.rateeId == friendId && r.rating == 5)).toBeTruthy();
    }, TIMEOUT);
  });
 
});