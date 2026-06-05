import { Document, OperationalConstraint } from "@foresight/shared";

// 5 Relevant documents to SSO Migration
const relevantDocs: Document[] = [
  {
    id: "doc-001",
    title: "Postmortem: August 2024 Identity Provider Outage",
    type: "postmortem",
    date: "2024-08-15",
    author: "Sarah Chen",
    content: "During the August migration to the new SAML provider, we experienced a 4-hour outage. The root cause was a failure to migrate legacy API tokens that bypassed the main SSO gateway. All downstream services relying on these tokens failed cascadingly.",
    tags: ["SSO", "Outage", "Authentication", "Migration"]
  },
  {
    id: "doc-002",
    title: "Incident Report: Certificate Expiration Cascading Failure",
    type: "incident_report",
    date: "2023-11-02",
    author: "Marcus Webb",
    content: "A forgotten SSL certificate on the internal auth routing layer expired, causing a complete lockout of internal tooling. We assumed the auto-renewal script was covering all layers, but the load balancer terminating TLS was manually configured.",
    tags: ["Certificate", "Authentication", "Downtime"]
  },
  {
    id: "doc-003",
    title: "Retrospective: Q1 Security Enhancements",
    type: "retrospective",
    date: "2025-04-10",
    author: "David Park",
    content: "While rolling out MFA for all contractors, we realized our test environments do not accurately reflect production Active Directory sync delays. This caused contractors to be locked out on day one of the rollout because the sync took 6 hours instead of 5 minutes.",
    tags: ["MFA", "Active Directory", "Sync"]
  },
  {
    id: "doc-004",
    title: "Launch Review: CRM Platform Integration",
    type: "launch_review",
    date: "2025-01-20",
    author: "Elena Rostova",
    content: "The CRM integration was delayed by 3 weeks because the vendor's SSO endpoints did not support our specific OIDC claim structure. We had to write a custom claims mapper middleware at the last minute.",
    tags: ["OIDC", "Vendor", "Claims", "SSO"]
  },
  {
    id: "doc-005",
    title: "Executive Note: Tech Debt in Legacy Auth",
    type: "executive_note",
    date: "2024-05-30",
    author: "VP of Engineering",
    content: "We must prioritize removing the v1 authentication endpoints by end of year. Currently, 15% of our internal microservices still hardcode the v1 auth URLs. Any global identity shift must account for these legacy services before deprecating the endpoints.",
    tags: ["Tech Debt", "Authentication", "Legacy"]
  }
];

// 35 Distractor documents (realistic noise)
const distractorDocs: Document[] = Array.from({ length: 35 }).map((_, i) => ({
  id: `doc-noise-${i + 1}`,
  title: `Project ${String.fromCharCode(65 + (i % 26))} Update Q${(i % 4) + 1}`,
  type: i % 3 === 0 ? "retrospective" : i % 2 === 0 ? "executive_note" : "launch_review",
  date: `202${3 + (i % 3)}-0${(i % 9) + 1}-1${(i % 9)}`,
  author: ["Alex Smith", "Jordan Lee", "Taylor Wong", "Casey Jones"][i % 4],
  content: `Standard review notes for Project ${String.fromCharCode(65 + (i % 26))}. The team hit most OKRs, though we experienced some minor delays due to resource allocation in sprint ${i + 4}. The marketing launch was successful.`,
  tags: ["Marketing", "OKRs", "Review", `Project-${String.fromCharCode(65 + (i % 26))}`]
}));

export const allDocuments: Document[] = [...relevantDocs, ...distractorDocs];

export const mockOperationalConstraints: OperationalConstraint[] = [
  {
    category: "capacity",
    description: "Sprint velocity for the Identity Team is currently reduced by 30% due to summer PTO.",
    severity: "High"
  },
  {
    category: "workload",
    description: "The DevOps team is concurrently handling the Kubernetes cluster upgrade this week.",
    severity: "Medium"
  },
  {
    category: "metrics",
    description: "PR review times in the auth-gateway repository are averaging 3.2 days (up from 1.1 days).",
    severity: "Medium"
  }
];
