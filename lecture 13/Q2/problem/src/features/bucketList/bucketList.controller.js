import BucketListModel from "./bucketList.model.js";

export default class BucketListController {
  add = async (req, res) => {
    const { title, description, dateAdded, targetDate, isCompleted } = req.body;
    // Refactor to use the repository method
    const item = await BucketListModel.addBucketListItem(
      title,
      description,
      dateAdded,
      targetDate,
      isCompleted
    );

    res.status(201).send(item);
  };

  get = async (req, res) => {
    const { title } = req.query;
    // Refactor to use the repository method
    const item = await BucketListModel.findOneBucketListItem(title);

    if (!item) {
      res.status(200).send("Item not found.");
    } else {
      res.status(200).send(item);
    }
  };
}
