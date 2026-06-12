import { Document, OperationalConstraint } from "@foresight/shared";

const ssoDocs: Document[] = [
  {
    id: "doc-sso-001",
    title: "Postmortem: August 2024 Identity Provider Outage",
    type: "postmortem",
    date: "2024-08-15",
    author: "Sarah Chen",
    content: "During the August migration to the new SAML provider, we experienced a 4-hour outage. The root cause was a failure to migrate legacy API tokens that bypassed the main SSO gateway. All downstream services relying on these tokens failed cascadingly. This incident highlights the critical need to inventory all legacy authentication mechanisms before enforcing strict OIDC workflows. We must never assume that deprecation warnings alone are sufficient for internal microservices. The migration was delayed by a full sprint while we reverse-engineered the token usage.",
    tags: ["SSO", "Outage", "Authentication", "Migration"]
  },
  {
    id: "doc-sso-002",
    title: "Incident Report: Certificate Expiration Cascading Failure",
    type: "incident_report",
    date: "2023-11-02",
    author: "Marcus Webb",
    content: "A forgotten SSL certificate on the internal auth routing layer expired, causing a complete lockout of internal tooling. We assumed the auto-renewal script was covering all layers, but the load balancer terminating TLS was manually configured. This oversight cascaded into a complete SSO blackout for all employees. The recovery process was severely delayed because the infrastructure team lacked emergency 'break-glass' access to the load balancer configurations without SSO. Operational lesson: always maintain an out-of-band access mechanism for critical infrastructure routing layers.",
    tags: ["Certificate", "Authentication", "Downtime"]
  },
  {
    id: "doc-sso-003",
    title: "Retrospective: Q1 Security Enhancements",
    type: "retrospective",
    date: "2025-04-10",
    author: "David Park",
    content: "While rolling out MFA for all contractors, we realized our test environments do not accurately reflect production Active Directory sync delays. This caused contractors to be locked out on day one of the rollout because the sync took 6 hours instead of 5 minutes. The delay completely halted contractor productivity for an entire business day. We learned that identity sync latency must be a core assumption in any authentication workflow migration. Future rollouts must employ a phased, gradual enforcement policy rather than a hard cutover.",
    tags: ["MFA", "Active Directory", "Sync"]
  },
  {
    id: "doc-sso-004",
    title: "Launch Review: CRM Platform Integration",
    type: "launch_review",
    date: "2025-01-20",
    author: "Elena Rostova",
    content: "The CRM integration was delayed by 3 weeks because the vendor's SSO endpoints did not support our specific OIDC claim structure. We had to write a custom claims mapper middleware at the last minute. This middleware introduced unexpected latency into the authentication handshake, leading to sporadic timeout errors during peak login hours. This failure mode was entirely missed during staging because load testing bypassed the SSO login flow. Going forward, integration tests must include the full end-to-end authentication cycle under simulated peak load.",
    tags: ["OIDC", "Vendor", "Claims", "SSO"]
  },
  {
    id: "doc-sso-005",
    title: "Executive Note: Tech Debt in Legacy Auth",
    type: "executive_note",
    date: "2024-05-30",
    author: "VP of Engineering",
    content: "We must prioritize removing the v1 authentication endpoints by end of year. Currently, 15% of our internal microservices still hardcode the v1 auth URLs. Any global identity shift must account for these legacy services before deprecating the endpoints. We have seen repeated instances where partial migrations led to split-brain authentication scenarios, severely complicating our security posture and audit compliance. The migration roadmap must include a strict enforcement deadline, after which any service failing to adopt the new SSO standards will be isolated from the production network.",
    tags: ["Tech Debt", "Authentication", "Legacy"]
  }
];

