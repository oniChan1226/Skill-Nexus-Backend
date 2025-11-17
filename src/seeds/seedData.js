import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { SkillModel } from "../models/skill.model.js";
import { SkillProfileModel } from "../models/skillProfile.model.js";
import connectDb from "../db/index.js";

dotenv.config();

const USERS = [
  { name: "Naruto Uzumaki", email: "naruto.uzumaki@example.com", profession: "Frontend Developer", address: { country: "Japan", city: "Konoha" } },
  { name: "Sasuke Uchiha", email: "sasuke.uchiha@example.com", profession: "Backend Developer", address: { country: "Japan", city: "Konoha" } },
  { name: "Sakura Haruno", email: "sakura.haruno@example.com", profession: "UI/UX Designer", address: { country: "Japan", city: "Konoha" } },
  { name: "Kakashi Hatake", email: "kakashi.hatake@example.com", profession: "Data Scientist", address: { country: "Japan", city: "Konoha" } },
  { name: "Itachi Uchiha", email: "itachi.uchiha@example.com", profession: "Security Engineer", address: { country: "Japan", city: "Tokyo" } },
  { name: "Hinata Hyuga", email: "hinata.hyuga@example.com", profession: "Frontend Developer", address: { country: "Japan", city: "Kyoto" } },
  { name: "Shikamaru Nara", email: "shikamaru.nara@example.com", profession: "Backend Developer", address: { country: "Japan", city: "Osaka" } },
  { name: "Ino Yamanaka", email: "ino.yamanaka@example.com", profession: "UI/UX Designer", address: { country: "Japan", city: "Konoha" } },
  { name: "Rock Lee", email: "rock.lee@example.com", profession: "DevOps Engineer", address: { country: "Japan", city: "Konoha" } },
  { name: "Neji Hyuga", email: "neji.hyuga@example.com", profession: "Security Engineer", address: { country: "Japan", city: "Kyoto" } },

  { name: "Eren Yeager", email: "eren.yeager@example.com", profession: "Frontend Developer", address: { country: "Japan", city: "Shiganshina" } },
  { name: "Mikasa Ackerman", email: "mikasa.ackerman@example.com", profession: "Backend Developer", address: { country: "Japan", city: "Shiganshina" } },
  { name: "Armin Arlert", email: "armin.arlert@example.com", profession: "Data Scientist", address: { country: "Japan", city: "Trost" } },
  { name: "Levi Ackerman", email: "levi.ackerman@example.com", profession: "Security Engineer", address: { country: "Japan", city: "Trost" } },
  { name: "Erwin Smith", email: "erwin.smith@example.com", profession: "DevOps Engineer", address: { country: "Japan", city: "Wall Rose" } },
  { name: "Hange Zoe", email: "hange.zoe@example.com", profession: "Data Scientist", address: { country: "Japan", city: "Wall Sina" } },
  { name: "Jean Kirstein", email: "jean.kirstein@example.com", profession: "Frontend Developer", address: { country: "Japan", city: "Trost" } },
  { name: "Connie Springer", email: "connie.springer@example.com", profession: "Backend Developer", address: { country: "Japan", city: "Wall Rose" } },
  { name: "Sasha Blouse", email: "sasha.blouse@example.com", profession: "UI/UX Designer", address: { country: "Japan", city: "Wall Rose" } },
  { name: "Historia Reiss", email: "historia.reiss@example.com", profession: "UI/UX Designer", address: { country: "Japan", city: "Wall Sina" } },

  { name: "Goku Son", email: "goku.son@example.com", profession: "Frontend Developer", address: { country: "Japan", city: "Tokyo" } },
  { name: "Vegeta Prince", email: "vegeta.prince@example.com", profession: "Backend Developer", address: { country: "Japan", city: "Osaka" } },
  { name: "Bulma Briefs", email: "bulma.briefs@example.com", profession: "UI/UX Designer", address: { country: "Japan", city: "Tokyo" } },
  { name: "Gohan Son", email: "gohan.son@example.com", profession: "Data Scientist", address: { country: "Japan", city: "Tokyo" } },
  { name: "Trunks Briefs", email: "trunks.briefs@example.com", profession: "Game Developer", address: { country: "Japan", city: "West City" } },
  { name: "Piccolo Daimao", email: "piccolo.daimao@example.com", profession: "Security Engineer", address: { country: "Japan", city: "Namek" } },
  { name: "Krillin Monk", email: "krillin.monk@example.com", profession: "DevOps Engineer", address: { country: "Japan", city: "Tokyo" } },
  { name: "Android 18", email: "android.18@example.com", profession: "Mobile Developer", address: { country: "Japan", city: "West City" } },
  { name: "Beerus Sama", email: "beerus.sama@example.com", profession: "DevOps Engineer", address: { country: "Japan", city: "Universe 7" } },
  { name: "Whis Angel", email: "whis.angel@example.com", profession: "Security Engineer", address: { country: "Japan", city: "Universe 7" } },
];

