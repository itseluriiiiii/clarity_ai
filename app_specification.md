# Critical Thinking & Misinformation App - Specification

## 1. UI / Front-end Design

### General Design Language
- **Theme:** "Clarity & Focus"
- **Colors:**
    - **Primary:** Deep Indigo (`#4F46E5`) - Represents trust and intelligence.
    - **Secondary:** Teal (`#14B8A6`) - Represents calm and verification.
    - **Background:** Off-white/Paper (`#F9FAFB`) for day mode, Deep Slate (`#0F172A`) for night mode.
    - **Alerts:**
        - **High Credibility:** Green (`#10B981`)
        - **Caution/Bias:** Amber (`#F59E0B`)
        - **Misinformation/Danger:** Rose (`#E11D48`)
- **Typography:** Inter or Roboto (Clean, highly readable sans-serif).
- **Icons:** Feather Icons or Heroicons (Simple, outlined).

---

### Screen 1: Home Screen (Dashboard)
**Layout:**
- **Header:** User greeting + "Cognitive State" summary (e.g., "Sharp", "Relaxed").
- **Main Action Area:** Large central card or button for "Quick Scan" (Paste Link/Text).
- **Recent Activity:** Scrollable list of recently scanned articles/posts with score badges.
- **Daily Challenge:** A card prompting the daily training module.
- **Bottom Navigation:** Home, Scanner, Training, Profile/Settings.

**Components:**
- `StatusCard`: Shows current streak or cognitive score.
- `ScanButton`: Large, prominent floating action button (FAB) or central card.
- `ActivityFeed`: List items with icon, title, timestamp, and color-coded score strip.

**Microcopy:**
- *Scan Button:* "Analyze Content" or "Check Credibility"
- *Helper Text:* "Paste a link or text to detect bias."

**User Flow:**
- Open App -> View Dashboard -> Tap "Analyze Content" -> Go to Scanner Screen.

---

### Screen 2: Credibility Scanner Screen
**Layout:**
- **Input Area:** Text box for pasting URL or raw text.
- **Action Button:** "Run Analysis".
- **Results View (Post-Analysis):**
    - **Score Gauge:** Circular progress bar showing 0-100 Credibility Score.
    - **Key Metrics:** Row of icons for Emotion, Bias, Fallacies.
    - **Summary Card:** AI-generated summary of the content.
    - **Detailed Breakdown:** Expandable accordions for specific issues found.

**Components:**
- `InputBox`: Multi-line text area with paste button.
- `ScoreGauge`: Visual indicator of the score (Green/Yellow/Red).
- `MetricBadge`: Small pill-shaped badges for specific detected attributes (e.g., "High Emotion", "Ad Hominem").

**Microcopy:**
- *Input Placeholder:* "Paste article URL or text here..."
- *Button:* "Analyze"
- *Loading State:* "Scanning for cognitive distortions..."

---

### Screen 3: Bias Detector Screen (Detail View)
**Layout:**
- **Header:** Title of the analyzed content.
- **Highlighted Text:** The original text with color-coded highlights corresponding to biases.
- **Sidebar/Overlay:** Tapping a highlight opens a card explaining the bias.
- **Bias List:** A list below the text summarizing all detected biases.

**Components:**
- `TextHighlighter`: Renders text with `<span>` backgrounds based on bias type.
- `BiasCard`: Modal or bottom sheet explaining the specific bias (e.g., "Confirmation Bias: This text cherry-picks facts...").

**User Flow:**
- From Scanner Results -> Tap "View Bias Details" -> See highlighted text -> Tap highlight -> Read explanation.

---

### Screen 4: Think Slow Mode Screen
**Layout:**
- **Trigger:** Automatically appears or suggested when content is "High Risk" or "High Emotion".
- **Visuals:** Calming background color (Soft Blue/Grey).
- **Content:**
    - "Stop & Reflect" animation (breathing exercise).
    - **Prompt:** "This content is highly emotionally charged. Let's pause."
    - **Guiding Questions:** "What is the author's intent?", "Are there alternative explanations?"
