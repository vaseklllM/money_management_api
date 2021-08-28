import * as mongoose from 'mongoose';

const mongo = {
  ObjectId: (id) => new mongoose.Types.ObjectId(id),
};

export default mongo;