// -----------------------------------------------------------------------------
// SKILLS (Global skills only created once)
// -----------------------------------------------------------------------------
const SKILLS = [
  { name: "React", proficiencyLevel: "expert", learningPriority: "medium", categories: ["Frontend"] },
  { name: "TypeScript", proficiencyLevel: "intermediate", learningPriority: "medium", categories: ["Frontend"] },
  { name: "Node.js", proficiencyLevel: "intermediate", learningPriority: "high", categories: ["Backend"] },
  { name: "MongoDB", proficiencyLevel: "intermediate", learningPriority: "high", categories: ["Database"] },
  { name: "Express.js", proficiencyLevel: "expert", learningPriority: "medium", categories: ["Backend"] },
  { name: "Tailwind CSS", proficiencyLevel: "intermediate", learningPriority: "low", categories: ["Frontend"] },
  { name: "Figma", proficiencyLevel: "expert", learningPriority: "medium", categories: ["Design"] },
  { name: "TensorFlow", proficiencyLevel: "intermediate", learningPriority: "medium", categories: ["AI/ML"] },
  { name: "Flutter", proficiencyLevel: "intermediate", learningPriority: "medium", categories: ["Mobile"] },
  { name: "AWS", proficiencyLevel: "expert", learningPriority: "high", categories: ["Cloud"] },
  { name: "Docker", proficiencyLevel: "intermediate", learningPriority: "medium", categories: ["DevOps"] },
  { name: "Kubernetes", proficiencyLevel: "beginner", learningPriority: "high", categories: ["DevOps"] },
  { name: "C++", proficiencyLevel: "expert", learningPriority: "low", categories: ["Programming"] },
  { name: "Unreal Engine", proficiencyLevel: "intermediate", learningPriority: "low", categories: ["Game Dev"] },
  { name: "Cybersecurity", proficiencyLevel: "expert", learningPriority: "high", categories: ["Security"] },
  { name: "Penetration Testing", proficiencyLevel: "intermediate", learningPriority: "medium", categories: ["Security"] },
];

// -----------------------------------------------------------------------------
// Seeder Logic
// -----------------------------------------------------------------------------
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    await connectDb();

    console.log("🗑️  Clearing old data...");
    await Promise.all([
      User.deleteMany({}),
      SkillModel.deleteMany({}),
      SkillProfileModel.deleteMany({}),
    ]);

    console.log("📚 Seeding skills...");
    const createdSkills = await SkillModel.insertMany(SKILLS);
    const skillMap = Object.fromEntries(createdSkills.map((s) => [s.name, s._id]));

    console.log("👥 Seeding users & skill profiles...");
    for (const userData of USERS) {
      const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(userData.name)}`;

      const user = await User.create({
        ...userData,
        password: "password123",
        profileImage: avatarUrl,
        bio: "Passionate learner eager to exchange skills and collaborate.",
      });

      let offered = [];
      let required = [];

      switch (user.profession) {
        case "Frontend Developer":
          offered = [skillMap["React"], skillMap["TypeScript"]];
          required = [skillMap["Node.js"], skillMap["MongoDB"]];
          break;
        case "Backend Developer":
          offered = [skillMap["Node.js"], skillMap["Express.js"]];
          required = [skillMap["React"], skillMap["Tailwind CSS"]];
          break;
        case "UI/UX Designer":
          offered = [skillMap["Figma"]];
          required = [skillMap["React"], skillMap["TypeScript"]];
          break;
        case "Data Scientist":
          offered = [skillMap["TensorFlow"], skillMap["Python"]];
          required = [skillMap["MongoDB"], skillMap["Node.js"]];
          break;
        case "Mobile Developer":
          offered = [skillMap["Flutter"]];
          required = [skillMap["React"], skillMap["Firebase"]];
          break;
        case "DevOps Engineer":
          offered = [skillMap["AWS"], skillMap["Docker"]];
          required = [skillMap["Kubernetes"], skillMap["CI/CD"]];
          break;
        case "Security Engineer":
          offered = [skillMap["Cybersecurity"], skillMap["Penetration Testing"]];
          required = [skillMap["Docker"], skillMap["AWS"]];
          break;
        case "Game Developer":
          offered = [skillMap["C++"], skillMap["Unreal Engine"]];
          required = [skillMap["React"], skillMap["Blender"]];
          break;
        default:
          offered = [skillMap["React"]];
          required = [skillMap["Node.js"]];
          break;
      }

      const profile = await SkillProfileModel.create({
        userId: user._id,
        offeredSkills: offered.filter(Boolean),
        requiredSkills: required.filter(Boolean),
        rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        totalExchanges: Math.floor(Math.random() * 15),
        metrics: {
          pendingRequests: Math.floor(Math.random() * 4),
          acceptedRequests: Math.floor(Math.random() * 10),
          completedRequests: Math.floor(Math.random() * 8),
          rejectedRequests: Math.floor(Math.random() * 3),
        },
      });

      console.log(`✅ ${user.name} → SkillProfile created (Rating: ${profile.rating})`);
    }

    console.log("\n✨ Database seeding completed successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Connection closed");
  }
};

seedDatabase();