- **Action:** "I'm ready to proceed" button (unlocks the content or analysis).

**Components:**
- `BreathingAnimation`: Simple expanding/contracting circle.
- `ReflectionPrompt`: Card with a single probing question.

**Microcopy:**
- *Title:* "Think Slow"
- *Button:* "Continue to Analysis"

---

### Screen 5: Training Modules Screen
**Layout:**
- **Grid/List:** Categories of training (e.g., "Logical Fallacies", "Media Literacy", "Emotional Regulation").
- **Progress Bars:** Visual indicators of completion for each category.
- **Featured Module:** "Daily Workout" card.

**Components:**
- `ModuleCard`: Title, Icon, Progress Bar.
- `GamificationBadge`: "Level 5 Critical Thinker".

**User Flow:**
- Tap "Training" tab -> Select Module -> Enter Quiz Interface.

---

### Screen 6: Settings Screen
**Layout:**
- **Profile:** User avatar, name, stats.
- **Preferences:**
    - "Auto-detect clipboard links" (Toggle).
    - "Think Slow Mode Sensitivity" (Slider: Low/Med/High).
    - "Notifications" (Daily reminders).
- **About:** Version, Privacy Policy.

**Components:**
- `ToggleSwitch`: Standard UI toggle.
- `Slider`: Range slider for sensitivity.

---

## 2. AI Backend Workflow

### Architecture
- **Stack:** Node.js (Express) or Python (FastAPI).
- **LLM Integration:** OpenAI API (GPT-4o or GPT-3.5-turbo) or Anthropic Claude.
- **Database:** PostgreSQL (User data, history) + Redis (Rate limiting, caching).

### Workflow Steps
1.  **Input Reception:**
    - API Endpoint: `POST /api/analyze`
    - Body: `{ "text": "...", "url": "..." }`
    - If URL is provided, backend scrapes content (using Puppeteer or Cheerio) to extract main text.

2.  **Preprocessing:**
    - Clean text (remove HTML tags, excessive whitespace).
    - Truncate if exceeding token limits (e.g., > 4000 words).

3.  **LLM Prompting:**
    - **System Prompt:** "You are an expert cognitive scientist and fact-checker. Analyze the following text for emotional intensity, logical fallacies, cognitive distortions, and potential misinformation. Provide a structured JSON response."
    - **User Prompt:** [Insert Text Here]

4.  **Analysis Categories:**
    - **Emotional Intensity:** Sentiment analysis (VADER or LLM-based).
    - **Misinformation Patterns:** Checks against known conspiracy theories, pseudoscience keywords, or lack of citations.
    - **Cognitive Distortions:** Identifies "All-or-nothing thinking", "Catastrophizing", "Ad Hominem", etc.
    - **Source Credibility:** (If URL) Checks domain against a whitelist/blacklist of known reliable/unreliable sources.

5.  **Output Generation:**
    - Returns structured JSON to the frontend.

### JSON Output Structure
```json
{
  "misinformation_score": 15, // 0-100 (Lower is better/safer)
  "credibility_rating": "High", // High, Medium, Low
  "emotional_intensity": "Low", // Low, Medium, High
  "summary": "The article discusses the benefits of meditation with cited sources.",
  "biases": [
    {
      "type": "Generalization",
      "text_snippet": "Everyone knows that...",
      "explanation": "This is a sweeping generalization without evidence."
    }
  ],
  "recommendations": [
    "Verify the study mentioned in paragraph 2.",
    "Consider the author's potential conflict of interest."
  ]
}
```

---

## 3. Scoring + Bias Detection Logic

### Scoring Formula
The **Credibility Score** (0-100) is calculated inversely to the risk factors. Start at 100 and deduct points.

**Base Score:** 100

**Deductions:**
1.  **Emotional Language:**
    - High Intensity: -15 points
    - Medium Intensity: -5 points
2.  **Logical Fallacies:**
    - Per major fallacy (e.g., Ad Hominem, Strawman): -10 points
    - Per minor fallacy (e.g., Slippery Slope): -5 points
