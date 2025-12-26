import dotenv from 'dotenv'

dotenv.config({quiet:true});

export const ENV = {
    NODE_ENV : process.env.NODE_ENV,
    PORT : process.env.PORT,
    DB_URI : process.env.DB_URI,
    CLERK_SECRET_KEY : process.env.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY : process.env.CLERK_PUBLISHABLE_KEY,
    INNGEST_SIGNING_KEY : process.env.INNGEST_SIGNING_KEY,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY : process.env.CLOUDINARY_SECRET_KEY,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    ADMIN_EMAIL : process.env.ADMIN_EMAIL,
    CLIENT_URL: process.env.CLIENT_URL
}