const paymentDocs: Document[] = [
  {
    id: "doc-pay-001",
    title: "Incident Report: Payment Gateway Timeout Cascade",
    type: "incident_report",
    date: "2024-11-28",
    author: "Kevin Zhang",
    content: "During the Black Friday peak traffic spike, our primary payment gateway began experiencing 500ms latency on the authorization endpoint. Because our checkout service lacked a strict circuit breaker, this latency cascaded backwards, completely exhausting the connection pool to our user database. The resulting delay caused a full checkout system crash lasting 45 minutes, resulting in an estimated $200k in lost revenue. The core failure was allowing external vendor latency to dictate our internal database connection lifecycle. All third-party integrations must enforce aggressive timeouts.",
    tags: ["Payments", "Gateway", "Latency", "Black Friday"]
  },
  {
    id: "doc-pay-002",
    title: "Postmortem: Duplicate Transaction Processing Error",
    type: "postmortem",
    date: "2025-02-14",
    author: "Rachel Green",
    content: "A bug in the client-side retry logic during a network partition caused 1,200 customers to be charged twice for their subscription renewals. The payment gateway processed the initial request, but the response was dropped. The frontend immediately retried without sending the required idempotency key, treating it as a novel transaction. This failure caused severe brand damage and a massive influx of customer support tickets. We are now enforcing strict idempotency validation at the API gateway layer to reject any duplicate payment payloads before they reach the processing queue.",
    tags: ["Payments", "Duplicate", "Idempotency", "Incident"]
  },
  {
    id: "doc-pay-003",
    title: "Retrospective: European Payment Methods Rollout",
    type: "retrospective",
    date: "2024-09-10",
    author: "Liam O'Connor",
    content: "The launch of European localization features, including iDEAL and SEPA direct debit, was delayed by two months due to unforeseen regulatory compliance checks required by the new payment gateway. We assumed our existing PCI-DSS certification would suffice, but the integration required a completely separate data residency audit. This migration risk was completely omitted from the initial project planning phase. When integrating new payment gateways, legal and compliance reviews must occur before any engineering resources are committed to the API integration.",
    tags: ["Payments", "Compliance", "SEPA", "Gateway"]
  },
  {
    id: "doc-pay-004",
    title: "Launch Review: Stripe Webhook Migration",
    type: "launch_review",
    date: "2025-05-01",
    author: "Anita Patel",
    content: "Migrating to the new Stripe webhook architecture resulted in a severe operational lesson regarding asynchronous event processing. We misconfigured the webhook endpoint to perform synchronous database writes. When the payment gateway sent a massive batch of reconciliation events, our API was overwhelmed, leading to dropped webhooks and desynchronized subscription statuses. We had to manually reconcile thousands of accounts. Future payment event processing must strictly decouple receiving the webhook from the actual business logic via a reliable message broker like Kafka or RabbitMQ.",
    tags: ["Payments", "Stripe", "Webhooks", "Migration"]
  },
  {
    id: "doc-pay-005",
    title: "Executive Note: Payment Gateway Redundancy",
    type: "executive_note",
    date: "2025-01-05",
    author: "CFO",
    content: "Last year's outages clearly demonstrated that relying on a single payment gateway is an unacceptable risk to our operational stability. When our provider suffered a DNS failure in October, we were completely incapable of processing transactions for 6 hours. Moving forward, the engineering strategy must include active-active redundancy across at least two distinct payment providers. If one gateway experiences delays or failures, the checkout system must automatically route traffic to the secondary provider without user intervention. This resilience is non-negotiable for the upcoming fiscal year.",
    tags: ["Payments", "Gateway", "Strategy", "Redundancy"]
  }
];

