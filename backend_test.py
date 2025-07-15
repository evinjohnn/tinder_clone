#!/usr/bin/env python3
"""
Dating App Phase 3 Backend API Testing Suite
Tests all new features: Enhanced Prompts, Advanced Filters, Enhanced AI Assistant
"""

import requests
import json
import sys
from datetime import datetime
import time

class DatingAppAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()  # Use session to handle cookies
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details
        })
        return success

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers and cookie handling"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic health endpoint"""
        success, data = self.make_request('GET', 'health')
        details = f"Status: {data.get('status', 'unknown')}" if success else f"Error: {data.get('error', 'unknown')}"
        return self.log_test("Health Check", success, details)

    def test_user_registration(self):
        """Test user registration"""
        test_user = {
            "email": f"test_{int(time.time())}@example.com",
            "password": "TestPass123!",
            "name": "Test User",
            "age": 25,
            "gender": "male",
            "genderPreference": "female",
            "location": "New York"
        }
        
        success, data = self.make_request('POST', 'auth/signup', test_user, 201)
        if success and 'user' in data:
            self.user_id = data.get('user', {}).get('_id')
            details = f"User ID: {self.user_id}, Cookies: {len(self.session.cookies)} set"
        else:
            details = f"Error: {data.get('message', 'Registration failed')}"
        
        return self.log_test("User Registration", success, details)

    def test_user_login(self):
        """Test user login (fallback if registration fails)"""
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        
        success, data = self.make_request('POST', 'auth/login', login_data)
        if success and 'user' in data:
            self.user_id = data.get('user', {}).get('_id')
            self.token = "test-token-for-api-testing"
            details = f"User ID: {self.user_id}"
        else:
            details = f"Error: {data.get('message', 'Login failed')}"
        
        return self.log_test("User Login (Fallback)", success, details)

    # PHASE 3 NEW FEATURES TESTING

    def test_prompt_categories(self):
        """Test GET /api/prompts/categories"""
        success, data = self.make_request('GET', 'prompts/categories')
        
        if success:
            categories = data.get('categories', [])
            expected_categories = ['personality', 'lifestyle', 'relationship']
            has_expected = all(cat in [c.get('name', '') for c in categories] for cat in expected_categories)
            details = f"Found {len(categories)} categories: {[c.get('name') for c in categories]}"
            success = has_expected
        else:
            details = f"Error: {data.get('message', 'Failed to get categories')}"
        
        return self.log_test("Prompt Categories", success, details)

    def test_prompts_by_category(self):
        """Test GET /api/prompts/category/personality"""
        success, data = self.make_request('GET', 'prompts/category/personality')
        
        if success:
            prompts = data.get('prompts', [])
            details = f"Found {len(prompts)} personality prompts"
        else:
            details = f"Error: {data.get('message', 'Failed to get prompts')}"
        
        return self.log_test("Prompts by Category", success, details)

    def test_prompt_usage_recording(self):
        """Test POST /api/prompts/usage"""
        usage_data = {
            "promptId": "test-prompt-id",
            "category": "personality"
        }
        
        success, data = self.make_request('POST', 'prompts/usage', usage_data)
        details = f"Usage recorded: {data.get('success', False)}" if success else f"Error: {data.get('message', 'Failed to record usage')}"
        
        return self.log_test("Prompt Usage Recording", success, details)

    def test_advanced_filters_get(self):
        """Test GET /api/filters"""
        success, data = self.make_request('GET', 'filters')
        
        if success:
            filter_options = data.get('filterOptions', {})
            saved_filters = data.get('savedFilters', {})
            details = f"Filter options: {len(filter_options)} categories, Saved filters: {len(saved_filters)} items"
        else:
            details = f"Error: {data.get('message', 'Failed to get filters')}"
        
        return self.log_test("Advanced Filters Get", success, details)

    def test_advanced_filters_apply(self):
        """Test POST /api/filters/apply"""
        filter_data = {
            "ageRange": [25, 35],
            "location": "New York",
            "interests": ["music", "travel"],
            "education": "college"
        }
        
        success, data = self.make_request('POST', 'filters/apply', filter_data)
        
        if success:
            matches = data.get('matches', [])
            details = f"Found {len(matches)} filtered matches"
        else:
            details = f"Error: {data.get('message', 'Failed to apply filters')}"
        
        return self.log_test("Advanced Filters Apply", success, details)

    def test_advanced_filters_clear(self):
        """Test DELETE /api/filters/clear"""
        success, data = self.make_request('DELETE', 'filters/clear')
        details = f"Filters cleared: {data.get('success', False)}" if success else f"Error: {data.get('message', 'Failed to clear filters')}"
        
        return self.log_test("Advanced Filters Clear", success, details)

    def test_ai_icebreakers(self):
        """Test GET /api/ai-enhanced/icebreakers/:matchId"""
        match_id = "test-match-id"
        success, data = self.make_request('GET', f'ai-enhanced/icebreakers/{match_id}')
        
        if success:
            icebreakers = data.get('icebreakers', [])
            details = f"Generated {len(icebreakers)} icebreakers"
        else:
            details = f"Error: {data.get('message', 'Failed to get icebreakers')}"
        
        return self.log_test("AI Icebreakers", success, details)

    def test_ai_date_ideas(self):
        """Test POST /api/ai-enhanced/date-ideas/:matchId"""
        match_id = "test-match-id"
        preferences = {
            "budget": "medium",
            "location": "indoor",
            "interests": ["movies", "food"]
        }
        
        success, data = self.make_request('POST', f'ai-enhanced/date-ideas/{match_id}', preferences)
        
        if success:
            date_ideas = data.get('dateIdeas', [])
            details = f"Generated {len(date_ideas)} date ideas"
        else:
            details = f"Error: {data.get('message', 'Failed to generate date ideas')}"
        
        return self.log_test("AI Date Ideas", success, details)

    def test_ai_conversation_topics(self):
        """Test GET /api/ai-enhanced/conversation-topics/:matchId"""
        match_id = "test-match-id"
        success, data = self.make_request('GET', f'ai-enhanced/conversation-topics/{match_id}')
        
        if success:
            topics = data.get('topics', [])
            details = f"Generated {len(topics)} conversation topics"
        else:
            details = f"Error: {data.get('message', 'Failed to get conversation topics')}"
        
        return self.log_test("AI Conversation Topics", success, details)

    def test_ai_compatibility(self):
        """Test GET /api/ai-enhanced/compatibility/:matchId"""
        match_id = "test-match-id"
        success, data = self.make_request('GET', f'ai-enhanced/compatibility/{match_id}')
        
        if success:
            compatibility = data.get('compatibility', {})
            score = compatibility.get('score', 0)
            details = f"Compatibility score: {score}%"
        else:
            details = f"Error: {data.get('message', 'Failed to analyze compatibility')}"
        
        return self.log_test("AI Compatibility Analysis", success, details)

    def test_ai_flirting_tips(self):
        """Test GET /api/ai-enhanced/flirting-tips/:matchId"""
        match_id = "test-match-id"
        success, data = self.make_request('GET', f'ai-enhanced/flirting-tips/{match_id}')
        
        if success:
            tips = data.get('tips', [])
            details = f"Generated {len(tips)} flirting tips"
        else:
            details = f"Error: {data.get('message', 'Failed to get flirting tips')}"
        
        return self.log_test("AI Flirting Tips", success, details)

    def test_existing_features(self):
        """Test existing features to ensure they still work"""
        # Test user profile endpoint
        success, data = self.make_request('GET', 'users/profile')
        profile_test = self.log_test("User Profile (Existing)", success, 
                                   f"Profile loaded: {bool(data.get('user'))}" if success else f"Error: {data.get('message', 'Failed')}")
        
        # Test matches endpoint
        success, data = self.make_request('GET', 'matches')
        matches_test = self.log_test("Matches (Existing)", success, 
                                   f"Found {len(data.get('matches', []))} matches" if success else f"Error: {data.get('message', 'Failed')}")
        
        return profile_test and matches_test

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Dating App Phase 3 API Testing Suite")
        print("=" * 60)
        
        # Basic health and auth tests
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Try registration first, fallback to login
        auth_success = self.test_user_registration()
        if not auth_success:
            auth_success = self.test_user_login()
        
        if not auth_success:
            print("❌ Authentication failed - stopping tests")
            return False
        
        print("\n📝 Testing Phase 3 NEW FEATURES:")
        print("-" * 40)
        
        # Phase 3 Enhanced Prompts System
        self.test_prompt_categories()
        self.test_prompts_by_category()
        self.test_prompt_usage_recording()
        
        # Phase 3 Advanced Filters
        self.test_advanced_filters_get()
        self.test_advanced_filters_apply()
        self.test_advanced_filters_clear()
        
        # Phase 3 Enhanced AI Assistant
        self.test_ai_icebreakers()
        self.test_ai_date_ideas()
        self.test_ai_conversation_topics()
        self.test_ai_compatibility()
        self.test_ai_flirting_tips()
        
        print("\n🔄 Testing EXISTING FEATURES:")
        print("-" * 40)
        self.test_existing_features()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 FINAL RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['name']}: {result['details']}")
            return False

def main():
    """Main test execution"""
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = DatingAppAPITester()
    success = tester.run_all_tests()
    
    print(f"\n🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())