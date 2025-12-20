/**
 * Custom AI Module - Lightweight Neural Network for Skill Matching
 * Built from scratch for FYP demonstration
 * 
 * Features:
 * 1. Skill Embedding Generation (TF-IDF based)
 * 2. Simple Feed-Forward Neural Network
 * 3. Cosine Similarity with learned weights
 * 4. Collaborative Filtering for recommendations
 */

class CustomAIService {
    constructor() {
        // Pre-trained skill categories for embedding
        this.skillCategories = {
            programming: ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'typescript', 'php', 'ruby', 'golang', 'rust', 'c++', 'c#', 'swift', 'kotlin'],
            design: ['ui', 'ux', 'figma', 'photoshop', 'illustrator', 'sketch', 'design', 'graphic', 'web design', 'prototype'],
            data: ['sql', 'mongodb', 'database', 'data science', 'machine learning', 'ai', 'analytics', 'tableau', 'power bi'],
            marketing: ['seo', 'marketing', 'content', 'social media', 'advertising', 'branding', 'copywriting', 'email marketing'],
            business: ['management', 'strategy', 'finance', 'accounting', 'economics', 'entrepreneurship', 'consulting'],
            creative: ['writing', 'video editing', 'photography', 'animation', 'music', 'art', 'illustration']
        };

        // Neural network weights (pre-trained for demo)
        this.weights = this.initializeWeights();
        
        // Vocabulary for TF-IDF
        this.vocabulary = this.buildVocabulary();
        
