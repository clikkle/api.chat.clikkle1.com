import { model, Schema, Types } from 'mongoose';

const messageSchema = new Schema(
    {
        sender: { type: Types.ObjectId , required: true },
        receiver: { type: Types.ObjectId , required: true },
        adminId: { type: Types.ObjectId ,  required: true },
        content: { type: String, required: true },
        isViewed:{type: Boolean ,  default :   false }
    },
    {
        timestamps: true,
    }
);

export default model('message', messageSchema);