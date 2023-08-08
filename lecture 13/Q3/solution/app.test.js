import request from "supertest";
import app from "./index.js";
import { MongoClient, ObjectId } from "mongodb";
import { connectToMongoDB, getDB } from "./src/config/mongodb.js";

const seededExpense = {
  title: "Lunch at Joe's",
  amount: 15.0,
  date: new Date().toISOString(),
  isRecurring: false,
  tags: [],
};

let connectSpy;
let dbSpy;
const mockCollection = {
  insertOne: jest.fn(),
  findOne: jest.fn().mockResolvedValue(seededExpense),
  find: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([seededExpense]),
  updateOne: jest.fn(),
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

describe("Testing expense routes", () => {
  it("creates a new expense", async () => {
    const response = await request(app)
      .post("/api/expenses")
      .send(seededExpense);

    expect(mockCollection.insertOne).toHaveBeenCalledWith(seededExpense);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(seededExpense);
  });

  it("fetches a specific expense by id", async () => {
    const testId = new ObjectId().toString();
    const response = await request(app).get(`/api/expenses/${testId}`);

    expect(mockCollection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId(testId),
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(seededExpense);
  });

  it("fetches all expenses", async () => {
    const response = await request(app).get("/api/expenses");

    expect(mockCollection.find).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toContainEqual(seededExpense); // assuming you are returning an array
  });

  it("filters expenses based on criteria", async () => {
    const filterCriteria = {
      minAmount: 10.0,
      maxAmount: 20.0,
      isRecurring: "false",
    };

    const response = await request(app)
      .get("/api/expenses/filter")
      .query(filterCriteria);

    expect(mockCollection.find.mock.calls[1][0]).toEqual({
      amount: {
        $gte: parseFloat(filterCriteria.minAmount),
        $lte: parseFloat(filterCriteria.maxAmount),
      },
      isRecurring: filterCriteria.isRecurring === "true",
    });

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual(seededExpense);
  });

  it("adds a tag to a specific expense", async () => {
    const testId = new ObjectId().toString();
    const tagToAdd = "food";

    const response = await request(app)
      .post(`/api/expenses/${testId}/tags`)
      .send({ tag: tagToAdd });

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId(testId) },
      { $push: { tags: tagToAdd } }
    );
    expect(response.status).toBe(200);
  });
});
