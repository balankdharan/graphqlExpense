import { users } from "../dummyData/data.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolver = {
  Mutation: {
    signUp: async (_, { input }, context) => {
      try {
        const { username, password, gender, name } = input;

        if (!username || !password || !gender || !name) {
          throw new Error("All fields are required");
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
          throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy/?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl/?username=${username}`;

        const newUser = new User({
          name,
          username,
          password: hashedPassword,
          gender,
          profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        });

        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (err) {
        console.log("Error in signup", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;

        if (!username || !password) {
          throw new Error("All fields are required");
        }

        const existingUser = await User.findOne({ username });

        if (!existingUser) {
          throw new Error("User Not found");
        }

        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });
        await context.login(user);
        return user;
      } catch (err) {
        console.log("Error in login", err);
        throw new Error(err.message || "Internal server error");
      }
    },
    logout: async (_, __, context) => {
      try {
        await context.logout();
        req.session.destroy((err) => {
          if (err) throw err;
        });
        res.clearCookie("connect.sid");
        return { message: "Logged Out" };
      } catch (err) {
        console.log("Error in logout", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },

  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (error) {
        console.log("Error in authUser", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log("Error in getting user", error);
        throw new Error(error.message || "Error getting user");
      }
    },
  },
};

export default userResolver;
