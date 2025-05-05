import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // HR or Employee
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true }, //  Employee and b/w employee
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Message = model('Message', messageSchema);
export default Message;
