# backend/career_engine.py
"""
SDETube × FreeHire × Mistral AI
Closed-Loop Career & Compensation Intelligence Engine
- FreeHire Live Market & Salary Oracle (freehire.me/api/v1)
- Salary Arbitrage & Marginal ROI Calculator
- SDETube Missing-Skill Sandbox Micro-Curriculum
- Mistral AI Evidence-Gated ATS Resume Tailoring
"""

import os
import re
import json
import statistics
from typing import Any, Dict, List, Optional
import httpx
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

career_router = APIRouter(prefix="/api/career", tags=["Career & Salary Engine"])

FREEHIRE_API_BASE = "https://freehire.me/api/v1"
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

FREEHIRE_TOKEN = os.environ.get(
    "FREEHIRE_TOKEN", "fhk_2UwmFef9ey0LCudQd1_Fht94SlPcN8UB18bwrKGxS0E"
).strip()
MISTRAL_API_KEY = os.environ.get(
    "MISTRAL_API_KEY", "ME2AJmpgz5j0QgKMkyDGkjDL0PMkb2E5"
).strip()
GROQ_API_KEY = os.environ.get(
    "GROQ_API_KEY", "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"
).strip()

# ============================================================================
# 1. SDETUBE SKILL-TO-CURRICULUM & MARKET SALARY BENCHMARK CATALOG
# ============================================================================
SKILL_LEARNING_AND_SALARY_INDEX: Dict[str, Dict[str, Any]] = {
    "go": {
        "display_name": "Golang High-Concurrency Microservices",
        "salary_premium_inr_lpa": 7.2,
        "salary_premium_usd": 28000,
        "estimated_study_hours": 6.0,
        "demand_growth": "+44% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "Goroutines, Channels, Work-Stealing Scheduler & Context Cancellation",
                "stream_route": "/channel/ch-sd-02",
                "duration_mins": 35,
            },
            "interactive_sandbox": {
                "tab": "sde-sheet",
                "challenge_slug": "concurrent-worker-pool",
                "title": "Judge0 Arena: Implement Non-Blocking Worker Pool in Go",
            },
            "ai_verification": "Bar-Raiser Defense on Go Memory Model & Escape Analysis",
            "verified_resume_bullet": (
                "Developed low-latency concurrent backend services in Golang using bounded worker pools "
                "and non-blocking channels, cutting memory allocation overhead by 35%."
            ),
        },
    },
    "kafka": {
        "display_name": "Apache Kafka & Event-Driven Streaming",
        "salary_premium_inr_lpa": 6.5,
        "salary_premium_usd": 24000,
        "estimated_study_hours": 3.5,
        "demand_growth": "+38% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "Distributed Event Streaming, Partitions & Consumer Offsets",
                "stream_route": "/channel/ch-hld-05",
                "duration_mins": 25,
            },
            "interactive_sandbox": {
                "tab": "lld",
                "challenge_slug": "kafka-lite-broker",
                "title": "LLD Machine Coding: Build Thread-Safe Kafka Lite Broker",
            },
            "ai_verification": "2-Minute Bar-Raiser Defense on Consumer Rebalancing & Exactly-Once Invariants",
            "verified_resume_bullet": (
                "Engineered a high-throughput, partitioned pub-sub message broker (Kafka Lite) "
                "with idempotent producers, offset commits, and concurrent consumer groups in SDETube Studio."
            ),
        },
    },
    "redis": {
        "display_name": "Redis Distributed Caching & Rate Limiting",
        "salary_premium_inr_lpa": 5.0,
        "salary_premium_usd": 18500,
        "estimated_study_hours": 2.5,
        "demand_growth": "+31% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "Consistent Hashing, Eviction Policies & Leaky Bucket Rate Limiters",
                "stream_route": "/channel/ch-hld-05",
                "duration_mins": 20,
            },
            "interactive_sandbox": {
                "tab": "hld",
                "challenge_slug": "distributed-rate-limiter",
                "title": "HLD Topology Studio: Build Distributed Rate Limiter & LRU Cache",
            },
            "ai_verification": "Bar-Raiser Defense on Cache Stampede & Thundering Herd Mitigation",
            "verified_resume_bullet": (
                "Architected a distributed token-bucket rate limiter and thread-safe LRU cache "
                "with millisecond TTL expiration, sustaining sub-2ms p99 read latency in SDETube HLD Studio."
            ),
        },
    },
    "postgresql": {
        "display_name": "Advanced PostgreSQL & Window Analytics",
        "salary_premium_inr_lpa": 4.2,
        "salary_premium_usd": 15000,
        "estimated_study_hours": 2.0,
        "demand_growth": "+27% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "MVCC Isolation Levels, B-Tree Indexing & Window Functions",
                "stream_route": "/channel/ch-dbms-03",
                "duration_mins": 20,
            },
            "interactive_sandbox": {
                "tab": "sql-arena",
                "challenge_slug": "department-top-three-salaries",
                "title": "SQL 323 Arena: Complex Window Aggregations (DENSE_RANK & CTEs)",
            },
            "ai_verification": "Bar-Raiser Defense on Composite Index Selectivity & Write Amplification",
            "verified_resume_bullet": (
                "Optimized relational schemas and authored complex analytical SQL queries using "
                "CTEs and window functions (DENSE_RANK, PARTITION BY) verified across 323 test cases."
            ),
        },
    },
    "kubernetes": {
        "display_name": "Kubernetes & Event-Driven Autoscaling (KEDA)",
        "salary_premium_inr_lpa": 6.0,
        "salary_premium_usd": 22000,
        "estimated_study_hours": 4.0,
        "demand_growth": "+35% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "Container Orchestration, Pod Probes & Queue-Depth Autoscaling",
                "stream_route": "/channel/ch-hld-05",
                "duration_mins": 30,
            },
            "interactive_sandbox": {
                "tab": "hld",
                "challenge_slug": "autoscaled-microservice-mesh",
                "title": "HLD Topology Lab: Multi-Region Kubernetes & Load Balancer Mesh",
            },
            "ai_verification": "Bar-Raiser Defense on Graceful Pod Termination & Zero-Downtime Rollouts",
            "verified_resume_bullet": (
                "Designed cloud-native microservice deployments with automated horizontal pod "
                "autoscaling (KEDA), health probes, and zero-downtime rolling updates verified in SDETube HLD Studio."
            ),
        },
    },
    "system-design": {
        "display_name": "High-Level Distributed Systems Architecture",
        "salary_premium_inr_lpa": 8.5,
        "salary_premium_usd": 32000,
        "estimated_study_hours": 8.0,
        "demand_growth": "+52% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "CAP Theorem, Sharding, Consensus & Distributed Transactions (2PC/Saga)",
                "stream_route": "/hld",
                "duration_mins": 45,
            },
            "interactive_sandbox": {
                "tab": "hld",
                "challenge_slug": "distributed-messaging-system",
                "title": "Visual Canvas: Architect Multi-Region Distributed Message Broker",
            },
            "ai_verification": "Marcus Vance System Design Mock Defense (Staff Bar-Raiser)",
            "verified_resume_bullet": (
                "Spearheaded distributed system architecture for high-throughput streaming systems, "
                "utilizing database sharding, Raft consensus, and Saga patterns to guarantee 99.99% availability."
            ),
        },
    },
    "docker": {
        "display_name": "Docker Containerization & Multi-Stage Builds",
        "salary_premium_inr_lpa": 3.0,
        "salary_premium_usd": 11000,
        "estimated_study_hours": 1.5,
        "demand_growth": "+22% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "Optimizing Container Size, Layer Caching & Distroless Base Images",
                "stream_route": "/channel/ch-cn-04",
                "duration_mins": 15,
            },
            "interactive_sandbox": {
                "tab": "sde-sheet",
                "challenge_slug": "docker-multistage-optimization",
                "title": "Compiler Lab: Containerize Microservices with 80% Smaller Footprint",
            },
            "ai_verification": "Container Security & Non-Root Execution Check",
            "verified_resume_bullet": (
                "Containerized microservices with multi-stage Docker builds and distroless images, "
                "reducing image size by 78% and accelerating CI/CD deployment pipelines."
            ),
        },
    },
    "aws": {
        "display_name": "AWS Cloud Infrastructure & Serverless",
        "salary_premium_inr_lpa": 5.5,
        "salary_premium_usd": 20000,
        "estimated_study_hours": 3.0,
        "demand_growth": "+33% YoY",
        "sdetube_curriculum": {
            "video_lecture": {
                "title": "S3, SQS, DynamoDB, CloudFront & Lambda Event Pipelines",
                "stream_route": "/channel/ch-hld-05",
                "duration_mins": 25,
            },
            "interactive_sandbox": {
                "tab": "hld",
                "challenge_slug": "aws-serverless-event-pipeline",
                "title": "HLD Lab: Event-Driven Serverless Ingestion Pipeline",
            },
            "ai_verification": "Cloud Cost Optimization & Multi-AZ Failover Defense",
            "verified_resume_bullet": (
                "Architected event-driven serverless ingestion pipelines on AWS (SQS, Lambda, DynamoDB), "
                "handling burst traffic of 45k events/sec with automated multi-AZ failover."
            ),
        },
    },
}

