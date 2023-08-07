import request from "supertest";
import app from "./index.js";
import { MongoClient } from "mongodb";
import { connectToMongoDB, getDB } from "./src/config/mongodb.js";

let connectSpy;
let dbSpy;
const mockCollection = {
  insertOne: jest.fn(),
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

  it("getDB function returns a 'confession' db client", () => {
    const mockDbInstance = {};
    dbSpy.mockReturnValueOnce(mockDbInstance);

    const result = getDB();

    expect(result).toBe(mockDbInstance);
  });
});

describe("POST /api/confessions", () => {
  it("it creates a new confession", async () => {
    const newConfession = {
      title: "Test Confession",
      body: "This is a test confession",
      author: "John Doe",
    };

    const response = await request(app)
      .post("/api/confessions")
      .send(newConfession);

    expect(dbSpy().collection).toHaveBeenCalledWith("confessions");
    expect(dbSpy().collection().insertOne).toHaveBeenCalledWith(newConfession);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newConfession);
  });
});
