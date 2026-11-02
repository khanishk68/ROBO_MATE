// src/lib/curriculum-month1-khanishk.ts
// =============================================================================
// ROBO MATES — KHANISHK — MONTH 1 STUDY PLAN (AUTHORITATIVE SOURCE OF TRUTH)
// Robotics Engineering Foundation | 8 November – 7 December 2026
// Extracted directly from official Month 1 Curriculum Document
// =============================================================================

export interface Month1DayPlan {
  dayNumber: number; // 1 to 30
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Sunday, Monday, etc.
  weekNumber: number; // 1 to 4
  type: "LEARNING" | "WEEKLY ASSESSMENT" | "REST / REVIEW" | "PROJECT";
  hours: number;
  topic: string;
  study: string;
  do: string;
  save: string;
  checklistItems: {
    id: string;
    text: string;
  }[];
}

export interface EquipmentItem {
  item: string;
  category: "already_available" | "required_to_obtain" | "optional" | "not_this_month";
  needNow: string;
  purpose: string;
  estimatedCost: string;
}

export interface StudyResourceItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  url: string;
  type: "documentation" | "interactive_course" | "book" | "practice";
  relevantTopics: string;
}

export interface ProjectMilestoneItem {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  criteria: string[];
}

export interface TestCaseItem {
  id: string;
  title: string;
  inputDescription: string;
  expectedBehavior: string;
}

// -----------------------------------------------------------------------------
// 1. MONTH 1 METADATA
// -----------------------------------------------------------------------------
export const MONTH_1_METADATA = {
  monthNumber: 1,
  title: "Robotics Engineering Foundation (Python, Git & Linux)",
  subtitle: "Deliberately software-first; ₹0 expensive robotics hardware required yet.",
  startDate: "2026-11-08",
  endDate: "2026-12-07",
  totalDays: 30,
  plannedHours: 110,
  target:
    "Build strong beginner foundations in Python, Git and Linux. Finish with a working command-line Robot Mission Logger v1.",
  dailyCommitment:
    "Approximately 4–5 hours on study days: 60 min learning, 60 min guided practice, 90 min independent exercises, 60 min project work, 30 min review.",
  deliverables: [
    "Python exercises repository with clean folder structure",
    "Local Git repository with meaningful commit history",
    "Published GitHub repository with comprehensive README",
    "Robot Mission Logger v1 (CLI application with CSV/JSON storage)",
    "Ten-test scenario verification checklist",
    "5-minute recorded or written demonstration",
    "Self-assessment gap analysis for Month 2 transition",
  ],
  passCriteria: [
    "Can write a Python script from a blank file using variables, conditions, loops and functions.",
    "Can use lists and dictionaries to organize robot telemetry and configuration data.",
    "Can read and write local text, CSV, or JSON mission files reliably.",
    "Can identify and fix basic syntax, runtime, and logic errors using tracebacks.",
    "Can explain what a Git repository, commit, remote, and push do.",
    "Can run scripts and navigate directories from PowerShell or terminal.",
    "Can demonstrate Robot Mission Logger v1 and explain its architectural limitations.",
  ],
  month2Preview:
    "Month 2 introduces C++ fundamentals, electronics theory (voltage, current, resistance, Ohm's law), breadboards, LEDs, resistors, and multimeter operation. Hardware purchases occur after Month 2–3 planning.",
};

// -----------------------------------------------------------------------------
// 2. EQUIPMENT & SOFTWARE CHECKLIST (3 CATEGORIES + NOT THIS MONTH)
// -----------------------------------------------------------------------------
export const MONTH_1_EQUIPMENT: EquipmentItem[] = [
  // Category 1: Already Available
  {
    item: "Windows Laptop",
    category: "already_available",
    needNow: "Already have",
    purpose: "Your existing Windows laptop (8GB RAM, 50GB free SSD) is fully sufficient for Month 1.",
    estimatedCost: "₹0 (Existing)",
  },
  {
    item: "Broadband Internet Access",
    category: "already_available",
    needNow: "Yes",
    purpose: "Accessing documentation, tutorial videos, GitHub sync, and downloading software packages.",
    estimatedCost: "Existing connection",
  },
  {
    item: "Python 3 Runtime",
    category: "already_available",
    needNow: "Yes",
    purpose: "Free language runtime (3.11+) installed from python.org with 'Add Python to PATH' enabled.",
    estimatedCost: "Free (₹0)",
  },
  {
    item: "VS Code or PyCharm Community",
    category: "already_available",
    needNow: "Yes",
    purpose: "Select one primary IDE; avoid installing multiple IDEs unnecessarily.",
    estimatedCost: "Free (₹0)",
  },
  {
    item: "Git for Windows",
    category: "already_available",
    needNow: "Yes",
    purpose: "Local version control CLI installed from git-scm.com.",
    estimatedCost: "Free (₹0)",
  },
  {
    item: "GitHub Account",
    category: "already_available",
    needNow: "Yes",
    purpose: "Cloud repository storage for learning code; configure strong password and 2FA.",
    estimatedCost: "Free tier (₹0)",
  },

  // Category 2: Required to Obtain
  // None for Month 1!

  // Category 3: Optional
  {
    item: "Physical Notebook & Technical Pen",
    category: "optional",
    needNow: "Recommended",
    purpose: "Record concepts, circuit diagrams, syntax errors, pseudocode, and daily study reflections.",
    estimatedCost: "₹100–₹250",
  },
  {
    item: "32GB+ USB Flash Drive or Cloud Backup",
    category: "optional",
    needNow: "Optional",
    purpose: "Secondary local archive for project code, notes, and datasets alongside GitHub.",
    estimatedCost: "Optional (₹0–₹400)",
  },

  // Category 4: NOT THIS MONTH (Strictly Prohibited for Month 1)
  {
    item: "Arduino / ESP32 Microcontrollers",
    category: "not_this_month",
    needNow: "Not this month",
    purpose: "Do not buy yet. Master programming fundamentals first. Microcontrollers start in Month 2–3.",
    estimatedCost: "₹0 this month",
  },
  {
    item: "Sensors, Motors & Motor Drivers (L298N/TB6612)",
    category: "not_this_month",
    needNow: "Not this month",
    purpose: "Do not buy yet. Robot hardware selection will be finalized after Month 2–3 planning.",
    estimatedCost: "₹0 this month",
  },
  {
    item: "Breadboards, Multimeter & Power Supplies",
    category: "not_this_month",
    needNow: "Not this month",
    purpose: "Multimeter and basic components enter during Month 2 Electronics. Delay purchasing now.",
    estimatedCost: "₹0 this month",
  },
];