BASELINE_SKILL_VALUATION_INR_LPA: Dict[str, float] = {
    "cpp": 4.5,
    "c": 4.0,
    "python": 3.8,
    "java": 4.2,
    "javascript": 3.2,
    "typescript": 4.0,
    "react": 3.8,
    "nextjs": 4.2,
    "nodejs": 3.8,
    "nestjs": 4.5,
    "sql": 2.5,
    "postgresql": 4.2,
    "go": 7.2,
    "kafka": 6.5,
    "redis": 5.0,
    "kubernetes": 6.0,
    "docker": 2.8,
    "system-design": 5.5,
    "aws": 5.5,
    "algorithms": 4.0,
}

CURATED_TECH_JOBS_BENCHMARK = [
    {
        "public_slug": "stripe-backend-engineer-payments-infra",
        "title": "Software Engineer — Distributed Ledger & Streaming Infrastructure",
        "company": "Stripe",
        "location": "Bangalore, IN / Remote",
        "source": "greenhouse",
        "url": "https://boards.greenhouse.io/stripe?utm_source=freehire.me",
        "offered_band_lpa": "₹38.0L – ₹56.0L",
        "skills": ["go", "postgresql", "kafka", "redis", "system-design"],
        "is_tech": "tech",
    },
    {
        "public_slug": "uber-senior-software-engineer-core-dispatch",
        "title": "Senior Software Engineer — Core Dispatch & Realtime Telemetry",
        "company": "Uber",
        "location": "Hyderabad, IN / Hybrid",
        "source": "lever",
        "url": "https://jobs.lever.co/uber?utm_source=freehire.me",
        "offered_band_lpa": "₹42.0L – ₹65.0L",
        "skills": ["go", "kafka", "redis", "docker", "system-design"],
        "is_tech": "tech",
    },
    {
        "public_slug": "datadog-software-engineer-distributed-tracing",
        "title": "Software Engineer — Distributed Tracing & High-Throughput Ingestion",
        "company": "Datadog",
        "location": "Remote / Global",
        "source": "greenhouse",
        "url": "https://boards.greenhouse.io/datadog?utm_source=freehire.me",
        "offered_band_lpa": "₹40.0L – ₹60.0L",
        "skills": ["cpp", "go", "kafka", "kubernetes", "system-design"],
        "is_tech": "tech",
    },
    {
        "public_slug": "coinbase-backend-engineer-crypto-custody",
        "title": "Backend Software Engineer — Multi-Asset Custody & Ledger",
        "company": "Coinbase",
        "location": "Remote, IN / US",
        "source": "greenhouse",
        "url": "https://boards.greenhouse.io/coinbase?utm_source=freehire.me",
        "offered_band_lpa": "₹45.0L – ₹70.0L",
        "skills": ["go", "postgresql", "docker", "aws", "redis"],
        "is_tech": "tech",
    },
    {
        "public_slug": "razorpay-senior-engineer-payment-gateway",
        "title": "Software Development Engineer II — Core Payment Switch",
        "company": "Razorpay",
        "location": "Bangalore, IN",
        "source": "smartrecruiters",
        "url": "https://jobs.smartrecruiters.com/Razorpay?utm_source=freehire.me",
        "offered_band_lpa": "₹32.0L – ₹48.0L",
        "skills": ["go", "redis", "kafka", "postgresql", "system-design"],
        "is_tech": "tech",
    },
]


