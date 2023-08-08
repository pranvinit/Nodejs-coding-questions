import request from "supertest";
import app from "./index.js";
import { MongoClient } from "mongodb";
import { connectToMongoDB, getDB } from "./src/config/mongodb.js";
import BucketListRepository from "./src/features/bucketList/bucketList.repository.js";

const titleToSearch = "Visit the Great Wall";

const seededItem = {
  title: titleToSearch,
  description: "I've always wanted to see it!",
  dateAdded: new Date().toISOString(),
  targetDate: new Date().toISOString(),
  isCompleted: false,
};

let connectSpy;
let dbSpy;
const mockCollection = {
  insertOne: jest.fn(),
  findOne: jest.fn().mockResolvedValue(seededItem),
};

const mockClient = {
  db: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue(mockCollection),
  }),
};

connectSpy = jest.spyOn(MongoClient, "connect").mockResolvedValue(mockClient);
dbSpy = mockClient.db;

describe("MongoDB connection functions", () => {
  it("connectToDB function called connect method with URL", async () => {
    await connectToMongoDB();
    expect(connectSpy).toHaveBeenCalledWith("mongodb://localhost:27017");
  });

  it("getDB function returns a 'bucketListDB' db client", () => {
    const mockDbInstance = {};
    dbSpy.mockReturnValueOnce(mockDbInstance);

    const result = getDB();

    expect(result).toBe(mockDbInstance);
  });
});

describe("BucketListRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new BucketListRepository();
  });

  it("should define addBucketListItem as a function", () => {
    expect(typeof repository.addBucketListItem).toBe("function");
  });

  it("should define findOneBucketListItem as a function", () => {
    expect(typeof repository.findOneBucketListItem).toBe("function");
  });
});

describe("POST /api/bucket-list-items", () => {
  it("adds a new bucket list item", async () => {
    const newItem = {
      title: "Visit the Great Wall",
      description: "I've always wanted to see it!",
      dateAdded: new Date().toISOString(),
      targetDate: new Date().toISOString(),
      isCompleted: false,
    };

    const response = await request(app)
      .post("/api/bucket-list-items")
      .send(newItem);

    expect(dbSpy().collection).toHaveBeenCalledWith("bucketListItems");
    expect(dbSpy().collection().insertOne).toHaveBeenCalledWith(newItem);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newItem);
  });

  it("fetches a specific bucket list item by title", async () => {
    const response = await request(app)
      .get("/api/bucket-list-items")
      .query({ title: titleToSearch });

    expect(dbSpy().collection).toHaveBeenCalledWith("bucketListItems");
    expect(dbSpy().collection().findOne).toHaveBeenCalledWith({
      title: titleToSearch,
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(seededItem);
  });
});