// -----------------------------------------------------------------------------
// 3. RELIABLE LEARNING SOURCES (VERIFIED URLS)
// -----------------------------------------------------------------------------
export const MONTH_1_RESOURCES: StudyResourceItem[] = [
  {
    id: "res-python-tutorial",
    title: "Python Official Tutorial",
    subject: "Python Syntax & Foundations",
    description: "Main reference for syntax, data structures, modules, file I/O, and classes. Read matching sections after daily lessons.",
    url: "https://docs.python.org/3/tutorial/",
    type: "documentation",
    relevantTopics: "Days 1–20: Core Python Language",
  },
  {
    id: "res-python-getting-started",
    title: "Python Official Getting Started",
    subject: "Setup & Installation",
    description: "Beginner-friendly entry point and installation guidance for Windows systems.",
    url: "https://www.python.org/about/gettingstarted/",
    type: "documentation",
    relevantTopics: "Day 1: Setup and Environment",
  },
  {
    id: "res-cs50p",
    title: "Harvard CS50P — Python Programming",
    subject: "Computer Science with Python",
    description: "Top-tier video lectures, problem sets, and interactive exercises. Focus on early lectures (Functions, Variables, Conditionals, Loops).",
    url: "https://cs50.harvard.edu/python/",
    type: "interactive_course",
    relevantTopics: "Weeks 1–3: Structured Programming",
  },
  {
    id: "res-pro-git",
    title: "Pro Git Book (Official Free Edition)",
    subject: "Git Version Control",
    description: "Definitive Git reference by Scott Chacon. Focus on Chapter 1 (Getting Started) and Chapter 2 (Git Basics).",
    url: "https://git-scm.com/book/en/v2",
    type: "book",
    relevantTopics: "Days 21–24: Git & GitHub Workflows",
  },
  {
    id: "res-github-skills",
    title: "GitHub Skills Interactive Modules",
    subject: "Remote Collaboration & Repositories",
    description: "Hands-on browser-based practice for initializing repositories, committing, branching, and pushing code.",
    url: "https://skills.github.com/",
    type: "interactive_course",
    relevantTopics: "Days 23–24: GitHub Mastery",
  },
  {
    id: "res-powershell-docs",
    title: "Microsoft PowerShell Documentation",
    subject: "Terminal & Shell Navigation",
    description: "Official guide to navigating Windows directory trees, inspecting environment variables, running scripts, and managing files.",
    url: "https://learn.microsoft.com/powershell/",
    type: "documentation",
    relevantTopics: "Days 25–26: Shell & Environment",
  },
  {
    id: "res-exercism-python",
    title: "Exercism Python Track",
    subject: "Deliberate Coding Practice",
    description: "Free automated mentor-reviewed coding exercises to build fluency with syntax, lists, strings, and dictionaries.",
    url: "https://exercism.org/tracks/python",
    type: "practice",
    relevantTopics: "Daily exercises & weekly revisions",
  },
];

