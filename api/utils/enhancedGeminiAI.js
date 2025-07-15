// api/utils/enhancedGeminiAI.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class EnhancedGeminiAIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    async generatePersonalizedIceBreakers(userProfile, matchProfile) {
        try {
            const prompt = this.buildPersonalizedIceBreakerPrompt(userProfile, matchProfile);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseIceBreakers(text);
        } catch (error) {
            console.error('Error generating personalized ice breakers:', error);
            return this.getDefaultIceBreakers(matchProfile);
        }
    }

    async generateDateIdeas(userProfile, matchProfile, preferences = {}) {
        try {
            const prompt = this.buildDateIdeasPrompt(userProfile, matchProfile, preferences);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseDateIdeas(text);
        } catch (error) {
            console.error('Error generating date ideas:', error);
            return this.getDefaultDateIdeas();
        }
    }

    async generateConversationTopics(userProfile, matchProfile, conversationHistory = []) {
        try {
            const prompt = this.buildConversationTopicsPrompt(userProfile, matchProfile, conversationHistory);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseConversationTopics(text);
        } catch (error) {
            console.error('Error generating conversation topics:', error);
            return this.getDefaultConversationTopics();
        }
    }

    async analyzeCompatibility(userProfile, matchProfile) {
        try {
            const prompt = this.buildCompatibilityAnalysisPrompt(userProfile, matchProfile);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseCompatibilityAnalysis(text);
        } catch (error) {
            console.error('Error analyzing compatibility:', error);
            return this.getDefaultCompatibilityAnalysis();
        }
    }

    async generateFlirtingTips(userProfile, matchProfile, conversationHistory = []) {
        try {
            const prompt = this.buildFlirtingTipsPrompt(userProfile, matchProfile, conversationHistory);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseFlirtingTips(text);
        } catch (error) {
            console.error('Error generating flirting tips:', error);
            return this.getDefaultFlirtingTips();
        }
    }

    async generateRedFlagAnalysis(messages) {
        try {
            const prompt = this.buildRedFlagAnalysisPrompt(messages);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseRedFlagAnalysis(text);
        } catch (error) {
            console.error('Error analyzing red flags:', error);
            return { riskLevel: 'low', flags: [], advice: 'Conversation appears normal' };
        }
    }

    buildPersonalizedIceBreakerPrompt(userProfile, matchProfile) {
        return `Create 5 personalized ice breakers for ${userProfile.name} to message ${matchProfile.name}.

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Job: ${userProfile.job || 'Not specified'}
- Interests: ${userProfile.questionnaire?.interests?.join(', ') || 'Not specified'}
- Prompts: ${userProfile.prompts?.map(p => `${p.prompt}: ${p.answer}`).join('; ') || 'None'}

MATCH PROFILE:
- Name: ${matchProfile.name}
- Age: ${matchProfile.age}
- Job: ${matchProfile.job || 'Not specified'}
- School: ${matchProfile.school || 'Not specified'}
- Interests: ${matchProfile.questionnaire?.interests?.join(', ') || 'Not specified'}
- Prompts: ${matchProfile.prompts?.map(p => `${p.prompt}: ${p.answer}`).join('; ') || 'None'}

Requirements:
1. Reference specific details from their profile
2. Create engaging conversation starters
3. Show genuine interest and personality
4. Use a friendly, confident tone
5. Include follow-up questions

Format as JSON array of objects with 'message', 'basedOn', and 'tone' fields.`;
    }

    buildDateIdeasPrompt(userProfile, matchProfile, preferences) {
        return `Generate 5 creative date ideas for ${userProfile.name} and ${matchProfile.name}.

USER INTERESTS: ${userProfile.questionnaire?.interests?.join(', ') || 'Not specified'}
MATCH INTERESTS: ${matchProfile.questionnaire?.interests?.join(', ') || 'Not specified'}

MUTUAL INTERESTS: ${this.findMutualInterests(userProfile, matchProfile).join(', ') || 'None found'}

PREFERENCES:
- Budget: ${preferences.budget || 'any'}
- Location: ${preferences.location || 'any'}
- Time: ${preferences.time || 'any'}
- Activity Level: ${preferences.activityLevel || 'any'}

Create diverse date ideas that:
1. Match their shared interests
2. Are appropriate for getting to know each other
3. Allow for conversation
4. Are fun and engaging
5. Consider the specified preferences

Format as JSON array of objects with 'title', 'description', 'location', 'duration', 'cost', and 'whyPerfect' fields.`;
    }

    buildConversationTopicsPrompt(userProfile, matchProfile, conversationHistory) {
        return `Suggest 8 conversation topics for ${userProfile.name} and ${matchProfile.name}.

CONVERSATION HISTORY:
${conversationHistory.slice(-10).map(msg => `${msg.senderName}: ${msg.content}`).join('\n')}

SHARED INTERESTS: ${this.findMutualInterests(userProfile, matchProfile).join(', ') || 'None found'}

USER QUESTIONNAIRE HIGHLIGHTS:
- Relationship Goals: ${userProfile.questionnaire?.relationshipGoals || 'Not specified'}
- Interests: ${userProfile.questionnaire?.interests?.slice(0, 5).join(', ') || 'None'}
- Values: ${userProfile.questionnaire?.politicalViews || 'Not specified'}

MATCH QUESTIONNAIRE HIGHLIGHTS:
- Relationship Goals: ${matchProfile.questionnaire?.relationshipGoals || 'Not specified'}
- Interests: ${matchProfile.questionnaire?.interests?.slice(0, 5).join(', ') || 'None'}
- Values: ${matchProfile.questionnaire?.politicalViews || 'Not specified'}

Create conversation topics that:
1. Build on previous messages
2. Explore shared interests
3. Learn about compatibility
4. Are engaging and fun
5. Help develop emotional connection

Format as JSON array of objects with 'topic', 'suggestedQuestion', 'category', and 'deeperQuestions' fields.`;
    }

    buildCompatibilityAnalysisPrompt(userProfile, matchProfile) {
        return `Analyze compatibility between ${userProfile.name} and ${matchProfile.name}.

USER PROFILE:
- Age: ${userProfile.age}
- Relationship Goals: ${userProfile.questionnaire?.relationshipGoals || 'Not specified'}
- Lifestyle: ${JSON.stringify(userProfile.questionnaire || {})}

MATCH PROFILE:
- Age: ${matchProfile.age}
- Relationship Goals: ${matchProfile.questionnaire?.relationshipGoals || 'Not specified'}
- Lifestyle: ${JSON.stringify(matchProfile.questionnaire || {})}

Analyze:
1. Overall compatibility score (0-100)
2. Strengths in compatibility
3. Potential challenges
4. Relationship success factors
5. Communication style compatibility
6. Lifestyle compatibility
7. Values alignment

Format as JSON object with 'score', 'strengths', 'challenges', 'recommendations', and 'longTermOutlook' fields.`;
    }

    buildFlirtingTipsPrompt(userProfile, matchProfile, conversationHistory) {
        return `Provide personalized flirting tips for ${userProfile.name} when talking to ${matchProfile.name}.

CONVERSATION CONTEXT:
${conversationHistory.slice(-5).map(msg => `${msg.senderName}: ${msg.content}`).join('\n')}

MATCH PERSONALITY INSIGHTS:
- Humor Style: ${matchProfile.questionnaire?.humorStyle || 'Not specified'}
- Communication Style: ${matchProfile.questionnaire?.communicationStyle || 'Not specified'}
- Social Level: ${matchProfile.questionnaire?.socialLevel || 'Not specified'}

Create flirting advice that:
1. Matches their personality type
2. Builds on current conversation
3. Is appropriate and respectful
4. Increases romantic tension
5. Maintains genuine connection

Format as JSON array of objects with 'tip', 'example', 'timing', and 'expectedResponse' fields.`;
    }

    buildRedFlagAnalysisPrompt(messages) {
        return `Analyze these messages for potential red flags or concerning behavior:

MESSAGES:
${messages.map(msg => `${msg.senderName}: ${msg.content}`).join('\n')}

Look for:
1. Inappropriate requests or comments
2. Pushy or aggressive behavior
3. Inconsistencies in their story
4. Manipulative language
5. Disrespectful attitudes
6. Love bombing or excessive compliments
7. Requests for money or personal information
8. Controlling behavior

Format as JSON object with 'riskLevel' (low/medium/high), 'flags' array, and 'advice' string.`;
    }

    findMutualInterests(userProfile, matchProfile) {
        const userInterests = userProfile.questionnaire?.interests || [];
        const matchInterests = matchProfile.questionnaire?.interests || [];
        return userInterests.filter(interest => matchInterests.includes(interest));
    }

    parseIceBreakers(text) {
        try {
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return this.getDefaultIceBreakers();
        }
    }

    parseDateIdeas(text) {
        try {
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return this.getDefaultDateIdeas();
        }
    }

    parseConversationTopics(text) {
        try {
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return this.getDefaultConversationTopics();
        }
    }

    parseCompatibilityAnalysis(text) {
        try {
            return JSON.parse(text);
        } catch (error) {
            return this.getDefaultCompatibilityAnalysis();
        }
    }

    parseFlirtingTips(text) {
        try {
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return this.getDefaultFlirtingTips();
        }
    }

    parseRedFlagAnalysis(text) {
        try {
            return JSON.parse(text);
        } catch (error) {
            return { riskLevel: 'low', flags: [], advice: 'Unable to analyze at this time' };
        }
    }

    getDefaultIceBreakers(matchProfile = {}) {
        return [
            {
                message: `Hey ${matchProfile.name}! I noticed we have some shared interests. What's something you're passionate about lately?`,
                basedOn: 'profile',
                tone: 'friendly'
            },
            {
                message: `Hi there! Your profile caught my attention. What's been the highlight of your week?`,
                basedOn: 'general',
                tone: 'casual'
            }
        ];
    }

    getDefaultDateIdeas() {
        return [
            {
                title: 'Coffee & Conversation',
                description: 'A relaxed coffee date to get to know each other',
                location: 'Local coffee shop',
                duration: '1-2 hours',
                cost: 'Low',
                whyPerfect: 'Great for initial connection and conversation'
            }
        ];
    }

    getDefaultConversationTopics() {
        return [
            {
                topic: 'Travel Dreams',
                suggestedQuestion: 'What\'s your dream travel destination?',
                category: 'interests',
                deeperQuestions: ['What draws you to that place?', 'What\'s your favorite travel memory?']
            }
        ];
    }

    getDefaultCompatibilityAnalysis() {
        return {
            score: 75,
            strengths: ['Similar interests', 'Compatible communication styles'],
            challenges: ['Different lifestyle preferences'],
            recommendations: ['Focus on shared interests', 'Discuss lifestyle preferences openly'],
            longTermOutlook: 'Positive with good communication'
        };
    }

    getDefaultFlirtingTips() {
        return [
            {
                tip: 'Use playful teasing about shared interests',
                example: 'I bet you\'re the type who takes forever to choose a coffee order 😉',
                timing: 'After establishing some rapport',
                expectedResponse: 'Playful banter back'
            }
        ];
    }
}

export const enhancedGeminiAI = new EnhancedGeminiAIService();