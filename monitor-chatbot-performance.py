#!/usr/bin/env python3
"""
Chatbot Performance Monitor
Monitors and benchmarks chatbot response times
"""

import asyncio
import aiohttp
import time
import json
import statistics
from datetime import datetime
from typing import List, Dict

class ChatbotPerformanceMonitor:
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = "dev-key"):
        self.base_url = base_url
        self.api_key = api_key
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def test_single_request(self, message: str) -> Dict:
        """Test a single chat request and measure response time"""
        start_time = time.time()
        
        try:
            async with self.session.post(
                f"{self.base_url}/chat",
                json={
                    "message": message,
                    "sessionId": f"test_{int(time.time() * 1000)}"
                },
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": self.api_key
                },
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                
                if response.status == 200:
                    data = await response.json()
                    return {
                        "success": True,
                        "response_time": response_time,
                        "message": message,
                        "response": data.get("response", ""),
                        "confidence": data.get("confidence", 0),
                        "status_code": response.status
                    }
                else:
                    return {
                        "success": False,
                        "response_time": response_time,
                        "message": message,
                        "error": f"HTTP {response.status}",
                        "status_code": response.status
                    }
                    
        except asyncio.TimeoutError:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            return {
                "success": False,
                "response_time": response_time,
                "message": message,
                "error": "Timeout",
                "status_code": 408
            }
        except Exception as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            return {
                "success": False,
                "response_time": response_time,
                "message": message,
                "error": str(e),
                "status_code": 0
            }
    
    async def run_benchmark(self, test_messages: List[str], concurrent_requests: int = 1) -> Dict:
        """Run benchmark with multiple test messages"""
        print(f"🚀 Starting benchmark with {len(test_messages)} messages, {concurrent_requests} concurrent requests")
        
        all_results = []
        
        # Run tests in batches for concurrent testing
        for i in range(0, len(test_messages), concurrent_requests):
            batch = test_messages[i:i + concurrent_requests]
            
            # Run batch concurrently
            tasks = [self.test_single_request(message) for message in batch]
            batch_results = await asyncio.gather(*tasks)
            all_results.extend(batch_results)
            
            # Show progress
            progress = min(i + concurrent_requests, len(test_messages))
            print(f"📊 Progress: {progress}/{len(test_messages)} requests completed")
        
        # Calculate statistics
        successful_results = [r for r in all_results if r["success"]]
        failed_results = [r for r in all_results if not r["success"]]
        
        if successful_results:
            response_times = [r["response_time"] for r in successful_results]
            
            stats = {
                "total_requests": len(all_results),
                "successful_requests": len(successful_results),
                "failed_requests": len(failed_results),
                "success_rate": len(successful_results) / len(all_results) * 100,
                "response_times": {
                    "min": min(response_times),
                    "max": max(response_times),
                    "mean": statistics.mean(response_times),
                    "median": statistics.median(response_times),
                    "p95": sorted(response_times)[int(len(response_times) * 0.95)] if len(response_times) > 1 else response_times[0],
                    "p99": sorted(response_times)[int(len(response_times) * 0.99)] if len(response_times) > 1 else response_times[0]
                },
                "timestamp": datetime.now().isoformat(),
                "concurrent_requests": concurrent_requests
            }
        else:
            stats = {
                "total_requests": len(all_results),
                "successful_requests": 0,
                "failed_requests": len(failed_results),
                "success_rate": 0,
                "response_times": None,
                "timestamp": datetime.now().isoformat(),
                "concurrent_requests": concurrent_requests
            }
        
        return {
            "statistics": stats,
            "detailed_results": all_results,
            "failed_results": failed_results
        }
    
    def print_results(self, benchmark_results: Dict):
        """Print formatted benchmark results"""
        stats = benchmark_results["statistics"]
        
        print("\n" + "="*60)
        print("🎯 CHATBOT PERFORMANCE BENCHMARK RESULTS")
        print("="*60)
        
        print(f"📊 Total Requests: {stats['total_requests']}")
        print(f"✅ Successful: {stats['successful_requests']}")
        print(f"❌ Failed: {stats['failed_requests']}")
        print(f"📈 Success Rate: {stats['success_rate']:.1f}%")
        print(f"🔄 Concurrent Requests: {stats['concurrent_requests']}")
        
        if stats["response_times"]:
            rt = stats["response_times"]
            print(f"\n⏱️  RESPONSE TIMES (milliseconds):")
            print(f"   Minimum: {rt['min']:.1f}ms")
            print(f"   Maximum: {rt['max']:.1f}ms")
            print(f"   Average: {rt['mean']:.1f}ms")
            print(f"   Median:  {rt['median']:.1f}ms")
            print(f"   95th %:  {rt['p95']:.1f}ms")
            print(f"   99th %:  {rt['p99']:.1f}ms")
            
            # Performance rating
            avg_time = rt['mean']
            if avg_time < 100:
                rating = "🚀 EXCELLENT"
            elif avg_time < 500:
                rating = "⚡ GOOD"
            elif avg_time < 2000:
                rating = "⚠️  ACCEPTABLE"
            else:
                rating = "🐌 NEEDS IMPROVEMENT"
            
            print(f"\n🏆 Performance Rating: {rating}")
        
        # Show failed requests if any
        failed_results = benchmark_results["failed_results"]
        if failed_results:
            print(f"\n❌ FAILED REQUESTS:")
            for result in failed_results[:5]:  # Show first 5 failures
                print(f"   Message: '{result['message'][:50]}...'")
                print(f"   Error: {result['error']}")
                print(f"   Time: {result['response_time']:.1f}ms")
                print()
        
        print("="*60)

