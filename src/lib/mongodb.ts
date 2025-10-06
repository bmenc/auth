import mongoose from 'mongoose';
export const connectMongoDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        if (mongoose.connection.readyState === 1) {
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        throw error;
    }
}
export default connectMongoDB;