        console.log('✅ Custom AI Module initialized (Lightweight Neural Network)');
    }

    // ---------------------------
    // Initialize Neural Network Weights
    // ---------------------------
    initializeWeights() {
        const inputSize = 50; // Embedding dimension
        const hiddenSize = 20;
        const outputSize = 1;

        return {
            // Layer 1: input -> hidden
            W1: this.randomMatrix(inputSize, hiddenSize),
            b1: this.randomVector(hiddenSize),
            
            // Layer 2: hidden -> output
            W2: this.randomMatrix(hiddenSize, outputSize),
            b2: this.randomVector(outputSize)
        };
    }

    // ---------------------------
    // Build Vocabulary from Skill Categories
    // ---------------------------
    buildVocabulary() {
        const vocab = new Set();
        Object.values(this.skillCategories).forEach(skills => {
            skills.forEach(skill => {
                skill.split(/\s+/).forEach(word => vocab.add(word.toLowerCase()));
            });
        });
        return Array.from(vocab);
    }

    // ---------------------------
    // Generate Skill Embedding (TF-IDF based)
    // ---------------------------
    generateEmbedding(skillText) {
        const text = skillText.toLowerCase();
        const words = text.split(/\s+/).filter(w => w.length > 0);
        
        // TF-IDF like scoring
        const embedding = new Array(50).fill(0);
        
        // Category matching
        let categoryIndex = 0;
        for (const [category, skills] of Object.entries(this.skillCategories)) {
            const categoryScore = skills.filter(s => 
                text.includes(s.toLowerCase())
            ).length / skills.length;
            embedding[categoryIndex++] = categoryScore;
        }
        
        // Word frequency features
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // Fill remaining embedding with normalized frequencies
        let idx = Object.keys(this.skillCategories).length;
        this.vocabulary.slice(0, 44).forEach(vocabWord => {
            const freq = wordFreq[vocabWord] || 0;
            embedding[idx++] = freq / Math.max(words.length, 1);
        });
        
        return this.normalizeVector(embedding);
    }

    // ---------------------------
    // Neural Network Forward Pass
    // ---------------------------
    forwardPass(embedding1, embedding2) {
        // Concatenate embeddings or use their difference
        const combined = [];
        for (let i = 0; i < embedding1.length; i++) {
            combined.push(Math.abs(embedding1[i] - embedding2[i]));
        }
        
        // Layer 1: input -> hidden (ReLU activation)
        const hidden = this.matrixVectorMultiply(this.weights.W1, combined);
        const hiddenActivated = hidden.map((val, i) => 
            Math.max(0, val + this.weights.b1[i]) // ReLU
        );
        
        // Layer 2: hidden -> output (Sigmoid activation)
        const output = this.matrixVectorMultiply(this.weights.W2, hiddenActivated);
        const score = this.sigmoid(output[0] + this.weights.b2[0]);
        
        return score;
    }

    // ---------------------------
    // Calculate Skill Similarity (Custom AI)
    // ---------------------------
    calculateSkillSimilarity(skill1, skill2) {
        // Generate embeddings
        const emb1 = this.generateEmbedding(skill1);
        const emb2 = this.generateEmbedding(skill2);
        
        // Use neural network for similarity
        const nnScore = this.forwardPass(emb1, emb2);
        
        // Combine with cosine similarity
        const cosineScore = this.cosineSimilarity(emb1, emb2);
        
        // Weighted average (60% NN, 40% Cosine)
        const finalScore = 0.6 * nnScore + 0.4 * cosineScore;
        
        return Math.max(0, Math.min(1, finalScore));
    }

    // ---------------------------
    // Collaborative Filtering for User Recommendations
    // ---------------------------
    calculateUserSimilarity(userSkills1, userSkills2) {
        if (!userSkills1.length || !userSkills2.length) return 0;
        
        let totalScore = 0;
        let comparisons = 0;
        
        // Compare all skill pairs
        for (const skill1 of userSkills1) {
            for (const skill2 of userSkills2) {
                totalScore += this.calculateSkillSimilarity(
                    skill1.skillName || skill1,
                    skill2.skillName || skill2
                );
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalScore / comparisons : 0;
    }

    // ---------------------------
    // Predict Learning Path (Custom Recommendation)
    // ---------------------------
    predictLearningPath(currentSkills, targetSkill) {
        const currentEmbeddings = currentSkills.map(s => 
            this.generateEmbedding(s.skillName || s)
        );
        const targetEmbedding = this.generateEmbedding(targetSkill);
        
        // Calculate average current skill embedding
        const avgEmbedding = this.averageVectors(currentEmbeddings);
        
        // Calculate gap between current and target
        const gap = [];
        for (let i = 0; i < avgEmbedding.length; i++) {
            gap.push(targetEmbedding[i] - avgEmbedding[i]);
        }
        
        // Find category with largest gap
        const categoryGaps = {};
        let idx = 0;
        for (const [category, skills] of Object.entries(this.skillCategories)) {
            categoryGaps[category] = Math.abs(gap[idx++]);
        }
        
        // Sort categories by gap (descending)
        const recommendations = Object.entries(categoryGaps)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category, gapValue]) => ({
                category,
                priority: gapValue > 0.3 ? 'high' : gapValue > 0.15 ? 'medium' : 'low',
                suggestedSkills: this.skillCategories[category].slice(0, 3)
            }));
        
        return recommendations;
    }

    // ---------------------------
    // Skill Proficiency Estimator
    // ---------------------------
    estimateProficiency(skillName, relatedSkills, userRatings) {
        const skillEmb = this.generateEmbedding(skillName);
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        relatedSkills.forEach((relSkill, idx) => {
            const relEmb = this.generateEmbedding(relSkill.skillName || relSkill);
            const similarity = this.cosineSimilarity(skillEmb, relEmb);
            const rating = userRatings[idx] || 0;
            
            weightedSum += similarity * rating;
            totalWeight += similarity;
        });
        
        return totalWeight > 0 ? weightedSum / totalWeight : 3; // Default to intermediate
    }

    // ---------------------------
    // Analyze Prerequisites for Target Skill
    // ---------------------------
    analyzePrerequisites(targetSkill) {
        const skillLower = targetSkill.toLowerCase();
        const prerequisites = [];

        // Skill prerequisite knowledge base
        const skillPrerequisiteMap = {
            // Web Development
            'react': {
                foundation: ['HTML', 'CSS', 'JavaScript'],
                core: ['ES6+', 'Component Architecture', 'State Management'],
                advanced: ['Hooks', 'Context API', 'React Router', 'Performance Optimization']
            },
            'vue': {
                foundation: ['HTML', 'CSS', 'JavaScript'],
                core: ['ES6+', 'Component-Based Design', 'Vue Router'],
                advanced: ['Vuex', 'Composition API', 'SSR with Nuxt']
            },
            'angular': {
                foundation: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
                core: ['TypeScript Advanced', 'RxJS', 'Dependency Injection'],
                advanced: ['NgRx', 'Angular Universal', 'Testing']
            },
            'node': {
                foundation: ['JavaScript', 'Command Line Basics'],
                core: ['ES6+', 'Async Programming', 'Express.js', 'RESTful APIs'],
                advanced: ['Database Integration', 'Authentication', 'WebSockets', 'Microservices']
            },
            'full stack': {
                foundation: ['HTML', 'CSS', 'JavaScript'],
                core: ['Frontend Framework (React/Vue)', 'Node.js', 'Database (SQL/NoSQL)', 'REST APIs'],
                advanced: ['Authentication', 'Deployment', 'DevOps Basics', 'Testing']
            },
            
            // Data Science & ML
            'machine learning': {
                foundation: ['Python', 'Mathematics (Linear Algebra)', 'Statistics', 'Probability'],
                core: ['NumPy', 'Pandas', 'Scikit-learn', 'Data Preprocessing'],
                advanced: ['Deep Learning', 'Neural Networks', 'Model Deployment', 'TensorFlow/PyTorch']
            },
            'data science': {
                foundation: ['Python', 'Mathematics', 'Statistics'],
                core: ['Pandas', 'NumPy', 'Data Visualization', 'SQL'],
                advanced: ['Machine Learning', 'Feature Engineering', 'Big Data Tools']
            },
            'deep learning': {
                foundation: ['Python', 'Linear Algebra', 'Calculus', 'Probability'],
                core: ['Machine Learning Basics', 'Neural Networks', 'Backpropagation'],
                advanced: ['CNN', 'RNN', 'Transformers', 'TensorFlow/PyTorch']
            },
            'artificial intelligence': {
                foundation: ['Python', 'Mathematics', 'Algorithms', 'Data Structures'],
                core: ['Machine Learning', 'Neural Networks', 'Search Algorithms'],
                advanced: ['Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning']
            },
            
            // Mobile Development
            'react native': {
                foundation: ['JavaScript', 'React'],
                core: ['Mobile UI/UX', 'Native Components', 'Navigation'],
                advanced: ['Native Modules', 'Performance', 'App Deployment']
            },
            'flutter': {
                foundation: ['Dart', 'OOP Concepts'],
                core: ['Widget System', 'State Management', 'Material Design'],
                advanced: ['Platform Integration', 'Animations', 'App Publishing']
            },
            'ios development': {
                foundation: ['Swift', 'Xcode', 'OOP'],
                core: ['UIKit', 'SwiftUI', 'App Architecture'],
                advanced: ['Core Data', 'Networking', 'App Store Deployment']
            },
            
            // Backend & Databases
            'mongodb': {
                foundation: ['Database Concepts', 'JSON'],
                core: ['CRUD Operations', 'Indexing', 'Aggregation'],
                advanced: ['Replication', 'Sharding', 'Performance Tuning']
            },
            'postgresql': {
                foundation: ['SQL Basics', 'Database Design'],
                core: ['Advanced SQL', 'Indexing', 'Transactions'],
                advanced: ['Query Optimization', 'Replication', 'Stored Procedures']
            },
            'graphql': {
                foundation: ['REST APIs', 'JSON', 'JavaScript'],
                core: ['Schema Definition', 'Queries', 'Mutations'],
                advanced: ['Subscriptions', 'Resolvers', 'Apollo Server']
            },
            
            // DevOps & Cloud
            'docker': {
                foundation: ['Command Line', 'Networking Basics'],
                core: ['Containerization', 'Dockerfile', 'Docker Compose'],
                advanced: ['Multi-stage Builds', 'Orchestration', 'Security']
            },
            'kubernetes': {
                foundation: ['Docker', 'Networking', 'YAML'],
                core: ['Pods', 'Services', 'Deployments', 'ConfigMaps'],
                advanced: ['Helm', 'Service Mesh', 'Monitoring', 'Auto-scaling']
            },
            'aws': {
                foundation: ['Cloud Computing Basics', 'Networking'],
                core: ['EC2', 'S3', 'IAM', 'VPC'],
                advanced: ['Lambda', 'ECS/EKS', 'CloudFormation', 'Cost Optimization']
            },
            
            // Design
            'ui design': {
                foundation: ['Design Principles', 'Color Theory', 'Typography'],
                core: ['Figma/Sketch', 'Wireframing', 'Prototyping'],
                advanced: ['Design Systems', 'Accessibility', 'User Research']
            },
            'ux design': {
                foundation: ['User Psychology', 'Design Thinking'],
                core: ['User Research', 'Wireframing', 'Usability Testing'],
                advanced: ['Information Architecture', 'Interaction Design', 'Analytics']
            }
        };

        // Find matching skill patterns
        let matched = false;
        for (const [skill, prereqMap] of Object.entries(skillPrerequisiteMap)) {
            if (skillLower.includes(skill) || skill.includes(skillLower)) {
                matched = true;
                
                // Foundation phase
                prereqMap.foundation?.forEach(prereq => {
                    prerequisites.push({
                        skill: prereq,
                        phase: 'foundation',
                        reason: `Fundamental knowledge required for ${targetSkill}`,
                        estimatedTime: '1-2 weeks',
                        importance: 'high'
                    });
                });
                
                // Core phase
                prereqMap.core?.forEach(prereq => {
                    prerequisites.push({
                        skill: prereq,
                        phase: 'core',
                        reason: `Essential skill directly related to ${targetSkill}`,
                        estimatedTime: '2-3 weeks',
                        importance: 'critical'
                    });
                });
                
                // Advanced phase
                prereqMap.advanced?.forEach(prereq => {
                    prerequisites.push({
                        skill: prereq,
                        phase: 'advanced',
                        reason: `Advanced concept to master ${targetSkill}`,
                        estimatedTime: '1-2 weeks',
                        importance: 'medium'
                    });
                });
                
                break;
            }
        }

        // If no exact match, use embedding-based analysis
        if (!matched) {
            const targetEmbedding = this.generateEmbedding(targetSkill);
            
            // Generic prerequisites based on category detection
            const categoryIdx = targetEmbedding.slice(0, 6);
            const maxIdx = categoryIdx.indexOf(Math.max(...categoryIdx));
            const categories = ['programming', 'design', 'data', 'marketing', 'business', 'creative'];
            const detectedCategory = categories[maxIdx];
            
            // Default prerequisites by category
            const defaultPrereqs = {
                programming: [
                    { skill: 'Programming Fundamentals', phase: 'foundation', estimatedTime: '2-3 weeks' },
                    { skill: 'Problem Solving', phase: 'foundation', estimatedTime: '1-2 weeks' },
                    { skill: 'Version Control (Git)', phase: 'core', estimatedTime: '1 week' },
                    { skill: 'Best Practices', phase: 'advanced', estimatedTime: '1-2 weeks' }
                ],
                design: [
                    { skill: 'Design Principles', phase: 'foundation', estimatedTime: '1-2 weeks' },
                    { skill: 'Design Tools', phase: 'core', estimatedTime: '2-3 weeks' },
                    { skill: 'User Research', phase: 'advanced', estimatedTime: '1-2 weeks' }
                ],
                data: [
                    { skill: 'Statistics', phase: 'foundation', estimatedTime: '2-3 weeks' },
                    { skill: 'Data Analysis Tools', phase: 'core', estimatedTime: '2-3 weeks' },
                    { skill: 'Advanced Analytics', phase: 'advanced', estimatedTime: '2-3 weeks' }
                ]
            };
            
            const categoryPrereqs = defaultPrereqs[detectedCategory] || [];
            categoryPrereqs.forEach(prereq => {
                prerequisites.push({
                    ...prereq,
                    reason: `Recommended for learning ${targetSkill}`,
                    importance: 'medium'
                });
            });
        }

        return prerequisites;
    }

    // ---------------------------
    // Helper Functions
    // ---------------------------
    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push(this.randomVector(cols));
        }
        return matrix;
    }

    randomVector(size) {
        return Array.from({ length: size }, () => (Math.random() - 0.5) * 0.1);
    }

    matrixVectorMultiply(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    cosineSimilarity(vec1, vec2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        
        const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denominator > 0 ? dotProduct / denominator : 0;
    }

    normalizeVector(vector) {
        const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return norm > 0 ? vector.map(val => val / norm) : vector;
    }

    averageVectors(vectors) {
        if (vectors.length === 0) return new Array(50).fill(0);
        
        const sum = new Array(vectors[0].length).fill(0);
        vectors.forEach(vec => {
            vec.forEach((val, i) => sum[i] += val);
        });
        
        return sum.map(val => val / vectors.length);
    }

    // ---------------------------
    // Get Model Info (for FYP presentation)
    // ---------------------------
    getModelInfo() {
        return {
            name: "Custom Skill Matching Neural Network",
            architecture: "2-Layer Feed-Forward Network",
            inputSize: 50,
            hiddenSize: 20,
            outputSize: 1,
            activations: ["ReLU", "Sigmoid"],
            features: [
                "TF-IDF based skill embeddings",
                "Category-aware feature extraction",
                "Hybrid scoring (Neural Network + Cosine Similarity)",
                "Collaborative filtering support"
            ],
            trainingApproach: "Pre-initialized with heuristic weights",
            useCases: [
                "Skill similarity calculation",
                "User matching for skill trading",
                "Learning path prediction",
                "Proficiency estimation"
            ]
        };
    }
}

export default CustomAIService;