const infraDocs: Document[] = [
  {
    id: "doc-inf-001",
    title: "Postmortem: Kubernetes Cluster Upgrade Failure",
    type: "postmortem",
    date: "2024-10-12",
    author: "Omar Tariq",
    content: "An attempt to migrate our primary Kubernetes cluster from version 1.27 to 1.28 resulted in a massive incident. The upgrade script failed to account for deprecated API versions used by our ingress controllers. As a result, the ingress layer failed to initialize, completely severing external access to the platform for 2 hours. The rollback procedure was similarly flawed because the control plane state had already been mutated. This failure highlights the absolute necessity of performing dry-run upgrades on an identical staging cluster before touching the production environment.",
    tags: ["Kubernetes", "Cluster", "Upgrade", "Downtime"]
  },
  {
    id: "doc-inf-002",
    title: "Incident Report: Cloud Provider Availability Zone Loss",
    type: "incident_report",
    date: "2025-03-22",
    author: "Jessica Lin",
    content: "When AWS us-east-1 experienced a partial degradation in AZ-a, our supposedly highly-available Kubernetes cluster suffered severe delays. We discovered that our pod anti-affinity rules were misconfigured, allowing the scheduler to place the entirety of the authentication service replicas into the failing availability zone. This architectural oversight negated our infrastructure redundancy. The migration risk of moving to a new cloud provider must deeply scrutinize availability zone placement rules. We must implement chaos engineering practices to explicitly terminate infrastructure nodes and verify that the cluster self-heals correctly.",
    tags: ["Infrastructure", "Kubernetes", "AWS", "Availability"]
  },
  {
    id: "doc-inf-003",
    title: "Retrospective: Terraform State Corruption",
    type: "retrospective",
    date: "2024-12-05",
    author: "Sam Jenkins",
    content: "During a routine infrastructure deployment, two CI/CD pipelines ran concurrently without proper state locking, resulting in a corrupted Terraform state file. This delay halted all infrastructure modifications for three days while the state was manually reconstructed from cloud provider APIs. The operational lesson is clear: infrastructure-as-code requires the exact same concurrency controls and strict review processes as application code. We are mandating the use of DynamoDB state locking and enforcing strict sequential deployment queues for all future infrastructure migrations and cluster updates.",
    tags: ["Infrastructure", "Terraform", "CI/CD", "State"]
  },
  {
    id: "doc-inf-004",
    title: "Launch Review: Multi-Region Database Replica Migration",
    type: "launch_review",
    date: "2025-04-18",
    author: "Chloe Adams",
    content: "The migration to a multi-region database topology was fraught with delays due to unexpected cross-region network latency. We anticipated a 20ms delay, but observed spikes up to 150ms during peak load, which broke our synchronous replication guarantees and forced the Kubernetes cluster into a read-only degraded state to prevent data loss. We failed to profile the physical network limitations of our infrastructure before committing to the architecture. Future infrastructure migrations must include extensive physical network profiling before relying on strict latency boundaries.",
    tags: ["Infrastructure", "Database", "Migration", "Latency"]
  },
  {
    id: "doc-inf-005",
    title: "Executive Note: Infrastructure Cost Runaway",
    type: "executive_note",
    date: "2024-07-30",
    author: "VP of Engineering",
    content: "Our transition to a microservices architecture managed by Kubernetes has resulted in a 400% increase in infrastructure costs over the last two quarters. Teams are over-provisioning cluster resources out of fear of downtime, leading to incredibly poor resource utilization. We must urgently migrate our workloads to utilize auto-scaling node pools and enforce strict CPU and memory requests/limits across all deployments. This financial incident proves that adopting scalable infrastructure without implementing proper governance and cost-visibility tools is a recipe for catastrophic budget overruns.",
    tags: ["Infrastructure", "Kubernetes", "Cost", "Strategy"]
  }
];