// -----------------------------------------------------------------------------
// 4. COMPLETE 30-DAY CURRICULUM (DAY 1 TO DAY 30 VERBATIM)
// -----------------------------------------------------------------------------
export const MONTH_1_DAYS: Month1DayPlan[] = [
  // --- WEEK 1: PYTHON FOUNDATIONS (Days 1 to 7) ---
  {
    dayNumber: 1,
    date: "2026-11-08",
    dayOfWeek: "Sunday",
    weekNumber: 1,
    type: "LEARNING",
    hours: 4.0,
    topic: "Setup Python and tools",
    study: "Python 3 installation; IDE setup; interpreter; terminal; project folder structure.",
    do: "Install/verify Python. Run python --version. Create hello.py and run it in IDE and PowerShell.",
    save: "Working environment; hello.py; screenshot of version/output.",
    checklistItems: [
      { id: "d1-c1", text: "Download and install Python 3.11+ ensuring 'Add Python to PATH' is checked" },
      { id: "d1-c2", text: "Install and configure IDE (VS Code with Python extension or PyCharm Community)" },
      { id: "d1-c3", text: "Create workspace folder: Documents/ROBO_MATES/Month_01_Python" },
      { id: "d1-c4", text: "Verify interpreter in PowerShell using `python --version` and `py --version`" },
      { id: "d1-c5", text: "Write `hello.py` printing a welcome message and execute it from terminal" },
      { id: "d1-c6", text: "Capture screenshot of terminal output and save in `Screenshots/` folder" },
      { id: "d1-c7", text: "Log day 1 reflections and verified folder setup" },
    ],
  },
  {
    dayNumber: 2,
    date: "2026-11-09",
    dayOfWeek: "Monday",
    weekNumber: 1,
    type: "LEARNING",
    hours: 4.0,
    topic: "Your first Python program",
    study: "print(); comments; strings; escape characters; script structure.",
    do: "Write a program that prints a short profile and five facts about a robot you want to build. Add comments and run it twice.",
    save: "intro.py with readable comments.",
    checklistItems: [
      { id: "d2-c1", text: "Study `print()` syntax, string formatting, and single/multi-line comments (#)" },
      { id: "d2-c2", text: "Understand newline (`\\n`), tab (`\\t`), and quote escaping characters" },
      { id: "d2-c3", text: "Write `intro.py` defining a profile for the ROBO MATES AMR robot" },
      { id: "d2-c4", text: "Include at least five technical facts (payload, wheels, battery, sensors, target)" },
      { id: "d2-c5", text: "Add comprehensive inline comments explaining script structure" },
      { id: "d2-c6", text: "Execute script twice in terminal to verify clean output formatting" },
      { id: "d2-c7", text: "Commit or save `intro.py` into daily study directory" },
    ],
  },
  {
    dayNumber: 3,
    date: "2026-11-10",
    dayOfWeek: "Tuesday",
    weekNumber: 1,
    type: "LEARNING",
    hours: 4.0,
    topic: "Variables and data types",
    study: "Variable assignment; naming; int, float, str, bool; type().",
    do: "Create variables for robot name, wheel count, battery voltage and simulation flag. Print values and types.",
    save: "variables.py and short explanation.",
    checklistItems: [
      { id: "d3-c1", text: "Learn Python naming conventions (snake_case, case sensitivity, reserved keywords)" },
      { id: "d3-c2", text: "Study fundamental primitive types: `int`, `float`, `str`, and `bool`" },
      { id: "d3-c3", text: "Explore the built-in `type()` function to inspect runtime types" },
      { id: "d3-c4", text: "Create `variables.py` defining robot attributes (name, wheel_count, battery_voltage, is_simulated)" },
      { id: "d3-c5", text: "Print each variable alongside its dynamic type using `print(var, type(var))`" },
      { id: "d3-c6", text: "Write a short written explanation of why types matter in robot control" },
      { id: "d3-c7", text: "Save `variables.py` and review output" },
    ],
  },
  {
    dayNumber: 4,
    date: "2026-11-11",
    dayOfWeek: "Wednesday",
    weekNumber: 1,
    type: "LEARNING",
    hours: 4.0,
    topic: "Input and conversion",
    study: "input(); int(); float(); str(); f-strings; invalid input.",
    do: "Ask for a name and two numeric measurements; convert them and display a formatted summary. Test invalid input.",
    save: "measurement_input.py with valid/invalid test notes.",
    checklistItems: [
      { id: "d4-c1", text: "Study `input()` function behavior (always returns string data)" },
      { id: "d4-c2", text: "Learn explicit type conversion methods: `int()`, `float()`, `str()`" },
      { id: "d4-c3", text: "Master Python 3 f-string formatting (`f'Robot {name} length: {length:.2f}m'`)" },
      { id: "d4-c4", text: "Create `measurement_input.py` prompting for robot operator name, chassis length, and width" },
      { id: "d4-c5", text: "Calculate footprint area and display a formatted engineering summary" },
      { id: "d4-c6", text: "Test script with valid numbers and record what happens when strings are typed" },
      { id: "d4-c7", text: "Save `measurement_input.py` with valid/invalid test notes" },
    ],
  },
  {
    dayNumber: 5,
    date: "2026-11-12",
    dayOfWeek: "Thursday",
    weekNumber: 1,
    type: "LEARNING",
    hours: 4.0,
    topic: "Operators and calculations",
    study: "Arithmetic; precedence; comparisons; boolean expressions.",
    do: "Calculate wheel circumference and distance travelled from rotations using sample values. Test three cases and explain units.",
    save: "wheel_distance.py and three test cases.",
    checklistItems: [
      { id: "d5-c1", text: "Study arithmetic operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`) and PEMDAS precedence" },
      { id: "d5-c2", text: "Review comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) and boolean logic" },
      { id: "d5-c3", text: "Write `wheel_distance.py` using formula `circumference = 2 * pi * radius`" },
      { id: "d5-c4", text: "Compute total distance travelled given wheel rotations count" },
      { id: "d5-c5", text: "Execute and verify three distinct test cases (small wheel, standard AMR wheel, high rotation)" },
      { id: "d5-c6", text: "Document units clearly (meters, centimeters, revolutions)" },
      { id: "d5-c7", text: "Save `wheel_distance.py` and test calculation notes" },
    ],
  },
  {
    dayNumber: 6,
    date: "2026-11-13",
    dayOfWeek: "Friday",
    weekNumber: 1,
    type: "WEEKLY ASSESSMENT",
    hours: 3.5,
    topic: "Week 1 review",
    study: "Python setup, output, variables, types, input and operators.",
    do: "Take a 15-question self-quiz. Rebuild two exercises without notes. Fix one bug in an earlier script.",
    save: "Quiz score, corrected scripts and learning note.",
    checklistItems: [
      { id: "d6-c1", text: "Conduct comprehensive review of Days 1–5 concepts and script notes" },
      { id: "d6-c2", text: "Take 15-question Week 1 foundations self-quiz (syntax, types, conversions)" },
      { id: "d6-c3", text: "Rebuild `intro.py` and `wheel_distance.py` from memory without looking at notes" },
      { id: "d6-c4", text: "Perform code audit on all Week 1 scripts and fix at least one formatting or logic bug" },
      { id: "d6-c5", text: "Record quiz score percentage and document any weak areas" },
      { id: "d6-c6", text: "Commit all cleaned Week 1 scripts to local repository" },
    ],
  },
  {
    dayNumber: 7,
    date: "2026-11-14",
    dayOfWeek: "Saturday",
    weekNumber: 1,
    type: "REST / REVIEW",
    hours: 0.0,
    topic: "Rest and setup review",
    study: "No new topic. File organization and recovery.",
    do: "Optional 20-minute recap. Back up Month1 folder. No mandatory study hours.",
    save: "Clean folder structure.",
    checklistItems: [
      { id: "d7-c1", text: "Optional 20-minute recap of Week 1 milestone achievements" },
      { id: "d7-c2", text: "Verify `Documents/ROBO_MATES/Month_01_Python` directory structure is tidy" },
      { id: "d7-c3", text: "Create local backup copy of Week 1 folder to second drive or USB" },
      { id: "d7-c4", text: "Rest and recharge mentally for Week 2 control structures" },
    ],
  },

  // --- WEEK 2: PYTHON CORE PROGRAMMING (Days 8 to 14) ---
  {
    dayNumber: 8,
    date: "2026-11-15",
    dayOfWeek: "Sunday",
    weekNumber: 2,
    type: "LEARNING",
    hours: 4.0,
    topic: "Conditional statements",
    study: "if, elif, else; indentation; nested conditions; and/or/not.",
    do: "Build a battery-status checker using clearly labelled illustrative thresholds. Test at least six values.",
    save: "battery_status.py and test table.",
    checklistItems: [
      { id: "d8-c1", text: "Understand Python block indentation rules (4 spaces standard)" },
      { id: "d8-c2", text: "Study `if`, `elif`, `else` execution flow and short-circuit evaluation with `and`/`or`/`not`" },
      { id: "d8-c3", text: "Create `battery_status.py` evaluating voltage thresholds (Critical, Low, Normal, Full, Overvoltage)" },
      { id: "d8-c4", text: "Implement input bounds checking to catch impossible negative readings" },
      { id: "d8-c5", text: "Test script against at least 6 boundary values (e.g. 0V, 9.5V, 11.1V, 12.6V, 14.8V, invalid)" },
      { id: "d8-c6", text: "Build a Markdown test table summarizing input vs resulting battery status output" },
      { id: "d8-c7", text: "Save `battery_status.py` and test matrix" },
    ],
  },
  {
    dayNumber: 9,
    date: "2026-11-16",
    dayOfWeek: "Monday",
    weekNumber: 2,
    type: "LEARNING",
    hours: 4.0,
    topic: "For loops",
    study: "range(); iteration; counters; accumulation; loop patterns.",
    do: "Print 1–20; create a multiplication table; calculate sum and average of a list of mock sensor readings.",
    save: "for_loops.py with three exercises.",
    checklistItems: [
      { id: "d9-c1", text: "Study `for` loop mechanics and `range(start, stop, step)` parameters" },
      { id: "d9-c2", text: "Learn loop accumulation patterns (sum total, counter increments)" },
      { id: "d9-c3", text: "Write Exercise 1: Count and print numbers 1 to 20 with formatted step" },
      { id: "d9-c4", text: "Write Exercise 2: Generate clean multiplication table for motor gear ratios" },
      { id: "d9-c5", text: "Write Exercise 3: Iterate through mock LiDAR distance array and compute sum & average" },
      { id: "d9-c6", text: "Save all three exercises cleanly commented in `for_loops.py`" },
      { id: "d9-c7", text: "Document loop iteration insights in study notes" },
    ],
  },
  {
    dayNumber: 10,
    date: "2026-11-17",
    dayOfWeek: "Tuesday",
    weekNumber: 2,
    type: "LEARNING",
    hours: 4.0,
    topic: "While loops",
    study: "while conditions; counters; break; continue; infinite-loop prevention.",
    do: "Build a command-line menu that repeats until Exit is selected. Test invalid choices and exit behavior.",
    save: "while_menu.py.",
    checklistItems: [
      { id: "d10-c1", text: "Understand `while` loop conditions and guard against accidental infinite loops" },
      { id: "d10-c2", text: "Learn proper usage of loop control statements: `break` and `continue`" },
      { id: "d10-c3", text: "Design a CLI robot teleoperation menu (1: Forward, 2: Stop, 3: Status, 4: Exit)" },
      { id: "d10-c4", text: "Implement loop repetition keeping the menu active until option 4 is selected" },
      { id: "d10-c5", text: "Handle invalid menu selections gracefully without crashing the loop" },
      { id: "d10-c6", text: "Verify exit condition cleanly terminates script execution" },
      { id: "d10-c7", text: "Save `while_menu.py`" },
    ],
  },
  {
    dayNumber: 11,
    date: "2026-11-18",
    dayOfWeek: "Wednesday",
    weekNumber: 2,
    type: "LEARNING",
    hours: 4.0,
    topic: "Strings",
    study: "Indexing; slicing; len; strip; split; replace; lower/upper; f-strings.",
    do: "Parse mock sensor text such as TEMP: 28.5 C. Handle missing or malformed values safely.",
    save: "string_parser.py and five test cases.",
    checklistItems: [
      { id: "d11-c1", text: "Master string indexing, negative indices, and slicing `[start:stop:step]`" },
      { id: "d11-c2", text: "Learn string manipulation methods: `.strip()`, `.split()`, `.replace()`, `.upper()`, `.lower()`" },
      { id: "d11-c3", text: "Create `string_parser.py` to extract numeric values from raw telemetry strings (`'TEMP: 28.5 C'`)" },
      { id: "d11-c4", text: "Implement error protection for malformed packets missing delimiters or prefixes" },
      { id: "d11-c5", text: "Test script against 5 realistic test cases (clean string, extra whitespace, corrupted, blank)" },
      { id: "d11-c6", text: "Convert parsed temperature to float and print confirmation" },
      { id: "d11-c7", text: "Save `string_parser.py` with test suite" },
    ],
  },
  {
    dayNumber: 12,
    date: "2026-11-19",
    dayOfWeek: "Thursday",
    weekNumber: 2,
    type: "LEARNING",
    hours: 4.0,
    topic: "Lists and tuples",
    study: "Create, index, update, append, remove, iteration; tuple basics.",
    do: "Store five mock distance readings; calculate minimum, maximum and average; explain the mock data.",
    save: "sensor_readings.py and output.",
    checklistItems: [
      { id: "d12-c1", text: "Learn list creation, indexing, modification, `.append()`, `.pop()`, and `.remove()`" },
      { id: "d12-c2", text: "Understand differences between mutable lists and immutable tuples `(x, y, theta)`" },
      { id: "d12-c3", text: "Create `sensor_readings.py` storing 5 ultrasonic sensor distance measurements in cm" },
      { id: "d12-c4", text: "Calculate minimum, maximum, and average distance without using external packages" },
      { id: "d12-c5", text: "Sort distance readings in ascending order to identify nearest obstacles" },
      { id: "d12-c6", text: "Document physical interpretation of mock data (obstacle proximity)" },
      { id: "d12-c7", text: "Save `sensor_readings.py` and output log" },
    ],
  },
  {
    dayNumber: 13,
    date: "2026-11-20",
    dayOfWeek: "Friday",
    weekNumber: 2,
    type: "LEARNING",
    hours: 4.0,
    topic: "Functions",
    study: "def; parameters; return; scope; decomposition; docstrings.",
    do: "Refactor sensor calculations into reusable validation, average, minimum and maximum functions.",
    save: "functions_sensor.py.",
    checklistItems: [
      { id: "d13-c1", text: "Study `def` syntax, positional arguments, keyword arguments, and default values" },
      { id: "d13-c2", text: "Understand `return` statement behavior and variable scope (local vs global)" },
      { id: "d13-c3", text: "Write standard docstrings (`'''Explanation'''`) following PEP 257 standards" },
      { id: "d13-c4", text: "Write `functions_sensor.py` refactoring Day 12 code into 4 modular functions" },
      { id: "d13-c5", text: "Implement `validate_reading()`, `calculate_average()`, `find_min()`, and `find_max()`" },
      { id: "d13-c6", text: "Write main test harness testing functions with multiple sensor arrays" },
      { id: "d13-c7", text: "Save `functions_sensor.py`" },
    ],
  },
  {
    dayNumber: 14,
    date: "2026-11-21",
    dayOfWeek: "Saturday",
    weekNumber: 2,
    type: "WEEKLY ASSESSMENT",
    hours: 3.5,
    topic: "Week 2 review",
    study: "Conditionals, loops, strings, lists and functions.",
    do: "Complete a 20-question quiz. Solve two small problems without copying. Explain one bug and its fix.",
    save: "Quiz result and revised code.",
    checklistItems: [
      { id: "d14-c1", text: "Review Week 2 notes on conditionals, loops, strings, lists, and functions" },
      { id: "d14-c2", text: "Complete 20-question Week 2 programming assessment" },
      { id: "d14-c3", text: "Solve Problem 1: Filter out negative sensor noise values from a noisy list" },
      { id: "d14-c4", text: "Solve Problem 2: Format telemetry strings into uppercase standardized logs" },
      { id: "d14-c5", text: "Identify and explain one subtle off-by-one bug encountered this week and document fix" },
      { id: "d14-c6", text: "Save revised code and record assessment score" },
    ],
  },

  // --- WEEK 3: PRACTICAL PYTHON AND DEVELOPER TOOLS (Days 15 to 23) ---
  {
    dayNumber: 15,
    date: "2026-11-22",
    dayOfWeek: "Sunday",
    weekNumber: 3,
    type: "REST / REVIEW",
    hours: 0.0,
    topic: "Rest and review",
    study: "No new topic. Review weak areas.",
    do: "Optional light practice; write down five questions to resolve next week.",
    save: "Weekly reflection.",
    checklistItems: [
      { id: "d15-c1", text: "Take rest from intense coding to prevent burnout" },
      { id: "d15-c2", text: "Conduct casual 15-minute review of Python syntax cheat sheets" },
      { id: "d15-c3", text: "Write down 5 specific technical questions to clarify in Week 3" },
      { id: "d15-c4", text: "Save weekly reflection notes" },
    ],
  },
  {
    dayNumber: 16,
    date: "2026-11-23",
    dayOfWeek: "Monday",
    weekNumber: 3,
    type: "LEARNING",
    hours: 4.0,
    topic: "Dictionaries and sets",
    study: "Key-value pairs; lookup; update; iteration; set uniqueness.",
    do: "Represent a robot configuration as a dictionary with name, wheel diameter and sensor count. Validate required keys.",
    save: "robot_config.py.",
    checklistItems: [
      { id: "d16-c1", text: "Study dictionary key-value architecture, hashing, `.get()`, `.keys()`, `.values()`, `.items()`" },
      { id: "d16-c2", text: "Understand set data structure and duplicate removal properties" },
      { id: "d16-c3", text: "Create `robot_config.py` defining an AMR configuration dictionary" },
      { id: "d16-c4", text: "Include keys: `name`, `robot_type`, `wheel_diameter_mm`, `sensors`, `max_speed_mps`" },
      { id: "d16-c5", text: "Write function verifying that all required configuration keys exist" },
      { id: "d16-c6", text: "Print formatted configuration report iterating through dictionary items" },
      { id: "d16-c7", text: "Save `robot_config.py`" },
    ],
  },
  {
    dayNumber: 17,
    date: "2026-11-24",
    dayOfWeek: "Tuesday",
    weekNumber: 3,
    type: "LEARNING",
    hours: 4.0,
    topic: "File handling",
    study: "open(); with; read/write/append; paths; text files; CSV concept.",
    do: "Save a mock robot mission log to a text file, read it back and display the records.",
    save: "session_log.py and generated log file.",
    checklistItems: [
      { id: "d17-c1", text: "Learn context manager `with open(filename, mode) as f:` to prevent leaked file descriptors" },
      { id: "d17-c2", text: "Study file modes: `'r'` (read), `'w'` (write/overwrite), `'a'` (append)" },
      { id: "d17-c3", text: "Write `session_log.py` recording robot mission timestamps and statuses" },
      { id: "d17-c4", text: "Append 3 distinct mission events into `missions.txt`" },
      { id: "d17-c5", text: "Implement reader function opening file, reading line-by-line, and displaying contents" },
      { id: "d17-c6", text: "Inspect generated log file in VS Code" },
      { id: "d17-c7", text: "Save `session_log.py` and `missions.txt`" },
    ],
  },
  {
    dayNumber: 18,
    date: "2026-11-25",
    dayOfWeek: "Wednesday",
    weekNumber: 3,
    type: "LEARNING",
    hours: 4.0,
    topic: "Debugging and exceptions",
    study: "Syntax/runtime/logic errors; tracebacks; try/except; debugger basics.",
    do: "Intentionally introduce three bugs into copied exercises; diagnose and fix each; handle invalid numeric input.",
    save: "debugging_lab.py and bug diary.",
    checklistItems: [
      { id: "d18-c1", text: "Understand difference between syntax errors, runtime exceptions, and subtle logic bugs" },
      { id: "d18-c2", text: "Learn how to read Python traceback stacks from bottom to top" },
      { id: "d18-c3", text: "Implement `try / except (ValueError, ZeroDivisionError)` exception handling" },
      { id: "d18-c4", text: "Intentionally introduce 3 bugs into previous scripts and use VS Code debugger with breakpoints" },
      { id: "d18-c5", text: "Step through execution, inspect variable state, and diagnose root causes" },
      { id: "d18-c6", text: "Create `debugging_lab.py` and write entries into a Bug Diary markdown file" },
      { id: "d18-c7", text: "Save lab script and bug diary" },
    ],
  },
  {
    dayNumber: 19,
    date: "2026-11-26",
    dayOfWeek: "Thursday",
    weekNumber: 3,
    type: "LEARNING",
    hours: 4.0,
    topic: "Modules and standard library",
    study: "import; math; pathlib; random; module organization.",
    do: "Use math.pi to calculate wheel circumference. Move helper functions into a separate file and import them.",
    save: "robot_math.py and helper module.",
    checklistItems: [
      { id: "d19-c1", text: "Study Python `import` syntax: `import math`, `from pathlib import Path`, `import random`" },
      { id: "d19-c2", text: "Explore `math` module functions: `math.pi`, `math.sqrt`, `math.radians`, `math.atan2`" },
      { id: "d19-c3", text: "Create helper module `robot_utils.py` with reusable robot calculation functions" },
      { id: "d19-c4", text: "Create `robot_math.py` importing functions from `robot_utils.py`" },
      { id: "d19-c5", text: "Use `pathlib.Path` to handle file paths portably across Windows and Linux" },
      { id: "d19-c6", text: "Test script execution and verify multi-file module resolution" },
      { id: "d19-c7", text: "Save `robot_math.py` and `robot_utils.py`" },
    ],
  },
  {
    dayNumber: 20,
    date: "2026-11-27",
    dayOfWeek: "Friday",
    weekNumber: 3,
    type: "WEEKLY ASSESSMENT",
    hours: 4.0,
    topic: "Object-oriented preview",
    study: "Classes; objects; attributes; methods; __init__; basic encapsulation.",
    do: "Create a Sensor class with name, unit and a method to format a sample reading. Create two objects.",
    save: "sensor_class.py.",
    checklistItems: [
      { id: "d20-c1", text: "Understand core Object-Oriented concepts: Class blueprint vs Object instance" },
      { id: "d20-c2", text: "Study constructor `__init__(self, ...)`, instance attributes, and method definitions" },
      { id: "d20-c3", text: "Write `sensor_class.py` implementing `Sensor` class with `name`, `unit`, `reading`" },
      { id: "d20-c4", text: "Add methods `update_reading(new_val)` and `format_reading()`" },
      { id: "d20-c5", text: "Instantiate two distinct sensor objects (LiDAR in meters, IMU in deg/s)" },
      { id: "d20-c6", text: "Simulate 3 readings and print formatted output" },
      { id: "d20-c7", text: "Save `sensor_class.py`" },
    ],
  },
  {
    dayNumber: 21,
    date: "2026-11-28",
    dayOfWeek: "Saturday",
    weekNumber: 3,
    type: "LEARNING",
    hours: 4.0,
    topic: "Git fundamentals",
    study: "Repository; working tree; staging; commit; status; log; .gitignore.",
    do: "Initialize a Git repository for Month1 code. Add .gitignore. Make two meaningful commits and inspect history.",
    save: "Local Git repository and commit history.",
    checklistItems: [
      { id: "d21-c1", text: "Learn three Git trees: Working Directory, Staging Area (Index), Repository History" },
      { id: "d21-c2", text: "Configure Git identity: `git config --global user.name` and `user.email`" },
      { id: "d21-c3", text: "Run `git init` inside `Documents/ROBO_MATES/Month_01_Python`" },
      { id: "d21-c4", text: "Create `.gitignore` file excluding `__pycache__/`, `.env`, and virtual environments" },
      { id: "d21-c5", text: "Stage files with `git add` and check status with `git status`" },
      { id: "d21-c6", text: "Make two meaningful commits following conventional commits format" },
      { id: "d21-c7", text: "Inspect commit graph using `git log --oneline`" },
    ],
  },
  {
    dayNumber: 22,
    date: "2026-11-29",
    dayOfWeek: "Sunday",
    weekNumber: 3,
    type: "WEEKLY ASSESSMENT",
    hours: 3.5,
    topic: "Week 3 review",
    study: "Dictionaries, files, debugging, modules, OOP preview and Git.",
    do: "Build a small program, debug it and commit the finished version. Explain your changes.",
    save: "Practical test and Git log.",
    checklistItems: [
      { id: "d22-c1", text: "Review Week 3 topics: Dictionaries, file I/O, exceptions, modules, OOP, and Git" },
      { id: "d22-c2", text: "Complete practical assessment combining dictionary telemetry with file persistence" },
      { id: "d22-c3", text: "Intentionally fix an input bug using try/except" },
      { id: "d22-c4", text: "Commit the finalized exercise to local Git repo with detailed message" },
      { id: "d22-c5", text: "Export `git log` to text file as evidence" },
      { id: "d22-c6", text: "Document review notes" },
    ],
  },
  {
    dayNumber: 23,
    date: "2026-11-30",
    dayOfWeek: "Monday",
    weekNumber: 3,
    type: "REST / REVIEW",
    hours: 0.0,
    topic: "Rest and backup",
    study: "No new topic. Organize and back up repository.",
    do: "Optional review; confirm no secrets or passwords are stored in Git.",
    save: "Clean repository.",
    checklistItems: [
      { id: "d23-c1", text: "Rest day to recharge mental energy before final project week" },
      { id: "d23-c2", text: "Inspect `.gitignore` to ensure `.env`, API keys, or personal credentials are never tracked" },
      { id: "d23-c3", text: "Verify git working directory is clean (`git status` shows clean)" },
      { id: "d23-c4", text: "Create archive backup of Month 1 repository" },
    ],
  },

  // --- WEEK 4: GIT, TERMINAL AND CAPSTONE PROJECT (Days 24 to 30) ---
  {
    dayNumber: 24,
    date: "2026-12-01",
    dayOfWeek: "Tuesday",
    weekNumber: 4,
    type: "LEARNING",
    hours: 4.0,
    topic: "GitHub and remote repositories",
    study: "Remote; push; pull; README; repository visibility; credential safety.",
    do: "Create a learning repository. Add README. Push Month1 code and verify files on GitHub. Never commit .env or keys.",
    save: "GitHub repository with README and source files.",
    checklistItems: [
      { id: "d24-c1", text: "Create GitHub repository (e.g. `robo-mates-month-01-python`)" },
      { id: "d24-c2", text: "Add remote origin in local terminal (`git remote add origin <URL>`)" },
      { id: "d24-c3", text: "Write professional `README.md` describing learning objectives, setup, and folder structure" },
      { id: "d24-c4", text: "Commit `README.md` and push branch to GitHub with `git push -u origin main`" },
      { id: "d24-c5", text: "Verify on github.com that all files appear cleanly without secrets or binaries" },
      { id: "d24-c6", text: "Confirm SSH key or GitHub Credential Manager authentication is functional" },
      { id: "d24-c7", text: "Save repository link and screenshot of GitHub repository" },
    ],
  },
  {
    dayNumber: 25,
    date: "2026-12-02",
    dayOfWeek: "Wednesday",
    weekNumber: 4,
    type: "LEARNING",
    hours: 4.0,
    topic: "Linux and terminal fundamentals",
    study: "pwd, ls, cd, mkdir, touch, cp, mv, rm; relative/absolute paths; Windows PowerShell equivalents.",
    do: "Navigate a practice folder; create, rename and copy files. Record equivalent PowerShell commands.",
    save: "terminal_commands.md.",
    checklistItems: [
      { id: "d25-c1", text: "Study core navigation commands: `pwd`/`Get-Location`, `ls`/`Get-ChildItem`, `cd`" },
      { id: "d25-c2", text: "Study file manipulation commands: `mkdir`, `touch`/`New-Item`, `cp`/`Copy-Item`, `mv`, `rm`" },
      { id: "d25-c3", text: "Understand relative vs absolute paths (`.` vs `..` vs `C:/` or `/`)" },
      { id: "d25-c4", text: "Practice creating and moving test directories entirely from PowerShell" },
      { id: "d25-c5", text: "Create `terminal_commands.md` documenting Linux vs PowerShell syntax side-by-side" },
      { id: "d25-c6", text: "Commit documentation to Git repository" },
    ],
  },
  {
    dayNumber: 26,
    date: "2026-12-03",
    dayOfWeek: "Thursday",
    weekNumber: 4,
    type: "LEARNING",
    hours: 4.0,
    topic: "Processes and environments",
    study: "Processes; PATH; environment variables; virtual environments; package installation concept.",
    do: "Run a script from terminal. Inspect Python executable path. Create and activate a virtual environment.",
    save: "environment_notes.md and working venv.",
    checklistItems: [
      { id: "d26-c1", text: "Understand Operating System processes, PID, and how terminals spawn sub-processes" },
      { id: "d26-c2", text: "Inspect system `PATH` and Python executable resolution (`Get-Command python`)" },
      { id: "d26-c3", text: "Learn purpose of virtual environments: dependency isolation per project" },
      { id: "d26-c4", text: "Create a virtual environment: `python -m venv .venv`" },
      { id: "d26-c5", text: "Activate virtual environment in PowerShell (`.venv\\Scripts\\Activate.ps1`)" },
      { id: "d26-c6", text: "Verify prompt displays `(.venv)` and run script inside isolated environment" },
      { id: "d26-c7", text: "Save `environment_notes.md`" },
    ],
  },
  {
    dayNumber: 27,
    date: "2026-12-04",
    dayOfWeek: "Friday",
    weekNumber: 4,
    type: "PROJECT",
    hours: 4.0,
    topic: "Plan the monthly project",
    study: "Requirements; inputs/process/outputs; pseudocode; validation; test cases.",
    do: "Specify Robot Mission Logger: mission name, duration, status and notes. Write pseudocode and at least five test cases.",
    save: "mission_logger_spec.md.",
    checklistItems: [
      { id: "d27-c1", text: "Review Robot Mission Logger v1 functional specifications and scope" },
      { id: "d27-c2", text: "Define data model schema: `name`, `duration` (minutes), `status`, `notes`, `timestamp`" },
      { id: "d27-c3", text: "Draft pseudocode for CLI menu loop and navigation flow" },
      { id: "d27-c4", text: "Specify strict validation rules (non-empty name, duration > 0, allowed status values)" },
      { id: "d27-c5", text: "Draft initial 5 test cases including boundary and invalid input scenarios" },
      { id: "d27-c6", text: "Compile specifications into `mission_logger_spec.md`" },
      { id: "d27-c7", text: "Commit design specification to Git repository" },
    ],
  },
  {
    dayNumber: 28,
    date: "2026-12-05",
    dayOfWeek: "Saturday",
    weekNumber: 4,
    type: "PROJECT",
    hours: 4.5,
    topic: "Build Robot Mission Logger",
    study: "Combine variables, input, conditions, loops, functions, dictionaries and file persistence.",
    do: "Implement CLI menu to add and list missions. Validate fields. Save records locally as CSV or JSON.",
    save: "Robot Mission Logger v1 source code.",
    checklistItems: [
      { id: "d28-c1", text: "Create project folder `robot_mission_logger` with `main.py` and `logger_core.py`" },
      { id: "d28-c2", text: "Implement interactive CLI menu (Add Mission, View Missions, Statistics, Exit)" },
      { id: "d28-c3", text: "Implement `add_mission()` with robust input validation and friendly error prompts" },
      { id: "d28-c4", text: "Implement `save_missions()` and `load_missions()` using JSON or CSV format" },
      { id: "d28-c5", text: "Implement `list_missions()` with clean tabulated terminal display" },
      { id: "d28-c6", text: "Implement summary statistics (total missions, completed vs failed count, total time)" },
      { id: "d28-c7", text: "Commit functional v1 code to Git with meaningful progress commits" },
    ],
  },
  {
    dayNumber: 29,
    date: "2026-12-06",
    dayOfWeek: "Sunday",
    weekNumber: 4,
    type: "PROJECT",
    hours: 4.5,
    topic: "Test and document project",
    study: "Normal/boundary/invalid cases; refactoring; README; limitations.",
    do: "Run at least ten test scenarios. Fix bugs. Write setup, features, usage and limitations. Commit final version.",
    save: "Test checklist, README and GitHub commit.",
    checklistItems: [
      { id: "d29-c1", text: "Execute full suite of 10+ test scenarios (empty names, negative numbers, missing files, corrupt JSON)" },
      { id: "d29-c2", text: "Fix any edge-case exceptions, off-by-one errors, or formatting anomalies" },
      { id: "d29-c3", text: "Refactor code into clean, readable functions with complete docstrings" },
      { id: "d29-c4", text: "Write professional `README.md` containing Project Title, Overview, Features, Setup, Usage, Test Results, and Known Limitations" },
      { id: "d29-c5", text: "Create sample demo run recording or terminal output transcript" },
      { id: "d29-c6", text: "Commit all changes and push final release tag `v1.0.0` to GitHub" },
      { id: "d29-c7", text: "Save completed 10-test verification matrix" },
    ],
  },
  {
    dayNumber: 30,
    date: "2026-12-07",
    dayOfWeek: "Monday",
    weekNumber: 4,
    type: "WEEKLY ASSESSMENT",
    hours: 4.0,
    topic: "Final assessment and demo",
    study: "Explain core topics; demonstrate project; self-evaluation; next-month readiness.",
    do: "Take a 25-question fundamentals quiz. Give a five-minute demo. List three strengths and three gaps.",
    save: "Assessment record, demo evidence and Month 2 readiness note.",
    checklistItems: [
      { id: "d30-c1", text: "Take comprehensive 25-question Month 1 Robotics Engineering Foundations quiz" },
      { id: "d30-c2", text: "Deliver or record 5-minute live walkthrough of Robot Mission Logger v1" },
      { id: "d30-c3", text: "Review the 7 official Month-End Pass Criteria and check off achieved capabilities" },
      { id: "d30-c4", text: "Complete self-evaluation: document 3 major strengths and 3 technical gaps to target in Month 2" },
      { id: "d30-c5", text: "Review Month 2 preview (C++ foundations and electronics theory; no hardware purchases yet)" },
      { id: "d30-c6", text: "Archive Month 1 deliverables and submit project URL to ROBO MATES platform" },
      { id: "d30-c7", text: "Celebrate completing Month 1 Foundation!" },
    ],
  },
];