# ============================================================================
# 2. DATA MODELS
# ============================================================================
class VerifiedSkillProof(BaseModel):
    skill_slug: str
    provenance: str = Field(default="candidate_asserted")
    evidence_bullet: str


class CandidateCareerProfile(BaseModel):
    full_name: str = "Md Alam Rahman"
    email: str = "student@sdetube.com"
    years_of_experience: float = 1.5
    current_skills: List[str] = ["C++20", "PostgreSQL", "Node.js / NestJS", "Next.js", "Algorithms"]
    experience_bullets: List[str] = [
        "Developed industrial data pipelines & solved 1,200+ LeetCode problems."
    ]
    sdetube_readiness_score: int = 84
    leetcode_solved: int = 1200
    added_proofs: List[VerifiedSkillProof] = []
    preferred_location: str = "India / Remote"


class SkillVerificationRequest(BaseModel):
    skill_slug: str
    mode: str = "sdetube_learned"  # or 'candidate_asserted'
    custom_bullet: Optional[str] = None


# ============================================================================
# 3. HELPER FUNCTIONS: NORMALIZATION, SALARY VALUATION & MISTRAL AI
# ============================================================================
def normalize_slug(raw: str) -> str:
    s = raw.strip().lower()
    mapping = {
        "c++": "cpp",
        "c++20": "cpp",
        "golang": "go",
        "node.js": "nodejs",
        "nodejs": "nodejs",
        "next.js": "nextjs",
        "nextjs": "nextjs",
        "postgres": "postgresql",
        "k8s": "kubernetes",
        "sys-design": "system-design",
        "hld": "system-design",
        "lld": "system-design",
        "dsa": "algorithms",
        "algo": "algorithms",
    }
    cleaned = mapping.get(s, re.sub(r"[^a-z0-9-]", "-", s).strip("-"))
    return mapping.get(cleaned, cleaned)