const crmDocs: Document[] = [
  {
    id: "doc-crm-001",
    title: "Postmortem: Salesforce Data Sync Collision",
    type: "postmortem",
    date: "2024-11-15",
    author: "Maria Gonzalez",
    content: "During the initial phase of our CRM migration to Salesforce, a massive data sync collision occurred. The legacy CRM and the new Salesforce instance were operating in a bi-directional sync mode. A race condition emerged where updates to customer records in both systems overwrote each other, corrupting 12,000 lead profiles. The migration was delayed by a full month to restore from backups. This failure demonstrates that bi-directional syncs during migrations are inherently dangerous. We must enforce a strict one-way data flow and read-only phases during CRM transitions.",
    tags: ["CRM", "Salesforce", "Migration", "Data Loss"]
  },
  {
    id: "doc-crm-002",
    title: "Incident Report: API Rate Limit Exhaustion",
    type: "incident_report",
    date: "2025-02-10",
    author: "Tom Baker",
    content: "Our marketing automation tool triggered a massive campaign that resulted in a sudden flood of updates to our Salesforce CRM. We exhausted our daily Salesforce API rate limit within 45 minutes. This incident caused a complete halt in lead routing for the entire sales team, directly impacting quarter-end revenue. The operational lesson is that CRM integrations must employ robust queueing, batching, and rate-limit awareness. We cannot allow internal spikes in activity to inadvertently DDoS our critical CRM infrastructure and disrupt the sales pipeline.",
    tags: ["CRM", "Salesforce", "API", "Rate Limits"]
  },
  {
    id: "doc-crm-003",
    title: "Retrospective: Custom Field Schema Mismatch",
    type: "retrospective",
    date: "2024-08-22",
    author: "Diana Prince",
    content: "The effort to migrate our legacy support ticketing system into the main CRM platform suffered significant delays due to severe custom field schema mismatches. The engineering team assumed that mapping text fields would be trivial, but failed to account for strict validation rules and character limits imposed by the new CRM. As a result, thousands of historical tickets failed to import, throwing cryptic validation errors. Future CRM migrations must begin with a comprehensive data schema audit and strict validation testing on a full sandbox environment.",
    tags: ["CRM", "Schema", "Migration", "Delay"]
  },
  {
    id: "doc-crm-004",
    title: "Launch Review: CRM Single Sign-On Integration",
    type: "launch_review",
    date: "2025-01-30",
    author: "Bruce Wayne",
    content: "Integrating our corporate identity provider with the new Salesforce CRM proved much more difficult than anticipated. The migration risk was underestimated because we assumed standard SAML support would work out of the box. However, complex role-mapping requirements meant that users were frequently provisioned with incorrect access levels, allowing junior SDRs to view executive dashboards. This security incident forced an immediate rollback of the CRM rollout. We learned that identity role mapping must be exhaustively tested with real-world user personas before launching any enterprise CRM.",
    tags: ["CRM", "Salesforce", "Security", "Access"]
  },
  {
    id: "doc-crm-005",
    title: "Executive Note: CRM Consolidation Strategy",
    type: "executive_note",
    date: "2024-12-10",
    author: "Chief Revenue Officer",
    content: "Having our sales team on Salesforce, marketing on Hubspot, and support on Zendesk is creating an unmanageable fragmentation of customer data. We lack a unified view of the customer journey, leading to embarrassing interactions where sales reps are unaware of critical support escalations. We are initiating a massive architectural review to consolidate these platforms into a single unified CRM ecosystem. This migration will be extremely painful, but the ongoing cost of fragmented intelligence is far greater. All departments must prepare for upcoming workflow disruptions.",
    tags: ["CRM", "Salesforce", "Strategy", "Consolidation"]
  }
];

