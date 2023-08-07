import { getDB } from "../../config/mongodb.js";

export default class ConfessionModel {
  constructor(title, body, author) {
    this.title = title;
    this.body = body;
    this.author = author;
  }

  static async create(title, body, author) {
    try {
      // Get the database
      const db = getDB();

      // Get the collection
      const collection = db.collection("confessions");
      const newConfession = new ConfessionModel(title, body, author);

      // Insert the document
      await collection.insertOne(newConfession);

      return newConfession;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