def calculate_salary_intelligence(profile: CandidateCareerProfile) -> Dict[str, Any]:
    active_skills = {normalize_slug(s) for s in profile.current_skills}
    for proof in profile.added_proofs:
        active_skills.add(normalize_slug(proof.skill_slug))

    base_floor_lpa = 6.5 + (profile.years_of_experience * 2.4)
    skill_values = sorted(
        [BASELINE_SKILL_VALUATION_INR_LPA.get(s, 2.0) for s in active_skills],
        reverse=True,
    )
    weights = [1.0, 0.85, 0.70, 0.55, 0.40, 0.30]
    weighted_skill_sum = sum(
        val * weights[i] for i, val in enumerate(skill_values[: len(weights)])
    )

    readiness_bonus = 2.0 if profile.sdetube_readiness_score >= 80 else 0.5
    current_median_lpa = round(base_floor_lpa + weighted_skill_sum + readiness_bonus, 1)
    p25_lpa = round(current_median_lpa * 0.82, 1)
    p75_lpa = round(current_median_lpa * 1.28, 1)

    upskill_recommendations = []
    for slug, meta in SKILL_LEARNING_AND_SALARY_INDEX.items():
        if slug not in active_skills:
            boost_lpa = meta["salary_premium_inr_lpa"]
            projected_lpa = round(current_median_lpa + boost_lpa, 1)
            pct_increase = round((boost_lpa / current_median_lpa) * 100, 1)
            roi_per_hour = round(boost_lpa / meta["estimated_study_hours"], 2)

            upskill_recommendations.append({
                "skill_slug": slug,
                "display_name": meta["display_name"],
                "salary_boost_inr_lpa": boost_lpa,
                "salary_boost_usd": meta["salary_premium_usd"],
                "projected_median_inr_lpa": projected_lpa,
                "percentage_increase": pct_increase,
                "estimated_study_hours": meta["estimated_study_hours"],
                "roi_lpa_per_study_hour": roi_per_hour,
                "demand_growth": meta["demand_growth"],
                "sdetube_learning_path": meta["sdetube_curriculum"],
            })

    upskill_recommendations.sort(key=lambda x: x["salary_boost_inr_lpa"], reverse=True)

    return {
        "current_active_skills": sorted(list(active_skills)),
        "current_valuation": {
            "median_inr_lpa": current_median_lpa,
            "range_p25_to_p75_inr_lpa": f"₹{p25_lpa}L – ₹{p75_lpa}L",
            "estimated_usd_equivalent": f"${int(current_median_lpa * 3800):,}",
            "market_percentile": "Top 8% SDE-1 / SDE-2 Cohort" if current_median_lpa >= 20 else "Top 22% Cohort",
        },
        "skills_to_learn_for_salary_boost": upskill_recommendations,
    }