const dataDocs: Document[] = [
  {
    id: "doc-dat-001",
    title: "Postmortem: Snowflake Warehouse Cost Spike",
    type: "postmortem",
    date: "2024-09-05",
    author: "Alan Turing",
    content: "A poorly optimized dbt transformation model was deployed to production without a review of its materialization strategy. It performed massive cross-joins on our largest event tables, keeping the largest Snowflake warehouse active for 72 continuous hours over the weekend. This incident resulted in an unexpected $45,000 compute bill. The operational lesson is that our data platform lacks sufficient CI/CD guardrails. We must implement automated query profiling and enforce strict timeout limits on all warehouse compute clusters to prevent runaway costs during data transformations.",
    tags: ["Data Platform", "Snowflake", "Cost", "Incident"]
  },
  {
    id: "doc-dat-002",
    title: "Incident Report: Real-time Pipeline Kafka Failure",
    type: "incident_report",
    date: "2025-01-12",
    author: "Grace Hopper",
    content: "During a major marketing push, our Kafka event streaming cluster ran out of disk space due to an aggressive retention policy combined with a massive spike in user telemetry. The cluster crashed, leading to the irreversible loss of 4 hours of critical user behavior data. The downstream data platform dashboards went completely blank, causing panic across the executive team. The migration risk of moving to real-time pipelines is the fragility of the broker storage. We must implement proactive disk monitoring and auto-scaling volume expansions for our data infrastructure.",
    tags: ["Data Platform", "Kafka", "Streaming", "Data Loss"]
  },
  {
    id: "doc-dat-003",
    title: "Retrospective: Migration to Delta Lake",
    type: "retrospective",
    date: "2024-11-20",
    author: "Ada Lovelace",
    content: "The migration of our legacy Hadoop data lake to a modern Delta Lake architecture on cloud storage experienced significant delays. We underestimated the complexity of rewriting thousands of legacy PySpark jobs to conform to the new ACID transactional requirements. Data engineers were bottlenecked for months attempting to reverse-engineer undocumented legacy transformations. This review highlights that technology migrations in the data platform space are almost entirely constrained by the quality of the legacy code. Future upgrades must include a dedicated phase for legacy code documentation and refactoring.",
    tags: ["Data Platform", "Migration", "Delta Lake", "Delay"]
  },
  {
    id: "doc-dat-004",
    title: "Launch Review: Self-Service Analytics Portal",
    type: "launch_review",
    date: "2025-03-15",
    author: "John von Neumann",
    content: "The launch of our new self-service Tableau analytics portal was considered a failure. Business users found the raw data models far too complex and the semantic layer was entirely unintuitive. Consequently, users reverted to exporting CSVs to Excel, completely undermining the millions invested in the data platform upgrade. The operational lesson is that exposing raw infrastructure to business stakeholders without a carefully designed, user-friendly semantic layer is useless. We must pivot our strategy to focus intensely on data modeling and user education.",
    tags: ["Data Platform", "Analytics", "Review", "Strategy"]
  },
  {
    id: "doc-dat-005",
    title: "Executive Note: Data Governance and GDPR",
    type: "executive_note",
    date: "2024-06-18",
    author: "Chief Data Officer",
    content: "Our recent external audit revealed terrifying gaps in our data platform's compliance posture. PII is scattered across undocumented S3 buckets and we currently lack the ability to effectively execute GDPR Right to be Forgotten requests across our disparate data warehouses. We must immediately halt all new feature development on the data platform and pivot the entire organization to implementing strict data catalogs, access controls, and automated PII redaction pipelines. Failure to address this migration risk could result in catastrophic regulatory fines.",
    tags: ["Data Platform", "Governance", "GDPR", "Compliance"]
  }
];

const productDocs: Document[] = [
  {
    id: "doc-prd-001",
    title: "Postmortem: Mobile App V3 Launch Crash",
    type: "postmortem",
    date: "2024-10-02",
    author: "Steve Rogers",
    content: "The highly anticipated launch of Mobile App V3 was a disaster. Within minutes of the app store rollout, our backend API was hammered with a new polling mechanism introduced by the mobile team, effectively DDoS-ing our own servers. The incident caused a total platform outage. The failure stemmed from a complete lack of cross-functional review between the mobile developers and the backend infrastructure team. The launch review concluded that we must mandate architectural reviews and strict API load testing for any major product launches going forward.",
    tags: ["Product Launch", "Mobile", "Outage", "API"]
  },
  {
    id: "doc-prd-002",
    title: "Incident Report: Feature Flag Misconfiguration",
    type: "incident_report",
    date: "2025-02-28",
    author: "Natasha Romanoff",
    content: "A critical new billing feature was accidentally enabled globally due to a typographical error in our feature flag management console. This launched an untested, beta product to all enterprise clients simultaneously, causing massive confusion and several broken workflows. The delay in rolling back the flag (took 45 minutes to propagate) exacerbated the failure. Operational lesson: feature flags are as dangerous as direct code deployments. We must implement strict peer review and deployment pipelines for feature flag toggles, treating them as high-risk infrastructure changes.",
    tags: ["Product Launch", "Feature Flag", "Incident", "Risk"]
  },
  {
    id: "doc-prd-003",
    title: "Retrospective: Global Expansion Launch Delay",
    type: "retrospective",
    date: "2024-11-12",
    author: "Tony Stark",
    content: "Our product launch into the APAC region was delayed by four months because we failed to realize our core database schema did not support multi-byte characters required for Japanese and Korean localization. The engineering effort to migrate the entire database schema to UTF-8mb4 was immense and risky. This retrospective emphasizes that product launch strategies must involve deep technical validation of underlying assumptions during the ideation phase, rather than discovering fundamental database limitations weeks before the scheduled release date.",
    tags: ["Product Launch", "Localization", "Delay", "Database"]
  },
  {
    id: "doc-prd-004",
    title: "Launch Review: AI Chatbot Assistant",
    type: "launch_review",
    date: "2025-05-10",
    author: "Bruce Banner",
    content: "The launch of our new AI-powered support chatbot resulted in a severe brand incident. The model was susceptible to basic prompt injection attacks, allowing users to extract sensitive system prompts and manipulate the bot into offering fake discounts. The migration risk of adopting generative AI was poorly understood by the product team. The operational lesson is that AI features cannot be launched using traditional software QA processes; they require dedicated red-teaming and adversarial testing environments to guarantee safety and compliance before reaching production.",
    tags: ["Product Launch", "AI", "Security", "Review"]
  },
  {
    id: "doc-prd-005",
    title: "Executive Note: Streamlining Product Releases",
    type: "executive_note",
    date: "2024-08-05",
    author: "Chief Product Officer",
    content: "Our current product launch cadence is unacceptably slow. The process is bogged down by weeks of manual regression testing and bureaucratic approval gates. We are losing ground to competitors because our migration to an agile delivery model was only half-completed. We must immediately invest in automated end-to-end testing frameworks and shift to a continuous delivery mindset. Product managers must be empowered to release small, iterative updates rather than holding back critical value for massive, risky, 'big bang' product launches that inevitably fail.",
    tags: ["Product Launch", "Strategy", "Agile", "Delivery"]
  }
];

