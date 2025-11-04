import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { SkillModel } from "../models/skill.model.js";
import { SkillProfileModel } from "../models/skillProfile.model.js";
import connectDb from "../db/index.js";

dotenv.config();

// -----------------------------------------------------------------------------
// USERS (30 realistic diverse sample users)
// -----------------------------------------------------------------------------
const baseUsers = [
  { name: "Alice Johnson", email: "alice.johnson@example.com", profession: "Software Engineer", address: { country: "USA", city: "San Francisco" } },
  { name: "Bob Smith", email: "bob.smith@example.com", profession: "Senior Backend Developer", address: { country: "USA", city: "New York" } },
  { name: "Carol Martinez", email: "carol.martinez@example.com", profession: "UI/UX Designer", address: { country: "Spain", city: "Barcelona" } },
  { name: "David Chen", email: "david.chen@example.com", profession: "Data Scientist", address: { country: "Singapore", city: "Singapore" } },
  { name: "Emma Wilson", email: "emma.wilson@example.com", profession: "Mobile Developer", address: { country: "UK", city: "London" } },
  { name: "Frank Garcia", email: "frank.garcia@example.com", profession: "DevOps Engineer", address: { country: "USA", city: "Austin" } },
  { name: "Grace Lee", email: "grace.lee@example.com", profession: "Frontend Developer", address: { country: "Canada", city: "Toronto" } },
  { name: "Henry Taylor", email: "henry.taylor@example.com", profession: "Game Developer", address: { country: "USA", city: "Seattle" } },
  { name: "Iris Patel", email: "iris.patel@example.com", profession: "Security Engineer", address: { country: "India", city: "Mumbai" } },
  { name: "Jack Robinson", email: "jack.robinson@example.com", profession: "Junior Developer", address: { country: "Australia", city: "Sydney" } },
];

const moreUsers = [
  "Laura Adams", "Michael Brown", "Nina Shah", "Oliver Davis", "Priya Verma", "Quinn Nelson",
  "Ravi Kumar", "Sophie Clark", "Thomas Evans", "Uma Reddy", "Victor Hughes", "Wendy Lopez",
  "Xavier Grant", "Yara Malik", "Zane Carter", "Bella Nguyen", "Carlos Ortega", "Diana Foster",
  "Ethan Brooks", "Farah Ali"
].map((name, idx) => ({
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  password: "password123",
  age: 22 + (idx % 10),
  bio: "Enthusiastic learner aiming to grow in tech and collaborate with peers.",
  profession: ["Frontend Dev", "Backend Dev", "Designer", "Data Analyst", "Mobile Dev"][idx % 5],
  address: {
    country: ["USA", "UK", "Canada", "India", "Germany"][idx % 5],
    city: ["Boston", "Manchester", "Vancouver", "Delhi", "Berlin"][idx % 5],
  },
  socialLinks: {
    github: `https://github.com/${name.toLowerCase().split(" ")[0]}`,
    linkedin: `https://linkedin.com/in/${name.toLowerCase().split(" ")[0]}`
  }
}));

const usersData = [...baseUsers, ...moreUsers].map(u => ({
  ...u,
  password: "password123",
  age: u.age || 25,
  bio: u.bio || "Passionate about learning and sharing knowledge.",
  socialLinks: u.socialLinks || {},
}));