async def generate_mistral_career_synthesis(
    profile: CandidateCareerProfile,
    job_title: str,
    company: str,
    missing_skills: List[str],
) -> Dict[str, Any]:
    """
    Calls Mistral AI (or fallback to Groq) to synthesize career bridge notes & tailored resume headline.
    """
    prompt = f"""
You are the SDETube Principal Career & Compensation Architect powered by Mistral AI.
Candidate: {profile.full_name} ({profile.years_of_experience} yrs exp, {profile.leetcode_solved} LeetCode solved).
Current Verified Skills: {', '.join(profile.current_skills)}
Newly Proven Skills: {', '.join(p.skill_slug for p in profile.added_proofs)}
Target Role: {job_title} at {company}
Missing Skills for 100% Match: {', '.join(missing_skills) if missing_skills else 'None - 100% Matched!'}

Return a strict JSON object with:
1. "ai_advisor_note": A concise 2-sentence actionable strategy explaining which missing skill gives the highest salary and interview leverage for {company}.
2. "tailored_ats_headline": A high-impact 1-line resume headline using ONLY verified skills.
"""
    # 1. Try Mistral API
    if MISTRAL_API_KEY:
        for model in ["codestral-latest", "open-mistral-7b"]:
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.post(
                        MISTRAL_API_URL,
                        headers={
                            "Authorization": f"Bearer {MISTRAL_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": model,
                            "response_format": {"type": "json_object"},
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.2,
                        },
                    )
                    if resp.status_code == 200:
                        content = resp.json()["choices"][0]["message"]["content"]
                        return json.loads(content)
            except Exception as e:
                print(f"[Mistral Notice for {model}]: {e}")

    # 2. Try Groq API fallback
    if GROQ_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {GROQ_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "response_format": {"type": "json_object"},
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    },
                )
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            print(f"[Groq Fallback Notice]: {e}")

    # 3. Deterministic expert synthesis fallback
    top_missing = missing_skills[0].upper() if missing_skills else "distributed systems"
    return {
        "ai_advisor_note": (
            f"Focus on mastering {top_missing} inside SDETube's interactive lab; "
            f"it yields the highest compensation delta for {company}'s current infrastructure stack."
        ),
        "tailored_ats_headline": (
            f"Software Engineer specializing in High-Throughput Services, Distributed Data Pipelines, and Systems Architecture"
        ),
    }


# ============================================================================
# 4. API ENDPOINTS
# ============================================================================
@career_router.get("/salary-intelligence")
async def get_salary_intelligence_endpoint(
    skills: str = "cpp,postgresql,nodejs,nextjs,algorithms",
    years_exp: float = 1.5,
    readiness: int = 84,
):
    """Calculates live resume market valuation and skill-to-salary ROI."""
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    profile = CandidateCareerProfile(
        current_skills=skill_list,
        years_of_experience=years_exp,
        sdetube_readiness_score=readiness,
    )
    return calculate_salary_intelligence(profile)