const securityDocs: Document[] = [
  {
    id: "doc-sec-001",
    title: "Postmortem: S3 Bucket Data Exposure",
    type: "postmortem",
    date: "2024-09-22",
    author: "Alice Smith",
    content: "A misconfigured Terraform script inadvertently changed the permissions of a critical S3 bucket, exposing internal company documents to the public internet for 14 hours. The incident was only discovered via a third-party security researcher. This failure demonstrated that our infrastructure migration lacked automated continuous compliance scanning. The operational lesson is absolute: we must deploy tools like AWS Macie and integrate strict policy-as-code checks into our CI/CD pipelines to instantly block any deployment that attempts to create public storage resources.",
    tags: ["Security", "Incident", "AWS", "Exposure"]
  },
  {
    id: "doc-sec-002",
    title: "Incident Report: Phishing Attack Compromise",
    type: "incident_report",
    date: "2025-01-05",
    author: "Bob Jones",
    content: "A highly targeted spear-phishing attack successfully compromised the credentials of three senior engineers. Because these engineers had standing, permanent admin access to production systems, the attackers were able to pivot and access the customer database. The delay in detecting this breach was unacceptable. This incident violently highlights the necessity of migrating to a Zero Trust architecture. We are immediately revoking all standing privileges and implementing Just-In-Time (JIT) access protocols, requiring cryptographic MFA and explicit approval for all production access.",
    tags: ["Security", "Phishing", "Zero Trust", "Incident"]
  },
  {
    id: "doc-sec-003",
    title: "Retrospective: Annual Penetration Test Results",
    type: "retrospective",
    date: "2024-11-30",
    author: "Charlie Brown",
    content: "The results of our annual third-party penetration test were deeply concerning. The auditors discovered multiple critical vulnerabilities in our legacy API endpoints, specifically related to Insecure Direct Object References (IDOR). The effort to migrate these legacy APIs to our modern, secure framework has been repeatedly delayed in favor of shipping new features. This review mandates that security tech debt can no longer be ignored. We are dedicating 20% of all future engineering sprint capacity exclusively to remediating security vulnerabilities and deprecating legacy code.",
    tags: ["Security", "Penetration Test", "Review", "Tech Debt"]
  },
  {
    id: "doc-sec-004",
    title: "Launch Review: WAF Deployment",
    type: "launch_review",
    date: "2025-04-02",
    author: "Diana Davis",
    content: "The deployment of our new Web Application Firewall (WAF) to protect against DDoS attacks was a partial failure. We deployed the WAF in strict blocking mode without sufficient baseline tuning. It immediately began dropping legitimate API traffic from our largest enterprise clients, causing a severe operational incident. The migration risk of implementing aggressive security controls is the impact on availability. Going forward, all new security appliances must be deployed in monitoring-only mode for at least two weeks to accurately profile traffic before enabling active blocking.",
    tags: ["Security", "WAF", "Downtime", "Review"]
  },
  {
    id: "doc-sec-005",
    title: "Executive Note: Ransomware Preparedness",
    type: "executive_note",
    date: "2024-07-15",
    author: "CISO",
    content: "Recent attacks on our industry peers have escalated the threat of ransomware to an existential level. Our current disaster recovery strategy relies on backups that are stored on the same network domain as our primary infrastructure, meaning a sophisticated attack could encrypt our backups as well. We must urgently migrate our backup architecture to immutable, air-gapped storage. This is a top corporate priority. The board is demanding a full tabletop simulation of a catastrophic ransomware incident by the end of Q3.",
    tags: ["Security", "Ransomware", "Strategy", "Backups"]
  }
];