// -----------------------------------------------------------------------------
// 5. ROBOT MISSION LOGGER V1 SPECIFICATION & TEST SUITE
// -----------------------------------------------------------------------------
export const ROBOT_MISSION_LOGGER_SPEC = {
  title: "Robot Mission Logger v1",
  version: "1.0.0",
  capstonePeriod: "Days 27–30 (4 December – 7 December 2026)",
  targetHours: 17.0,
  objective:
    "Build a Python command-line application that records, validates, and manages autonomous mobile robot (AMR) mission information using only Python standard library.",
  missionFields: [
    { name: "name", type: "string", description: "Descriptive name of the AMR mission (e.g., 'Waypoint Patrol Alpha')" },
    { name: "duration", type: "float", description: "Execution duration in minutes (must be > 0.0)" },
    { name: "status", type: "enum", description: "Mission outcome: 'pending', 'in_progress', 'completed', or 'failed'" },
    { name: "notes", type: "string", description: "Operational notes, telemetry summary, or failure reason" },
    { name: "timestamp", type: "string", description: "ISO 8601 recording timestamp (e.g., '2026-12-05T14:30:00')" },
  ],
  requiredFeatures: [
    "Interactive command-line menu loop with clear numbered options",
    "Add new mission with input validation preventing blank names and invalid statuses",
    "List all recorded missions in an aligned, readable terminal table",
    "Filter missions by status (e.g., view only failed missions)",
    "Calculate mission metrics: total count, total runtime, success percentage",
    "Local persistence: save and reload all missions from JSON or CSV file",
    "Graceful error handling: handles missing files, corrupt entries, and keyboard interrupts without crashing",
  ],
  testSuite: [
    {
      id: "tc-01",
      title: "Normal Mission Entry",
      inputDescription: "Valid name 'Lab Patrol', duration '15.5', status 'completed', notes 'Clean run'",
      expectedBehavior: "Accepts record, saves to file, reports successful addition",
    },
    {
      id: "tc-02",
      title: "Empty Mission Name",
      inputDescription: "Whitespace or blank input for mission name",
      expectedBehavior: "Rejects input, displays error message, re-prompts user",
    },
    {
      id: "tc-03",
      title: "Negative Mission Duration",
      inputDescription: "Duration entered as '-5.0'",
      expectedBehavior: "Rejects negative number, explains duration must be greater than zero",
    },
    {
      id: "tc-04",
      title: "Non-numeric Duration String",
      inputDescription: "Duration entered as 'fifteen minutes'",
      expectedBehavior: "Catches ValueError, informs user to input numeric value, re-prompts",
    },
    {
      id: "tc-05",
      title: "Invalid Status Value",
      inputDescription: "Status entered as 'flying' or 'exploded'",
      expectedBehavior: "Rejects input, displays allowed choices: pending, in_progress, completed, failed",
    },
    {
      id: "tc-06",
      title: "Missing Storage File on Startup",
      inputDescription: "Delete missions.json/csv file and launch application",
      expectedBehavior: "Automatically creates empty dataset without throwing FileNotFoundError",
    },
    {
      id: "tc-07",
      title: "Corrupted Storage File",
      inputDescription: "Storage file contains invalid JSON syntax or truncated lines",
      expectedBehavior: "Catches parsing error, alerts user, offers to initialize clean backup",
    },
    {
      id: "tc-08",
      title: "View Empty Mission List",
      inputDescription: "Select 'List Missions' when zero missions exist",
      expectedBehavior: "Displays polite empty state notice: 'No missions recorded yet'",
    },
    {
      id: "tc-09",
      title: "Filter by Specific Status",
      inputDescription: "Filter for 'failed' missions across 5 sample records",
      expectedBehavior: "Displays only failed missions and matching count",
    },
    {
      id: "tc-10",
      title: "Graceful Program Exit",
      inputDescription: "Select exit option or press Ctrl+C",
      expectedBehavior: "Ensures data is flushed to disk and prints farewell message without raw traceback",
    },
  ] as TestCaseItem[],
  passCriteria: [
    "Program runs cleanly without uncaught exceptions",
    "All 10 test scenarios pass and are verified",
    "Code is modularized into at least two files (e.g., UI menu and storage/models)",
    "Clean Git commit history showing incremental feature development",
    "Published on GitHub with complete README.md and license",
  ],
};

