/**
 * SEED SCRIPT — generates 50 demo records each for:
 *   Categories (10), Tags (pool), Posts (50), Comments (50), Contact messages (50)
 *
 * Run with:
 *   node scripts/seed.mjs
 *
 * Requires: DATABASE_URL in .env (same as the Next.js app)
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const MONGO_URI = process.env.DATABASE_URL;
if (!MONGO_URI) {
  console.error("❌  DATABASE_URL not found in .env");
  process.exit(1);
}

// ─── Schemas (inline — no TypeScript / path-alias complications) ────────────

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    coverImage: String,
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    permissions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    coverImageAlt: String,
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "SCHEDULED"],
      default: "PUBLISHED",
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    displayTags: { type: [String], default: [] },
    publishedAt: Date,
  },
  { timestamps: true },
);

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    category: String,
    message: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ─── Model Registration ──────────────────────────────────────────────────────

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);
const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

// ─── Static Data Pools ──────────────────────────────────────────────────────

const CATEGORIES = [
  {
    title: "Technology",
    slug: "technology",
    description: "Latest in tech, AI, and software.",
  },
  {
    title: "Health & Wellness",
    slug: "health-wellness",
    description: "Tips for a healthier lifestyle.",
  },
  {
    title: "Finance",
    slug: "finance",
    description: "Money, investing, and personal finance.",
  },
  {
    title: "Travel",
    slug: "travel",
    description: "Destinations and travel guides.",
  },
  {
    title: "Food & Cooking",
    slug: "food-cooking",
    description: "Recipes, restaurants, and culinary adventures.",
  },
  {
    title: "Science",
    slug: "science",
    description: "Discoveries and research from the scientific world.",
  },
  {
    title: "Lifestyle",
    slug: "lifestyle",
    description: "Fashion, home, and personal development.",
  },
  {
    title: "Sports",
    slug: "sports",
    description: "News and analysis from the world of sports.",
  },
  {
    title: "Environment",
    slug: "environment",
    description: "Climate, sustainability, and nature.",
  },
  {
    title: "Education",
    slug: "education",
    description: "Learning, schools, and EdTech.",
  },
];

const TAGS_POOL = [
  "AI",
  "machine learning",
  "cloud",
  "productivity",
  "nutrition",
  "fitness",
  "investing",
  "crypto",
  "travel tips",
  "recipe",
  "quantum",
  "space",
  "minimalism",
  "football",
  "climate change",
  "e-learning",
  "startups",
  "mental health",
  "remote work",
  "web development",
  "sustainability",
  "photography",
  "music",
  "design",
  "gaming",
  "robotics",
  "biotechnology",
  "podcast",
  "economics",
  "history",
];

const POST_TITLES = [
  "The Future of Artificial Intelligence in Everyday Life",
  "10 Habits That Will Transform Your Morning Routine",
  "Understanding Compound Interest: A Beginner's Guide",
  "Hidden Gems: Underrated Travel Destinations in Southeast Asia",
  "The Science Behind a Perfect Sourdough Loaf",
  "Quantum Computing Explained Simply",
  "Minimalism: How Owning Less Changed My Life",
  "Why Sleep is the Ultimate Performance Hack",
  "The Rise of Electric Vehicles: What You Need to Know",
  "5 Mediterranean Recipes You Can Make in Under 30 Minutes",
  "Is Intermittent Fasting Right for You?",
  "How to Start Investing with Just ₹500",
  "Exploring the Northern Lights: A Complete Guide",
  "The Psychology of Habits and How to Break Bad Ones",
  "Machine Learning vs Deep Learning: Key Differences",
  "Budget Travel Europe: See More, Spend Less",
  "The Art of Bread Baking at Home",
  "SpaceX's Mission to Mars: Timeline and Challenges",
  "Sustainable Fashion: How to Build an Eco-Friendly Wardrobe",
  "Understanding Cryptocurrency Without the Hype",
  "The Benefits of Daily Meditation",
  "How Remote Work is Reshaping Our Cities",
  "Introduction to Docker and Containerization",
  "Top 10 National Parks You Must Visit",
  "Plant-Based Diet: Myths and Realities",
  "The Economics of Social Media Platforms",
  "Photography Tips for Beginners: Capture Better Shots",
  "Climate Change: What the Data Actually Shows",
  "How to Negotiate Your Salary Like a Pro",
  "The History of the Internet: From ARPANET to Now",
  "Strength Training for Beginners: A 12-Week Plan",
  "Exploring Ancient Rome: A Traveler's Guide",
  "The Science of Coffee: Why It Makes You Alert",
  "Building a Side Hustle While Working Full-Time",
  "AI in Healthcare: Diagnosis, Drugs, and Data",
  "Top Hiking Trails in the Himalayas",
  "Fermentation 101: Kimchi, Kombucha & More",
  "The Role of Music in Human Evolution",
  "JavaScript Frameworks in 2025: Which One Should You Learn?",
  "Marine Conservation: Protecting Our Oceans",
  "The Rise of the Gig Economy: Pros and Cons",
  "How to Design a Productive Home Office",
  "A Brief History of Black Holes",
  "Running Your First 5K: A Training Plan",
  "Street Food Guide: The Best Bites in Bangkok",
  "Blockchain Beyond Crypto: Real-World Applications",
  "The Science of Happiness: What Research Says",
  "Best Road Trip Routes Across India",
  "Zero-Waste Kitchen: Practical Tips for Every Home",
  "The Future of Education: EdTech Trends to Watch",
];

const DESCRIPTIONS = [
  "Discover how this topic is shaping the world we live in and what it means for the future.",
  "A comprehensive guide breaking down the essentials with practical examples you can apply today.",
  "Expert insights backed by research to help you make better decisions in everyday life.",
  "From beginner to intermediate — everything you need to know to get started and level up.",
  "We explore the most important trends, data, and stories from this fascinating field.",
  "A deep dive into the facts, myths, and surprising truths that most people don't know.",
  "Personal experiences combined with expert advice to give you a unique perspective.",
  "The latest updates, analysis, and actionable advice you won't find anywhere else.",
  "Step-by-step guidance to help you achieve your goals faster with less effort.",
  "An honest look at the challenges, opportunities, and lessons from this essential topic.",
];

const COMMENT_TEXTS = [
  "Such an insightful article! Exactly what I was looking for.",
  "I've been thinking about this for a while. Great to see it broken down so clearly.",
  "Really well-written. Shared this with my whole team!",
  "This changed my perspective completely. Thank you for the deep dive.",
  "Excellent research. The statistics were eye-opening.",
  "This is the most comprehensive piece I've read on this topic.",
  "I disagree with point #3 but overall a great read.",
  "Bookmarked! Coming back to this one for reference.",
  "Perfect timing. I was literally just discussing this yesterday.",
  "Incredible how much I didn't know before reading this.",
  "Simple, clear, and to the point. More like this please!",
  "I tried implementing the tips and they actually work!",
  "The visuals would make this even better but the content itself is solid.",
  "Can you write a follow-up post on this topic?",
  "Shared with my LinkedIn followers. This deserves more attention.",
  "Genuinely surprised by how nuanced this was. Highly recommend.",
  "First time commenting but this post was worth breaking my silence.",
  "The examples you gave made everything so much easier to understand.",
  "Really appreciate the unbiased take on a polarizing topic.",
  "This is exactly the kind of long-form content the internet needs more of.",
];

const CONTACT_MESSAGES_DATA = [
  {
    name: "Rahul Sharma",
    email: "rahul.s@example.com",
    category: "General Inquiry",
    message:
      "Hi, I wanted to reach out to learn more about your content and if you accept guest posts. I'm a writer specializing in technology topics.",
  },
  {
    name: "Priya Patel",
    email: "priya.p@gmail.com",
    category: "Career / Job Application",
    message:
      "I'm a frontend developer with 3 years of experience and I'd love to be part of your team. Please find my portfolio attached.",
  },
  {
    name: "Alex Johnson",
    email: "alex.j@techcorp.com",
    category: "Sponsorship & Advertising",
    message:
      "We're interested in sponsoring a series of articles related to cloud computing on your platform. Who should I contact for media kit details?",
  },
  {
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    category: "Content Feedback",
    message:
      "I really enjoyed your recent article on AI but noticed a small factual error in the section about GPT models. Wanted to flag it kindly.",
  },
  {
    name: "Tom Williams",
    email: "tom.w@gmail.com",
    category: "Bug Report",
    message:
      "The comments section isn't loading on mobile devices running iOS 17. Getting a blank white space below each post.",
  },
  {
    name: "Neha Gupta",
    email: "neha.g@startup.in",
    category: "Partnership & Collaboration",
    message:
      "We run a podcast on entrepreneurship and would love to collaborate on co-branded content. Is there someone I can speak to about this?",
  },
  {
    name: "James Carter",
    email: "james.c@newsweekly.com",
    category: "Press & Media",
    message:
      "I'm a journalist covering the digital media landscape. Would any of your editors be available for a 20-minute interview for an upcoming piece?",
  },
  {
    name: "Anya Kovacs",
    email: "anya.k@freelance.eu",
    category: "General Inquiry",
    message:
      "Do you have a newsletter? I'd love to subscribe and get your latest articles directly in my inbox.",
  },
  {
    name: "Mohan Das",
    email: "mohan.d@academic.edu",
    category: "Content Feedback",
    message:
      "The article on climate data was excellent but the source citations were missing. For academic use it would be great to have those included.",
  },
  {
    name: "Emily Chen",
    email: "emily.c@designstudio.com",
    category: "Sponsorship & Advertising",
    message:
      "Our design agency is looking to advertise on niche content platforms. What are your CPM rates and audience demographics?",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const slug = (title, idx) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) + `-${idx}`;

// Seed Unsplash-style placeholder images by category
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800",
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
  "https://images.unsplash.com/photo-1542601906897-bb54eea72b64?w=800",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
];

const DISPLAY_TAGS_OPTIONS = [[], [], [], ["Editor Choice"], ["Trending"], []];

// ─── Main Seed Function ──────────────────────────────────────────────────────

async function seed() {
  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { bufferCommands: false });
  console.log("✅  Connected!\n");

  // ── 1. Categories ────────────────────────────────────────────────────────
  console.log("🗂️   Seeding categories...");
  const existingCatSlugs = (await Category.find({}, "slug").lean()).map(
    (c) => c.slug,
  );
  const newCats = CATEGORIES.filter((c) => !existingCatSlugs.includes(c.slug));
  const insertedCats =
    newCats.length > 0 ? await Category.insertMany(newCats) : [];
  const allCategories = await Category.find({}).lean();
  console.log(
    `   ✔ ${allCategories.length} categories total (${insertedCats.length} new)\n`,
  );

  // ── 2. Find & use an existing admin user  ────────────────────────────────
  console.log("👤  Finding an existing user for authorship...");
  let author = await User.findOne({}).lean();
  if (!author) {
    // Create a demo author if none exists
    author = await User.create({
      name: "Demo Author",
      email: "demo@blogsite.com",
      permissions: 0,
    });
    console.log("   ✔ Created a demo author (demo@blogsite.com)\n");
  } else {
    console.log(`   ✔ Using existing user: ${author.name} (${author.email})\n`);
  }

  // ── 3. Posts (50) ────────────────────────────────────────────────────────
  console.log("📝  Seeding 50 posts...");
  const existingSlugs = new Set(
    (await Post.find({}, "slug").lean()).map((p) => p.slug),
  );
  const postsToInsert = [];
  let postIdx = 0;

  for (let i = 0; i < 50; i++) {
    const titleBase = POST_TITLES[i % POST_TITLES.length];
    const postSlug = slug(titleBase, i + 1);

    if (existingSlugs.has(postSlug)) {
      postIdx++;
      continue;
    }

    const category = pick(allCategories);
    const tags = pickN(TAGS_POOL, rand(2, 5));
    const status = i < 40 ? "PUBLISHED" : i < 47 ? "DRAFT" : "SCHEDULED";
    const views = rand(50, 12000);

    postsToInsert.push({
      title: titleBase,
      slug: postSlug,
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      content: `<h2>${titleBase}</h2><p>${DESCRIPTIONS[i % DESCRIPTIONS.length]}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In euismod, libero eu suscipit dictum, lorem mi convallis nisi, at ultrices risus libero et mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p><p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed nec justo vitae odio sagittis dignissim. Nunc fermentum, purus sed tincidunt facilisis, sapien nunc faucibus justo, vel ultrices risus risus sit amet ligula.</p><blockquote><p>"The greatest glory in living lies not in never falling, but in rising every time we fall."</p></blockquote><p>Maecenas eget velit at arcu bibendum tempus. Phasellus suscipit arcu vitae lacus dapibus, at maximus leo bibendum. Integer vulputate orci nec magna scelerisque, at maximus leo bibendum.</p>`,
      coverImage: COVER_IMAGES[i % COVER_IMAGES.length],
      coverImageAlt: titleBase,
      tags,
      status,
      author: author._id,
      category: category._id,
      views,
      displayTags: pick(DISPLAY_TAGS_OPTIONS),
      publishedAt:
        status === "PUBLISHED"
          ? new Date(Date.now() - rand(1, 365) * 86400000)
          : undefined,
    });

    existingSlugs.add(postSlug);
    postIdx++;
  }

  if (postsToInsert.length > 0) {
    await Post.insertMany(postsToInsert);
  }
  const allPosts = await Post.find({}).lean();
  console.log(
    `   ✔ ${allPosts.length} posts total (${postsToInsert.length} new)\n`,
  );

  // ── 4. Comments (50) ─────────────────────────────────────────────────────
  console.log("💬  Seeding 50 comments...");
  const existingCommentCount = await Comment.countDocuments();
  if (existingCommentCount < 50) {
    const commentsToInsert = Array.from(
      { length: 50 - existingCommentCount },
      (_, i) => ({
        content: COMMENT_TEXTS[i % COMMENT_TEXTS.length],
        post: pick(allPosts)._id,
        author: author._id,
        isApproved: Math.random() > 0.15, // ~85% approved
      }),
    );
    await Comment.insertMany(commentsToInsert);
    console.log(`   ✔ ${50} comments total (${commentsToInsert.length} new)\n`);
  } else {
    console.log(`   ✔ Already ${existingCommentCount} comments — skipping\n`);
  }

  // ── 5. Contact Messages (50) ──────────────────────────────────────────────
  console.log("📬  Seeding 50 contact messages...");
  const existingContactCount = await Contact.countDocuments();
  if (existingContactCount < 50) {
    const toAdd = 50 - existingContactCount;
    const contactsToInsert = Array.from({ length: toAdd }, (_, i) => {
      const base = CONTACT_MESSAGES_DATA[i % CONTACT_MESSAGES_DATA.length];
      return {
        ...base,
        // Make each slightly unique
        name: `${base.name} ${i > 9 ? `(${i + 1})` : ""}`.trim(),
        email: base.email.replace("@", `+${i + 1}@`),
        subject: base.category,
        isRead: Math.random() > 0.5,
      };
    });
    await Contact.insertMany(contactsToInsert);
    console.log(`   ✔ ${50} contacts total (${toAdd} new)\n`);
  } else {
    console.log(
      `   ✔ Already ${existingContactCount} contact messages — skipping\n`,
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [postCount, commentCount, contactCount, catCount] = await Promise.all([
    Post.countDocuments(),
    Comment.countDocuments(),
    Contact.countDocuments(),
    Category.countDocuments(),
  ]);

  console.log("══════════════════════════════════════════");
  console.log("🎉  Seed complete! Database summary:");
  console.log(`   📁 Categories : ${catCount}`);
  console.log(`   📝 Posts      : ${postCount}`);
  console.log(`   💬 Comments   : ${commentCount}`);
  console.log(`   📬 Contacts   : ${contactCount}`);
  console.log("══════════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌  Disconnected. Happy testing!");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