const strategyDocs: Document[] = [
  {
    id: "doc-str-001",
    title: "Postmortem: Failed Cloud Cost Optimization Initiative",
    type: "postmortem",
    date: "2024-12-01",
    author: "Eve Adams",
    content: "Our aggressive Q3 strategy to slash cloud infrastructure costs by 30% resulted in a catastrophic failure. Engineering teams, pressured to meet the targets, downsized critical database instances without adequately profiling peak load. The resulting CPU exhaustion caused massive latency and timeouts across the platform during a major sales event. The operational lesson is that cost optimization cannot be pursued as a blunt mandate without rigorous engineering analysis. Strategy must balance financial goals with strict service level objectives (SLOs) to ensure reliability is never compromised.",
    tags: ["Strategy", "Cost", "Incident", "Reliability"]
  },
  {
    id: "doc-str-002",
    title: "Incident Report: Vendor Lock-in Crisis",
    type: "incident_report",
    date: "2025-03-10",
    author: "Frank Castle",
    content: "Our strategic decision to heavily utilize proprietary serverless functions has led to a severe crisis. The vendor suddenly announced a 40% price increase and deprecated several runtime environments we rely on. The delay in migrating away from these proprietary services will be massive, as our business logic is tightly coupled to their specific APIs. This incident proves that architectural strategy must prioritize portability and open standards. We are initiating a massive engineering effort to containerize all workloads and abstract away cloud-provider-specific implementations.",
    tags: ["Strategy", "Vendor Lock-in", "Migration", "Architecture"]
  },
  {
    id: "doc-str-003",
    title: "Retrospective: Remote Work Tooling Rollout",
    type: "retrospective",
    date: "2024-08-20",
    author: "Grace Shelby",
    content: "The strategy to mandate a new suite of unified collaboration tools across the enterprise faced immense pushback and delays. The rollout was managed entirely top-down without consulting the actual engineering and design teams about their workflow requirements. As a result, productivity plummeted, and teams actively circumvented the new tools, creating shadow IT. The operational lesson is that enterprise strategy cannot ignore user experience and deeply ingrained workflows. Successful tool migrations require bottom-up champions and phased adoption, not executive mandates.",
    tags: ["Strategy", "Remote Work", "Review", "Culture"]
  },
  {
    id: "doc-str-004",
    title: "Launch Review: Enterprise Tier Pricing Model",
    type: "launch_review",
    date: "2025-02-05",
    author: "Hank Pym",
    content: "The launch of our new Enterprise pricing tier was technically successful but a strategic failure. We failed to anticipate the complexity of migrating existing mid-market customers into the new tier. The billing system lacked automated prorating for mid-cycle upgrades, leading to thousands of manual invoice adjustments and massive customer frustration. This highlights a critical migration risk: product strategy often overlooks the operational burden of transitioning the legacy user base. Billing architecture must be radically simplified before any future pricing model changes.",
    tags: ["Strategy", "Pricing", "Review", "Billing"]
  },
  {
    id: "doc-str-005",
    title: "Executive Note: AI Transformation Initiative",
    type: "executive_note",
    date: "2025-04-15",
    author: "CEO",
    content: "Our strategy to embed Artificial Intelligence into every layer of our product is moving too slowly. We are paralyzed by fear of hallucinations and compliance risks, allowing our competitors to outpace us. We must pivot our engineering culture to accept measured risks. I am mandating the immediate creation of a dedicated AI Tiger Team, completely exempt from standard bureaucratic deployment gates, tasked with rapidly prototyping and launching AI features. The risk of inaction and obsolescence is now far greater than the risk of an imperfect launch.",
    tags: ["Strategy", "AI", "Executive", "Vision"]
  }
];

