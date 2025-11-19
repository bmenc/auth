import mongoose from 'mongoose';
import { ENTITY_OPTIONS } from '@/constants/entityOptions';

const responseDataSchema = new mongoose.Schema({
    entity: {
        type: String,
        required: true,
        trim: true,
        enum: ENTITY_OPTIONS,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
    },
    parameters: {
        type: String,
        trim: true,
    },
    response: {
        type: String,
        required: true,
    },
    auth: {
        type: Boolean,
        default: false,
    },
    url: {
        type: String,
        trim: true,
    },
},
{ 
    timestamps: true,
    collection: 'response_data'
});

const ResponseData = mongoose.models.ResponseData || mongoose.model('ResponseData', responseDataSchema);
export default ResponseData;