3.  **Source Reliability (if URL):**
    - Unknown Domain: -10 points
    - Known Biased Domain: -30 points
    - Unverified Claims: -10 points per major claim without citation.
4.  **Cognitive Distortions:**
    - -5 points per distinct distortion type detected.

**Thresholds:**
- **Green (High Credibility):** 80 - 100
- **Yellow (Caution):** 50 - 79
- **Red (High Risk/Misinformation):** 0 - 49

### Bias Categories & Detection Rules
1.  **Emotional Manipulation:**
    - *Trigger Words:* "Shocking", "Destroyed", "Humiliated", "Secret", "They don't want you to know".
    - *Rule:* If > 3 trigger words in title/intro -> Flag as "Clickbait/High Emotion".

2.  **Confirmation Bias:**
    - *Pattern:* Text only presents evidence supporting one side of a controversial topic without acknowledging counter-arguments.
    - *Rule:* LLM prompt to "List counter-arguments mentioned". If none -> Flag "One-sided".

3.  **Catastrophizing:**
    - *Pattern:* Predicting worst-case scenarios.
    - *Keywords:* "End of the world", "Disaster", "Collapse", "Inevitable doom".

4.  **Ad Hominem:**
    - *Pattern:* Attacking the person rather than the argument.
    - *Rule:* Detect personal insults directed at individuals or groups.

### Think Slow Mode Triggers
- **Condition A:** Credibility Score < 50.
- **Condition B:** Emotional Intensity = "High".
- **Condition C:** > 3 Logical Fallacies detected.
- **Action:** If any condition is met, the "Think Slow" screen intercepts the results.

---

## 4. CBT / Critical Thinking Training Modules

### Gamification Strategy
- **Points System:** Earn "Cognitive Points" (CP) for completing modules and daily scans.
- **Streaks:** Daily engagement multiplier.
- **Badges:** "Bias Buster", "Logic Master", "Zen Mind".

### Module 1: "Spot the Bias" (Mini-Quiz)
- **Purpose:** Train users to identify specific biases in short text snippets.
- **Interaction:** Tinder-style swipe (Left = Unbiased, Right = Biased) or Multiple Choice.
- **Example Question:**
    - *Text:* "Only a fool would believe the government's lies about the economy."
    - *Question:* "What logical fallacy is present here?"
    - *Options:* A) Strawman, B) Ad Hominem, C) False Dilemma.
    - *Correct Answer:* B) Ad Hominem (Attacking the believer rather than the argument).

### Module 2: "Daily Cognitive Exercise"
- **Purpose:** Daily calibration of critical thinking.
- **Interaction:** A short 3-question set based on current events (anonymized).
- **Example:**
    - *Scenario:* "You read a headline: 'Scientists PROVE chocolate cures cancer!'"
    - *Action:* "What is your first step?"
    - *Correct Choice:* "Check the original study sample size and funding."

### Module 3: "Distortion Explainer Cards"
- **Purpose:** Educational reference.
- **Format:** Flashcards with a definition on front, example on back.
- **Content:**
    - *Front:* "Black-and-White Thinking"
    - *Back:* "Viewing a situation as only good or bad, with no middle ground. Example: 'If I don't get an A, I'm a total failure.'"

---

## 5. Final Output Format & Deliverables

### Developer Handoff
- **Figma/Sketch File:** Containing all screens (Home, Scanner, Results, Training, Settings).
- **Asset Folder:** Icons (SVG), Fonts (Inter/Roboto), Color Palette (HEX/RGB).
- **API Spec (Swagger/OpenAPI):**
    - `POST /analyze`
    - `GET /user/stats`
    - `GET /modules`
- **Prompt Engineering Guide:** A document containing the system prompts used for the LLM to ensure consistent persona and output format.

### Future Roadmap
- **Browser Extension:** To analyze web pages directly on desktop.
- **Social Media Overlay:** Android Accessibility Service to overlay "Credibility Dots" on Twitter/Reddit apps.
- **Community Fact-Checking:** Allow trusted users to manually review flagged content.


