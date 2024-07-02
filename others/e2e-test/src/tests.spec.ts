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
  SignupReqDto,
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
const userId1 = new ObjectId().toString();
const userId2 = new ObjectId().toString();

const signupToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiMTgxNjc4Ny1iYjAxLTRjMGQtYjI2Mi1iYjgyYmJkYzgzZjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzE5ODg3NjM2LCJleHAiOjE3MTk4OTEyMzYsImlzcyI6ImNvZ25pdG8tc2lnbnVwLWhhbmRsZXIifQ.x3bgEOlaJH6ilXw6qJHNzhE3v0NA3dl55KbO6CjA9T0";

const profilePicFilePath = "data/profile_pic.png";

const twitterDataFilePath = "data/twitter-sample.zip";
const expectedTextsAmount = 50;
const expectedSampleText = {
  rawText: "A beautiful sunrise this morning! Every day is a new opportunity to chase our dreams. #MorningMotivation #Sunrise",
  language: "en",
};

const expectedPersonality = { userId: authUserId, o: 1, c: 0.8, e: 0.6, a: 0.8, n: 0.4 };

const picturesBucketUrl = "https://user-pictures-bucket.s3.amazonaws.com";

// -----------------------------------------------------------------------------------------------


describe('MindHub API Tests', () => {

  beforeAll(async () => {
    const client = new MongoClient(process.env.E2E_MONGO_URI!);

    await client.connect();
  
    const db = client.db("e2e");

    db.collection("users").insertMany([
      { _id: new ObjectId(userId1), email: "test1@test.com", profile: { name: "Test User 1", gender: "man", birthday: "1990-01-01", completed: true } },
      { _id: new ObjectId(userId2), email: "test2@test.com", profile: { name: "Test User 2", gender: "man", birthday: "1990-01-01", completed: true } }
    ]);

    db.collection("bigfive").insertMany([
      { userId: "test1@test.com", o: 0.2, c: 0.4, e: 0.3, a: 0.5, n: 0.8 },
      { userId: "test2@test.com", o: 0.6, c: 0.1, e: 0.2, a: 0.8, n: 0.3 },
    ]);

    db.collection("interests").insertMany([
      { userId: "test1@test.com", provider: "spotify", relevance: "normal", resource: {id: "track1", name: "Track 1", type: "track"} },
      { userId: "test1@test.com", provider: "spotify", relevance: "normal", resource: {id: "track2", name: "Track 2", type: "track"} },
    ]);

    db.collection("friendships").insertMany([
      { proposer: userId1, target: authUserId, status: "proposed" },
      { proposer: userId2, target: authUserId, status: "proposed" },
    ]);

    await client.close();
  });

  afterAll(async () => {
    const client = new MongoClient(process.env.MONGO_URI!);

    await client.connect();
  
    const db = client.db("e2e");

    await db.collection("users").deleteMany({});
    await db.collection("bigfive").deleteMany({});
    await db.collection("interests").deleteMany({});
    await db.collection("friendships").deleteMany({});

    await client.close();
  });

  // ---------------------------------------------------------------------------------

  describe('Sign up the user and complete profile', () => {
    it('should sign up a user', async () => {
      const signupDto: SignupReqDto = { token: signupToken };
      const response = await usersApi.usersControllerSignupUser(signupDto);
      expect(response.status).toBe(201);
    });

    it('should update authenticated user profile', async () => {
      const updateProfileDto: UpdateProfileReqDto = {
        gender: 'man',
        birthday: '1990-01-01',
        biography: 'Test bio'
      };

      const response = await usersApi.usersControllerUpdateProfile(updateProfileDto);

      expect(response.status).toBe(200);
    });

    it('should get authenticated user information', async () => {
      const response = await usersApi.usersControllerGetOwnUser();

      expect(response.status).toBe(200);

      expect(response.data.profile).toEqual({
        name: "Test user",
        gender: 'man',
        birthday: '1990-01-01',
        biography: 'Test bio',
        completed: true,
      });
    }); 
  });

  describe('Upload a profile picture', () => {
    it('should be able to upload the picture', async () => {
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
    });
  });

  // ---------------------------------------------------------------------------------

  describe('List and connect/remove providers', () => {
    it('should connect Twitter with data file', async () => {
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
    });

    /* We left out this test because extracted texts are needed for the following stage
    it('should remove Twitter connection', async () => {
      // Remove the connection

      const response1 = await providersApi.connectionsControllerDeleteConnection("twitter")

      expect(response1.status).toBe(200);

      // Check that connection has been removed

      const response3 = await providersApi.connectionsControllerGetConnections();

      expect(response3.data.connections.some(c => c.provider == "twitter")).toBeFalsy();
    });
    */
  });

  describe('List and create/delete texts', () => {
    it('should get own texts', async () => {
      const response = await textsApi.textsControllerGetOwn(0, 10);

      // The texts are coming from the Twitter connection

      expect(response.data.texts.length).toEqual(expectedTextsAmount);

      expect(response.data.texts.every((t: UserTextDto) => t.provider == "twitter")).toBeTruthy();

      expect(response.data.texts.some((t: UserTextDto) => t.rawText == expectedSampleText.rawText && t.language == expectedSampleText.language)).toBeTruthy();
    });

    let createdTextId: string;
    it('should create a text', async () => {
      const response = await textsApi.textsControllerCreate({
        rawText: "Test text",
        language: 'es'
      });

      expect(response.status).toBe(201);

      // The text should now have been created

      const response2 = await textsApi.textsControllerGetOwn(0, 10, 'Test text');

      expect(response2.data.texts.some((t: UserTextDto) => t.rawText == 'Test text' && t.language == "es")).toBeTruthy();

      createdTextId = response2.data.texts.find((t: UserTextDto) => t.rawText == 'Test text')!._id;
    });

    it('should delete a text', async () => {
      const response = await textsApi.textsControllerDelete(createdTextId);

      expect(response.status).toBe(200);

      // The text should not appear any more

      const response2 = await textsApi.textsControllerGetOwn(0, 10, 'Test text');

      expect(response2.data.texts.some((t: UserTextDto) => t.rawText == 'Test text')).toBeFalsy();
    });
  });

  describe('List and create/delete interests', () => {
    let createdInterestId: string;
    it('should create an interest', async () => {
      const response = await interestsApi.interestsControllerCreate({
        relevance: 'favorite',
        resource: { id: 'track1', name: 'Track 1', type: 'track' }
      });

      expect(response.status).toBe(201);

      // The interest should now have been created

      const response2 = await interestsApi.interestsControllerGetOwn(0, 10, 'Track 1');

      expect(response2.data.interests.some((i: UserInterestDto) => i.resource.name == 'Track 1')).toBeTruthy();

      createdInterestId = response2.data.interests.find((i: UserInterestDto) => i.resource.name == 'Track 1')!._id;
    });

    it('should get common interests', async () => {
      const response = await interestsApi.interestsControllerGetShared(userId1)

      expect(response.data.sharedInterests.length).toBe(1);

      expect(response.data.sharedInterests[0]).toEqual({relevances: ["favorite", "normal"], resource: { id: 'track1', name: 'Track 1', type: 'track' }});
    });

    it('should delete an interest', async () => {
      const response = await interestsApi.interestsControllerDelete(createdInterestId);

      expect(response.status).toBe(200);

      // The interest should not appear any more

      const response2 = await interestsApi.interestsControllerGetOwn(0, 10, 'Track 1');

      expect(response2.data.interests.some((i: UserInterestDto) => i.resource.name == 'Track 1')).toBeFalsy();
    });
  });

  describe('Check infered personality', () => {
    it('should get own personality', async () => {
      // Wait for personality infer to complete
      await new Promise((resolve, reject) => setTimeout(resolve, 5000))

      const response = await usersApi.usersControllerGetById(authUserId, ['personality']);

      expect(response.data.personality).toEqual(expectedPersonality);
    });
  });

  // ---------------------------------------------------------------------------------

  describe('List and accept/reject recommendations', () => {
    let recommendedUserId1: string, recommendedUserId2: string;

    it('should get friendship recommendations', async () => {
      // Wait for recommendations generation to complete
      await new Promise((resolve, reject) => setTimeout(resolve, 5000))

      const response = await recommendationsApi.recommendationsControllerGetRecommendations(['user', 'score'], 'affinity', 0, 10);

      // There are only two users with personality on the database, with no previous rates
      // nor recommendation reviews, so there must be two recommendations as well
      expect(response.data.recommendations.length).toEqual(2);

      console.log("Generated recommendations", response.data.recommendations);

      recommendedUserId1 = response.data.recommendations[0].user._id;
      recommendedUserId2 = response.data.recommendations[1].user._id;
    });

    it('should get public information of a user by ID', async () => {
      const response = await usersApi.usersControllerGetById(recommendedUserId1, ['profile', 'sharedInterests']);

      expect(response.status).toBe(200);

      expect(response.data.profile).toBeDefined();
    });

    it('should accept a friendship recommendation', async () => {
      // Accept the recommendation

      const response1 = await recommendationsApi.recommendationsControllerReviewRecommendation(recommendedUserId1, { accept: true });

      expect(response1.status).toBe(200);

      // Recommendation should not be present any more

      const response2 = await recommendationsApi.recommendationsControllerGetRecommendations(['user', 'score'], 'affinity', 0, 10);

      expect(response2.data.recommendations.some((r: RecommendationDto) => r.user._id == recommendedUserId1)).toBeFalsy();

      // A friendship proposal must have been sent

      const response = await friendsApi.friendshipsControllerGetFriendships(['user', 'score'], 'proposed');

      expect(response.data.friends.some((f: FriendshipDto) => f.user._id == recommendedUserId1)).toBeTruthy();
    });

    it('should reject a friendship recommendation', async () => {
      // Reject the recommendation

      const response1 = await recommendationsApi.recommendationsControllerReviewRecommendation(recommendedUserId2, { accept: false });

      expect(response1.status).toBe(200);

      // Recommendation should not be present any more

      const response2 = await recommendationsApi.recommendationsControllerGetRecommendations(['user', 'score'], 'affinity', 0, 10);

      expect(response2.data.recommendations.some((r: RecommendationDto) => r.user._id == recommendedUserId2)).toBeFalsy();
    });
  });

  // ---------------------------------------------------------------------------------

  let friendId: string;

  describe('List and accept/reject friendships', () => {
    let friendshipProposerId1: string;
    let friendshipProposerId2: string;

    it('should get received friendship requests', async () => {
      const response = await friendsApi.friendshipsControllerGetFriendships(['user'], 'received');

      // Two proposals are already inserted on DB
      expect(response.data.friends.length).toBe(2);

      friendshipProposerId1 = response.data.friends[0].user._id;
      friendshipProposerId2 = response.data.friends[1].user._id;
    });

    it('should accept a friendship request', async () => {
      const response = await friendsApi.friendshipsControllerReviewRequest(friendshipProposerId1, { accept: true })

      expect(response.status).toBe(200);

      // Now the proposal should not be any more

      const response2 = await friendsApi.friendshipsControllerGetFriendships(['user'], 'received');

      expect(response2.data.friends.some((f: FriendshipDto) => f.user._id == friendshipProposerId1)).toBeFalsy();

      // And the friendship should have been established

      const response3 = await friendsApi.friendshipsControllerGetFriendships(['user'], 'established');

      expect(response3.data.friends.some((f: FriendshipDto) => f.user._id == friendshipProposerId1)).toBeTruthy();

      friendId = friendshipProposerId1;
    });

    it('should reject a friendship request', async () => {
      const response = await friendsApi.friendshipsControllerReviewRequest(friendshipProposerId2, { accept: false })

      expect(response.status).toBe(200);

      // Now the proposal should not be any more

      const response2 = await friendsApi.friendshipsControllerGetFriendships(['user'], 'received');

      expect(response2.data.friends.some((f: FriendshipDto) => f.user._id == friendshipProposerId2)).toBeFalsy();
    });
  });

  describe('Message a friend', () => {
    it('should send a message', async () => {
      const response = await messagesApi.messagesControllerPostMessage({ receiverId: friendId, text: 'Hello!' });

      expect(response.status).toBe(201);
    });

    it('should get messages with a specific user', async () => {
      const response = await messagesApi.messagesControllerGetMessages(friendId);

      expect(response.data.messages.some((m: MessageDto) => m.isOwn && m.text == "Hello!")).toBeTruthy();
    });
  });

  describe('Rate a friend', () => {
    it('should send a rate', async () => {
      const response = await ratesApi.ratesControllerPostRate({ rateeId: friendId, rating: 5 });

      expect(response.status).toBe(201);
    });

    it('should get given rates', async () => {
      const response = await ratesApi.ratesControllerGetGivenRates()

      expect(response.data.rates.some((r: GivenRateDto) => r.rateeId == friendId && r.rating == 5)).toBeTruthy();
    });
  });
 
});