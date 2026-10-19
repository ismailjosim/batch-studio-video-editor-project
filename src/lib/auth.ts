import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

const uri =
  process.env.DB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/placeholder_for_build";

if (
  !process.env.DB_URL &&
  !process.env.MONGODB_URI &&
  process.env.NODE_ENV === "production" &&
  typeof window === "undefined" &&
  !process.env.NEXT_PHASE
) {
  console.warn("WARNING: DB_URL or MONGODB_URI is not defined.");
}

// Maintain a cached MongoClient across hot reloads in development
let client: MongoClient;
let _clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  _clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  _clientPromise = client.connect();
}

const mongoClient = new MongoClient(uri);
const db = mongoClient.db("batch-studio-DB");

const getAuthBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    if (
      process.env.BETTER_AUTH_URL?.includes("localhost") ||
      process.env.BETTER_AUTH_URL?.includes("127.0.0.1")
    ) {
      return process.env.BETTER_AUTH_URL;
    }
    return "http://localhost:3000";
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || getAuthBaseUrl(),
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client: mongoClient,
  }),

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 120,
  },

  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID as string) || "",
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string) || "",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : []),
  ],
});