const platformOpsDocs: Document[] = [
  {
    id: "doc-ops-001",
    title: "Postmortem: Node.js Runtime Upgrade Broke Production Build",
    type: "postmortem",
    date: "2025-06-03",
    author: "Platform Engineering",
    content: "The upgrade from Node.js 18 to Node.js 22 broke the production build because one workspace package relied on transitive CommonJS behavior that changed under the newer runtime. The failure was missed locally because developers had different Node versions and stale node_modules folders. The deployment was blocked for two days while lockfiles were regenerated and engines were pinned. Future Node.js upgrades must include a checked-in .nvmrc, explicit package.json engines, CI validation on a clean install, and a dry-run build for every workspace.",
    tags: ["Node.js", "Runtime", "Build", "Workspace"]
  },
  {
    id: "doc-ops-002",
    title: "Incident Report: NPM Workspace Dev Script Deadlock",
    type: "incident_report",
    date: "2025-05-18",
    author: "Developer Experience",
    content: "A monorepo dev command attempted to run watch scripts in every workspace. The shared package watch process never exited, so backend and frontend dev servers were not started consistently. Engineers assumed the app was broken when the issue was actually script orchestration. The fix was to split backend and frontend commands clearly and avoid running long-lived watch processes across all workspaces unless a process manager is present.",
    tags: ["Node.js", "NPM", "Workspace", "Developer Experience"]
  },
  {
    id: "doc-ops-003",
    title: "Launch Review: Login Page and Entra ID Pilot",
    type: "launch_review",
    date: "2025-07-14",
    author: "Identity Platform",
    content: "The first login page pilot used Microsoft Entra ID but failed accessibility and redirect testing. Deep links returned users to the dashboard instead of their requested decision page, and keyboard focus was lost after MFA. The rollout succeeded only after we added route preservation, visible focus states, fallback local demo mode, and clear tenant configuration. Any login launch must validate redirect URI settings, MFA behavior, session expiry, and emergency local access.",
    tags: ["Login", "Entra ID", "Authentication", "Accessibility"]
  },
  {
    id: "doc-ops-004",
    title: "Retrospective: Microsoft Teams Approval Workflow Noise",
    type: "retrospective",
    date: "2025-04-08",
    author: "Engineering Operations",
    content: "Posting every risk simulation into Microsoft Teams created alert fatigue. Important approval decisions were buried under verbose cards and repeated test messages. The team restored usefulness by limiting notifications to decision summaries, linking back to the full dashboard, and using dedicated channels for high-severity simulations. Teams integrations must be concise, actionable, and routed to the correct audience.",
    tags: ["Teams", "Notifications", "Approval", "Workflow"]
  },
  {
    id: "doc-ops-005",
    title: "Security Review: Copilot Studio Custom Connector",
    type: "retrospective",
    date: "2025-08-21",
    author: "AI Governance",
    content: "A Copilot Studio custom connector exposed too much internal simulation detail to broad tenant users. The security review required response minimization, bearer token validation, tenant scoping, and audit logging before production approval. Copilot integrations should return executive summaries by default and require explicit authorization before exposing evidence excerpts or internal incident content.",
    tags: ["Copilot", "AI", "Connector", "Governance"]
  },
  {
    id: "doc-ops-006",
    title: "Incident Report: ShareChat Launch Message Mismatch",
    type: "incident_report",
    date: "2025-09-02",
    author: "Community Operations",
    content: "A product update posted to a ShareChat community channel used internal engineering terminology and confused external users. Support volume increased because the summary lacked localized context, owner information, and a clear next step. Future ShareChat or community-channel integrations must tailor summaries for the audience, include a link to public-safe details, and avoid publishing internal risk language without review.",
    tags: ["ShareChat", "Community", "Localization", "Communications"]
  }
];

export const allDocuments: Document[] = [
  ...ssoDocs,
  ...paymentDocs,
  ...infraDocs,
  ...crmDocs,
  ...dataDocs,
  ...productDocs,
  ...securityDocs,
  ...strategyDocs,
  ...platformOpsDocs
];

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
