// AI Service using Google Gemini Pro (Free)
class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        this.model = "gemini-2.5-flash";
        this.useAI = !!this.apiKey;
        this.rateLimitHit = false;

        if (!this.useAI) {
            console.warn("⚠️ GEMINI_API_KEY not found. AI features will use fallback methods.");
            console.warn("   Get your free key at: https://aistudio.google.com/app/apikey");
        } else {
            console.log("✅ Gemini AI enabled (Free tier: 10 requests/min)");
        }
    }

    // ---------------------------
    // Call Gemini API for text generation
    // ---------------------------
    async callGemini(prompt, options = {}) {
        if (!this.useAI || this.rateLimitHit) return null;

        try {
            const response = await fetch(
                `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: prompt }] }
                        ],
                        generationConfig: {
                            temperature: options.temperature || 0.7,
                            topK: options.topK || 40,
                            topP: options.topP || 0.95,
                            maxOutputTokens: options.maxOutputTokens || 1024
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                
                // Handle rate limit specifically
                if (response.status === 429) {
                    if (!this.rateLimitHit) {
                        this.rateLimitHit = true;
                        console.warn("⚠️ Gemini rate limit reached (10 req/min). Using fallback similarity calculation.");
                        console.warn("💡 Tip: Wait 60 seconds or upgrade your plan for higher limits.");
                    }
                    return null;
                }
                
                console.error("Gemini API error:", response.status, errorData.error?.message || errorData);
                return null;
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (error) {
            console.error("Error calling Gemini:", error.message);
            return null;
        }
    }

    // ---------------------------
    // Calculate semantic similarity
    // ---------------------------
    async calculateSimilarity(text1, text2) {
        if (!this.useAI || this.rateLimitHit) {
            return this.fallbackSimilarity(text1, text2);
        }

        try {
            const prompt = `Rate the similarity between these two skill descriptions on a scale of 0 to 1 (0 = completely different, 1 = identical). Only respond with a number.

Skill 1: ${text1}
Skill 2: ${text2}
Similarity score (0-1):`;

            const response = await this.callGemini(prompt, { temperature: 0.1, maxOutputTokens: 10 });
            
            if (!response) {
                return this.fallbackSimilarity(text1, text2);
            }
            
            const score = parseFloat(response?.trim());
            return isNaN(score) ? this.fallbackSimilarity(text1, text2) : Math.max(0, Math.min(1, score));
        } catch (error) {
            return this.fallbackSimilarity(text1, text2);
        }
    }

    // ---------------------------
    // Fallback similarity calculation
    // ---------------------------
    fallbackSimilarity(text1, text2) {
        const normalize = (txt) => txt.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const t1 = normalize(text1);
        const t2 = normalize(text2);

        if (t1 === t2) return 1;
        if (t1.includes(t2) || t2.includes(t1)) return 0.9;

        const words1 = t1.split(/\s+/).filter(w => w.length > 2);
        const words2 = t2.split(/\s+/).filter(w => w.length > 2);
        const commonWords = words1.filter(w => words2.includes(w));
        const wordOverlap = commonWords.length / Math.max(words1.length, words2.length, 1);

        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        const jaccardSim = intersection.size / union.size;

        return Math.max(wordOverlap, jaccardSim);
    }

    // ---------------------------
    // Find skill matches
    // ---------------------------
    async findSkillMatches(userOfferedSkills, otherUserRequiredSkills) {
        const matches = [];

        for (const offered of userOfferedSkills) {
            for (const required of otherUserRequiredSkills) {
                const offeredText = `${offered.name} ${offered.proficiencyLevel} ${offered.description} ${offered.categories?.join(" ")}`;
                const requiredText = `${required.name} ${required.learningPriority} ${required.description} ${required.categories?.join(" ")}`;

                const similarity = await this.calculateSimilarity(offeredText, requiredText);
                if (similarity > 0.5) {
                    matches.push({
                        offeredSkill: { id: offered._id, name: offered.name, proficiencyLevel: offered.proficiencyLevel },
                        requiredSkill: { id: required._id, name: required.name, learningPriority: required.learningPriority },
                        matchScore: similarity,
                        matchPercentage: Math.round(similarity * 100)
                    });
                }
            }
        }

        return matches.sort((a, b) => b.matchScore - a.matchScore);
    }

    // ---------------------------
    // Bidirectional match between users
    // ---------------------------
    async calculateBidirectionalMatch(user1Skills, user2Skills) {
        const matches1to2 = await this.findSkillMatches(user1Skills.offered, user2Skills.required);
        const matches2to1 = await this.findSkillMatches(user2Skills.offered, user1Skills.required);

        const totalMatches = matches1to2.length + matches2to1.length;
        const averageScore = totalMatches > 0
            ? (matches1to2.reduce((sum, m) => sum + m.matchScore, 0) + matches2to1.reduce((sum, m) => sum + m.matchScore, 0)) / totalMatches
            : 0;

        return {
            canTeach: matches1to2.slice(0, 5),
            canLearn: matches2to1.slice(0, 5),
            overallScore: averageScore,
            matchPercentage: Math.round(averageScore * 100),
            isMutualMatch: matches1to2.length > 0 && matches2to1.length > 0
        };
    }

    // ---------------------------
    // Skill recommendations
    // ---------------------------
    async generateSkillRecommendations(userProfile, currentSkills) {
        if (!this.useAI) return this.getFallbackRecommendations(userProfile, currentSkills);

        try {
            const offeredSkills = currentSkills.offered.map(s => s.name).join(", ");
            const requiredSkills = currentSkills.required.map(s => s.name).join(", ");

            const prompt = `You are a career advisor. Given a ${userProfile.profession || 'professional'} who knows: ${offeredSkills} and wants to learn: ${requiredSkills}, suggest exactly 5 complementary skills to learn next. Format: 1. Skill - Reason`;

            const response = await this.callGemini(prompt, { temperature: 0.8, maxOutputTokens: 500 });
            const recommendations = this.parseRecommendations(response);

            return recommendations.length ? recommendations : this.getFallbackRecommendations(userProfile, currentSkills);
        } catch (error) {
            return this.getFallbackRecommendations(userProfile, currentSkills);
        }
    }

    parseRecommendations(text) {
        if (!text) return [];
        return text.split('\n').filter(line => line.trim()).slice(0, 5).map(line => {
            const match = line.match(/\d+\.\s*([^-:]+)[-:]?\s*(.+)?/);
            return match ? { skill: match[1].trim(), reason: match[2]?.trim() || "AI-recommended" } : null;
        }).filter(Boolean);
    }

    getFallbackRecommendations(userProfile, currentSkills) {
        const skillMap = {
            "Frontend Developer": ["TypeScript", "Next.js", "Testing", "Web Performance", "GraphQL"],
            "Backend Developer": ["Docker", "Kubernetes", "GraphQL", "Microservices", "Redis"],
            "Full Stack Developer": ["DevOps", "Cloud Architecture", "System Design", "Security", "Testing"],
            "Mobile Developer": ["Swift", "Kotlin", "Flutter", "Mobile Testing", "CI/CD"],
            "Data Scientist": ["TensorFlow", "PyTorch", "MLOps", "Big Data", "Cloud ML"],
            "DevOps Engineer": ["Terraform", "Ansible", "Monitoring", "Security", "Cloud Native"],
            "UI/UX Designer": ["JavaScript", "React", "Animation", "Accessibility", "Design Systems"]
        };

        const recommendations = skillMap[userProfile.profession] || ["Git", "Docker", "Testing", "Cloud Services", "API Design"];
        return recommendations.map(skill => ({ skill, reason: `Valuable for ${userProfile.profession}` }));
    }

    // ---------------------------
    // User profile analysis
    // ---------------------------
    async analyzeProfile(userProfile) {
        if (!this.useAI) return { sentiment: "POSITIVE", confidence: 0.7, insights: this.generateInsights({ label: "POSITIVE", score: 0.7 }, userProfile) };

        try {
            const bioText = userProfile.bio || "No bio available";
            const prompt = `Analyze this bio and respond ONLY with POSITIVE, NEGATIVE, or NEUTRAL:\n"${bioText}"\nSentiment:`;

            const response = await this.callGemini(prompt, { temperature: 0.3, maxOutputTokens: 10 });
            const sentiment = ["POSITIVE", "NEGATIVE", "NEUTRAL"].includes(response?.trim().toUpperCase()) ? response.trim().toUpperCase() : "POSITIVE";

            return { sentiment, confidence: 0.85, insights: this.generateInsights({ label: sentiment, score: 0.85 }, userProfile) };
        } catch {
            return { sentiment: "POSITIVE", confidence: 0.7, insights: this.generateInsights({ label: "POSITIVE", score: 0.7 }, userProfile) };
        }
    }

    generateInsights(sentiment, userProfile) {
        const insights = [];
        if (sentiment.label === "POSITIVE" && sentiment.score > 0.8) insights.push("Your profile shows enthusiasm and passion!");
        if (!userProfile.bio || userProfile.bio.length < 50) insights.push("Consider adding more details to your bio.");
        if (!userProfile.profileImage) insights.push("Add a profile picture.");
        const socialLinksCount = Object.values(userProfile.socialLinks || {}).filter(Boolean).length;
        if (socialLinksCount < 2) insights.push("Add more social links.");
        return insights;
    }

    // ---------------------------
    // Learning path generation
    // ---------------------------
    generateLearningPath(currentSkills, desiredSkills) {
        const path = [];
        const skillDependencies = {
            "React": ["JavaScript", "HTML", "CSS"],
            "Node.js": ["JavaScript"],
            "TypeScript": ["JavaScript"],
            "Next.js": ["React", "JavaScript"],
            "GraphQL": ["API Design"],
            "Docker": ["Linux Basics"],
            "Kubernetes": ["Docker"],
            "Python": [],
            "Django": ["Python"],
            "Flask": ["Python"],
            "TensorFlow": ["Python", "Machine Learning"],
            "AWS": ["Cloud Basics"],
            "MongoDB": ["Database Basics"]
        };

        for (const skill of desiredSkills) {
            const prereqs = skillDependencies[skill.name] || [];
            const missing = prereqs.filter(p => !currentSkills.some(s => s.name === p));
            path.push({
                skill: skill.name,
                prerequisites: prereqs,
                status: missing.length ? "blocked" : "ready",
                recommendation: missing.length ? `Learn ${missing.join(", ")} first` : "You're ready!"
            });
        }
        return path;
    }

    // ---------------------------
    // User ranking
    // ---------------------------
    async rankUsers(currentUser, potentialMatches) {
        const rankedUsers = [];
        for (const match of potentialMatches) {
            const score = await this.calculateUserScore(currentUser, match);
            rankedUsers.push({ ...match, aiScore: score, recommendation: this.getRecommendationText(score) });
        }
        return rankedUsers.sort((a, b) => b.aiScore - a.aiScore);
    }

    async calculateUserScore(currentUser, otherUser) {
        let score = 0;
        const skillMatch = await this.calculateBidirectionalMatch(
            { offered: currentUser.offeredSkills, required: currentUser.requiredSkills },
            { offered: otherUser.offeredSkills, required: otherUser.requiredSkills }
        );
        score += skillMatch.overallScore * 40;
        score += (otherUser.rating / 5) * 20;
        score += Math.min(otherUser.totalExchanges / 20, 1) * 20;

        if (currentUser.address?.city === otherUser.user?.address?.city) score += 10;
        else if (currentUser.address?.country === otherUser.user?.address?.country) score += 5;

        const activity = ((otherUser.metrics?.completedRequests || 0) * 2 + (otherUser.metrics?.acceptedRequests || 0)) / 50;
        score += Math.min(activity, 1) * 10;

        return Math.min(score, 100);
    }

    getRecommendationText(score) {
        if (score >= 80) return "Excellent match! Highly recommended.";
        if (score >= 60) return "Great match! Good skill alignment.";
        if (score >= 40) return "Good match! Some overlap in skills.";
        if (score >= 20) return "Potential match. Limited overlap.";
        return "Low match. Consider other users.";
    }
}

export default new AIService();