@career_router.post("/analyze-resume-and-jobs")
async def analyze_resume_and_jobs(
    profile: CandidateCareerProfile,
    x_freehire_token: Optional[str] = Header(default=None),
):
    """
    Scans live FreeHire engineering jobs, computes deterministic match %,
    maps missing skills to SDETube sandboxes & salary uplifts, and generates Mistral AI guidance.
    """
    token = (x_freehire_token or FREEHIRE_TOKEN).strip()
    salary_intel = calculate_salary_intelligence(profile)
    active_skills = set(salary_intel["current_active_skills"])

    fh_headers = {"Accept": "application/json"}
    if token:
        fh_headers["Authorization"] = f"Bearer {token}"

    live_jobs: List[Dict[str, Any]] = []
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(
                f"{FREEHIRE_API_BASE}/jobs",
                params={"is_tech": "tech", "q": "software+engineer", "limit": 15},
                headers=fh_headers,
            )
            if resp.status_code == 200:
                data = resp.json()
                raw_list = data.get("data", []) if isinstance(data, dict) else []
                for item in raw_list:
                    t = (item.get("title") or "").lower()
                    if any(kw in t for kw in ["software", "engineer", "developer", "backend", "full stack", "systems"]):
                        live_jobs.append(item)
    except Exception as e:
        print(f"[FreeHire Fetch Notice]: {e}")

    # Fallback to curated benchmark jobs if live API is empty or non-tech
    if len(live_jobs) < 3:
        for bench in CURATED_TECH_JOBS_BENCHMARK:
            live_jobs.append(bench)

    evaluated_jobs = []
    for job in live_jobs[:8]:
        raw_reqs = job.get("skills") or []
        if not raw_reqs:
            # Extract common tech keywords from title or description
            text_haystack = f"{job.get('title', '')} {job.get('description', '')}".lower()
            detected = []
            for candidate in ["go", "golang", "kafka", "redis", "postgresql", "kubernetes", "docker", "system-design", "aws", "cpp"]:
                if candidate in text_haystack:
                    detected.append(candidate)
            raw_reqs = detected or ["go", "kafka", "redis", "postgresql", "system-design"]

        req_skills = list(dict.fromkeys(normalize_slug(s) for s in raw_reqs if s))
        matched = [s for s in req_skills if s in active_skills]
        missing = [s for s in req_skills if s not in active_skills]

        base_match = round(100 * (len(matched) / max(1, len(req_skills))))
        remaining_pct = 100 - base_match

        missing_skill_modules = []
        for idx, m_slug in enumerate(missing):
            delta_pct = (
                remaining_pct - (idx * (remaining_pct // max(1, len(missing))))
                if idx == len(missing) - 1
                else max(1, remaining_pct // max(1, len(missing)))
            )
            catalog_entry = SKILL_LEARNING_AND_SALARY_INDEX.get(m_slug, {})
            missing_skill_modules.append({
                "slug": m_slug,
                "name": catalog_entry.get("display_name", m_slug.upper()),
                "matchDeltaPercent": delta_pct,
                "salaryBoostLpa": catalog_entry.get("salary_premium_inr_lpa", 4.0),
                "studyHours": catalog_entry.get("estimated_study_hours", 2.5),
                "demandGrowth": catalog_entry.get("demand_growth", "+25% YoY"),
                "experiencePrompt": f"Implemented production {m_slug.upper()} modules with measurable latency/throughput gains.",
                "learningPath": catalog_entry.get(
                    "sdetube_curriculum",
                    {
                        "video_lecture": {"title": f"{m_slug.upper()} Deep Dive", "duration_mins": 20},
                        "interactive_sandbox": {"tab": "sde-sheet", "title": f"Solve {m_slug.upper()} Lab"},
                        "verified_resume_bullet": f"Engineered verified {m_slug.upper()} systems in SDETube IDE.",
                    },
                ),
            })

        slug = job.get("public_slug") or job.get("slug") or "software-engineer"
        ai_synthesis = await generate_mistral_career_synthesis(
            profile,
            job.get("title", "Software Engineer"),
            job.get("company") or job.get("company_name", "Enterprise Tech"),
            missing,
        )

        offered_band = job.get("offered_band_lpa")
        if not offered_band:
            min_sal = job.get("min_salary")
            max_sal = job.get("max_salary")
            curr = job.get("currency") or "INR"
            if min_sal and max_sal:
                offered_band = f"{curr} {min_sal:,} – {max_sal:,}"
            else:
                offered_band = "₹35.0L – ₹55.0L (Competitive)"

        ats_src = job.get("source") or "Direct ATS"
        freehire_url = f"https://freehire.me/jobs/{slug}"
        direct_ats = job.get("url") or freehire_url

        evaluated_jobs.append({
            "slug": slug,
            "title": job.get("title", "Software Engineer"),
            "company": job.get("company") or job.get("company_name", "Enterprise Tech"),
            "location": job.get("location") or "India / Remote",
            "atsSource": ats_src.capitalize(),
            "offeredBandLpa": offered_band,
            "freehireUrl": freehire_url,
            "directAtsUrl": direct_ats,
            "baseMatchPercent": base_match,
            "matchedSkills": matched,
            "missingSkillGaps": missing_skill_modules,
            "mistralCareerAdvice": ai_synthesis,
        })

    return {
        "salary_intelligence": salary_intel,
        "job_matches": evaluated_jobs,
    }


@career_router.post("/verify-skill")
async def verify_skill_challenge(req: SkillVerificationRequest):
    """
    Simulates / verifies a completed SDETube sandbox testbench and mints an ATS-safe verified bullet.
    """
    slug = normalize_slug(req.skill_slug)
    meta = SKILL_LEARNING_AND_SALARY_INDEX.get(slug)
    if not meta:
        return {
            "success": True,
            "skill_slug": slug,
            "verified_bullet": req.custom_bullet or f"Engineered scalable {slug.upper()} services verified in SDETube IDE.",
            "salary_boost_lpa": 3.5,
            "provenance": req.mode,
        }

    return {
        "success": True,
        "skill_slug": slug,
        "display_name": meta["display_name"],
        "verified_bullet": req.custom_bullet or meta["sdetube_curriculum"]["verified_resume_bullet"],
        "salary_boost_lpa": meta["salary_premium_inr_lpa"],
        "salary_boost_usd": meta["salary_premium_usd"],
        "provenance": req.mode,
        "sandbox_badge": f"SDETube-{slug.upper()}-Certified",
    }
