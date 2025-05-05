import { model, Schema } from 'mongoose';

const projectSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['Ongoing', 'Pending', 'Completed'],
            default: 'Ongoing',
            required: true
        },
      
        adminId: { 
            type: Schema.Types.ObjectId
        },
        client: {type:String} ,

        assignedTo: [{ 
            type: Schema.Types.ObjectId,
            ref: 'employee' // Reference to the Employee model
        }],
        priority: { 
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        startDate: { type: Date },
        endDate: { type: Date },
        filenames: { type: [String], default: [] }
    },
    {
        timestamps: true
    }
);

export default model('Project', projectSchema);
