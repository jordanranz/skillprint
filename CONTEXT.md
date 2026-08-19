# Skillprint

Skillprint is a product for discovering agent skills and understanding their internal workflows through interactive visual representations.

## Language

**Skillprint**:
The product that presents a ranked catalog of agent skills and explains how they operate.
_Avoid_: Skill Atlas

**Skill Explorer**:
The catalog interface within Skillprint where people browse and select skills.
_Avoid_: Skill directory, marketplace

**skillprint**:
An interactive visual representation of how one agent skill operates.
_Avoid_: Diagram, skill visualization

**agent skill**:
A packaged set of instructions that guides an AI agent through a specialized workflow.
_Avoid_: Plugin, prompt

**skill consumer**:
A person discovering agent skills they may want to use.
_Avoid_: Customer, developer, user

**recorded install count**:
The hourly-deduplicated skill installation total reported by the skills CLI to skills.sh. It is a partial telemetry measure rather than universal downloads or actual usage.
_Avoid_: Download count, usage, popularity score

**all-time ranking**:
The ordering of eligible skills by their cumulative recorded install count at a stated snapshot time.
_Avoid_: Most used, most downloaded, trending

**eligible skill**:
A non-duplicate skills.sh entry whose public source and instructions are available to produce the complete Skill Explorer experience.
_Avoid_: Ranked entry, listing

**ranking snapshot**:
A timestamped capture of eligible skills and their all-time recorded install counts used to render a deterministic ranking.
_Avoid_: Live ranking, leaderboard cache

**Scouter Score**:
Skillprint's 0–10,000 assessment of an agent skill's guidance, efficiency, coverage, and practical value.
_Avoid_: Power, Power level, Skill score

**score**:
The compact interface label for a Scouter Score when space is constrained.
_Avoid_: Power

**scouted**:
An agent skill whose source has been inspected and assigned an evidence-backed Scouter Score.
_Avoid_: Audited, reviewed

**not scouted**:
An agent skill with a metadata-derived skillprint but no evidence-backed Scouter Score.
_Avoid_: Not inspected, unscouted

**scout report**:
The evidence and assessment breakdown supporting a Scouter Score.
_Avoid_: Power profile, scorecard

**primary category**:
The single stable domain assigned to an agent skill according to its principal user outcome.
_Avoid_: Type, vertical, multiple categories

**functional tag**:
A controlled verb describing a capability an agent skill performs, such as create, review, or deploy.
_Avoid_: Category, status, source topic

**source topic**:
A descriptive topic declared by a skill source and preserved separately from Skillprint's controlled functional tags.
_Avoid_: Functional tag, primary category

**classification provenance**:
The recorded origin of a primary-category assignment: declared, rule-derived, LLM-assessed, or reviewed.
_Avoid_: Audit status, source