async def main():
    # Test messages covering different scenarios
    test_messages = [
        # Greetings
        "hello",
        "hi there",
        "hey",
        
        # Skills
        "what are your skills?",
        "tell me about your technologies",
        "what programming languages do you know?",
        "react experience",
        "python skills",
        
        # Projects
        "show me your projects",
        "what have you built?",
        "tell me about your portfolio",
        "web applications",
        
        # Experience
        "what's your experience?",
        "tell me about your background",
        "education details",
        
        # Contact
        "how can I contact you?",
        "what's your email?",
        "hire you",
        
        # AI/ML
        "artificial intelligence experience",
        "machine learning projects",
        "AI integration",
        
        # Complex queries
        "Can you tell me about your full-stack development experience with React and Node.js?",
        "What kind of AI projects have you worked on and what technologies did you use?",
        "I'm looking for a developer who can build scalable web applications. Can you help?",
        
        # Edge cases
        "random question that doesn't match anything",
        "very long question that goes on and on and includes many different topics like skills and projects and experience and contact information all mixed together",
        ""  # Empty message
    ]
    
    print("🤖 Chatbot Performance Monitor")
    print("==============================")
    
    # Test different scenarios
    scenarios = [
        {"name": "Sequential Requests", "concurrent": 1},
        {"name": "Low Concurrency", "concurrent": 3},
        {"name": "High Concurrency", "concurrent": 5}
    ]
    
    async with ChatbotPerformanceMonitor() as monitor:
        # Check if service is available
        try:
            health_result = await monitor.test_single_request("health check")
            if not health_result["success"]:
                print("❌ Chatbot service is not available. Please start the service first.")
                return
        except:
            print("❌ Cannot connect to chatbot service. Please check if it's running on http://localhost:8000")
            return
        
        print("✅ Chatbot service is available")
        
        all_scenario_results = {}
        
        for scenario in scenarios:
            print(f"\n🧪 Testing Scenario: {scenario['name']}")
            print("-" * 40)
            
            results = await monitor.run_benchmark(
                test_messages, 
                concurrent_requests=scenario["concurrent"]
            )
            
            monitor.print_results(results)
            all_scenario_results[scenario["name"]] = results
        
        # Save detailed results to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"chatbot_performance_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(all_scenario_results, f, indent=2, default=str)
        
        print(f"\n💾 Detailed results saved to: {filename}")
        
        # Summary comparison
        print(f"\n📋 SCENARIO COMPARISON:")
        print("-" * 60)
        for name, results in all_scenario_results.items():
            stats = results["statistics"]
            if stats["response_times"]:
                avg_time = stats["response_times"]["mean"]
                success_rate = stats["success_rate"]
                print(f"{name:20} | Avg: {avg_time:6.1f}ms | Success: {success_rate:5.1f}%")
            else:
                print(f"{name:20} | Failed to get response times")

if __name__ == "__main__":
    asyncio.run(main())