// -----------------------------------------------------------------------------
// SKILLS (your 10 templates)
// -----------------------------------------------------------------------------
const baseSkills = [
  {
    offered: [
      { name: "React", proficiency: "Advanced", category: "Frontend" },
      { name: "TypeScript", proficiency: "Intermediate", category: "Frontend" },
    ],
    required: [
      { name: "Node.js", proficiency: "Intermediate", category: "Backend" },
      { name: "MongoDB", proficiency: "Beginner", category: "Database" },
    ],
  },
  {
    offered: [
      { name: "Express.js", proficiency: "Advanced", category: "Backend" },
      { name: "MongoDB", proficiency: "Advanced", category: "Database" },
    ],
    required: [
      { name: "React", proficiency: "Intermediate", category: "Frontend" },
      { name: "Tailwind CSS", proficiency: "Beginner", category: "Frontend" },
    ],
  },
  {
    offered: [
      { name: "Figma", proficiency: "Advanced", category: "Design" },
      { name: "Adobe XD", proficiency: "Intermediate", category: "Design" },
    ],
    required: [
      { name: "React", proficiency: "Intermediate", category: "Frontend" },
      { name: "Framer Motion", proficiency: "Beginner", category: "Frontend" },
    ],
  },
  {
    offered: [
      { name: "Python", proficiency: "Advanced", category: "Programming" },
      { name: "TensorFlow", proficiency: "Intermediate", category: "AI/ML" },
    ],
    required: [
      { name: "Next.js", proficiency: "Intermediate", category: "Frontend" },
      { name: "GraphQL", proficiency: "Beginner", category: "Backend" },
    ],
  },
  {
    offered: [
      { name: "Flutter", proficiency: "Intermediate", category: "Mobile" },
      { name: "Firebase", proficiency: "Intermediate", category: "Backend" },
    ],
    required: [
      { name: "React Native", proficiency: "Beginner", category: "Mobile" },
      { name: "Redux", proficiency: "Beginner", category: "Frontend" },
    ],
  },
  {
    offered: [
      { name: "AWS", proficiency: "Advanced", category: "Cloud" },
      { name: "Docker", proficiency: "Intermediate", category: "DevOps" },
    ],
    required: [
      { name: "Kubernetes", proficiency: "Beginner", category: "DevOps" },
      { name: "CI/CD", proficiency: "Beginner", category: "DevOps" },
    ],
  },
  {
    offered: [
      { name: "HTML", proficiency: "Advanced", category: "Frontend" },
      { name: "CSS", proficiency: "Advanced", category: "Frontend" },
    ],
    required: [
      { name: "React", proficiency: "Intermediate", category: "Frontend" },
      { name: "TypeScript", proficiency: "Beginner", category: "Frontend" },
    ],
  },
  {
    offered: [
      { name: "C#", proficiency: "Advanced", category: "Programming" },
      { name: ".NET", proficiency: "Intermediate", category: "Backend" },
    ],
    required: [
      { name: "React", proficiency: "Intermediate", category: "Frontend" },
      { name: "Node.js", proficiency: "Beginner", category: "Backend" },
    ],
  },
  {
    offered: [
      { name: "Cybersecurity", proficiency: "Advanced", category: "Security" },
      { name: "Penetration Testing", proficiency: "Intermediate", category: "Security" },
    ],
    required: [
      { name: "Cloud Security", proficiency: "Beginner", category: "Security" },
      { name: "DevSecOps", proficiency: "Beginner", category: "Security" },
    ],
  },
  {
    offered: [
      { name: "C++", proficiency: "Advanced", category: "Programming" },
      { name: "Unreal Engine", proficiency: "Intermediate", category: "Game Dev" },
    ],
    required: [
      { name: "Unity", proficiency: "Beginner", category: "Game Dev" },
      { name: "Blender", proficiency: "Beginner", category: "Design" },
    ],
  },
];

const skillsData = Array.from({ length: usersData.length }, (_, i) => baseSkills[i % baseSkills.length]);

// -----------------------------------------------------------------------------
// SEED SCRIPT
// -----------------------------------------------------------------------------
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    await connectDb();

    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await SkillModel.deleteMany({});
    await SkillProfileModel.deleteMany({});
    console.log("✅ Existing data cleared");

    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const skillData = skillsData[i];

      console.log(`\n👤 Creating user: ${userData.name}`);

      const dicebearAvatar = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
        userData.name || userData.email.split("@")[0]
      )}`;

      const user = await User.create({
        ...userData,
        profileImage: dicebearAvatar,
      });
      console.log(`   ✓ User created with ID: ${user._id}`);

      const offeredSkillIds = [];
      for (const skill of skillData.offered) {
        const createdSkill = await SkillModel.create(skill);
        offeredSkillIds.push(createdSkill._id);
      }

      const requiredSkillIds = [];
      for (const skill of skillData.required) {
        const createdSkill = await SkillModel.create(skill);
        requiredSkillIds.push(createdSkill._id);
      }

      const skillProfile = await SkillProfileModel.create({
        userId: user._id,
        offeredSkills: offeredSkillIds,
        requiredSkills: requiredSkillIds,
        rating: Math.random() * 2 + 3,
        totalExchanges: Math.floor(Math.random() * 20),
        metrics: {
          pendingRequests: Math.floor(Math.random() * 5),
          acceptedRequests: Math.floor(Math.random() * 10),
          completedRequests: Math.floor(Math.random() * 8),
          rejectedRequests: Math.floor(Math.random() * 3)
        }
      });

      console.log(`   ✓ Skill profile created with rating: ${skillProfile.rating.toFixed(2)}`);
    }

    console.log("\n✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
};

seedDatabase();
