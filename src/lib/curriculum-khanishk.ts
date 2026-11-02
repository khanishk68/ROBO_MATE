// src/lib/curriculum-data.ts
// =============================================================================
// ROBO MATES: Full 52-Week Curriculum Database
// Khanishk: Robotics Systems Engineer (5.0 hrs/day • 52 Weeks)
// Akshaya: Industrial & Robotics Product Designer (2.75 hrs/day • 52 Weeks)
// Timeline: 8 November 2026 to 7 November 2027 (365 Inclusive Days)
// =============================================================================

export interface CurriculumDailyTaskTemplate {
  dayOfWeek: number; // 1 to 7 (Day 7 = Review & Rest)
  title: string;
  instructions: string;
  learningObjective: string;
  expectedDurationMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "theory" | "practical" | "exercise" | "assessment" | "project" | "revision";
  requiredResources: string;
  expectedOutput: string;
  completionCriteria: string;
}

export interface CurriculumWeek {
  weekNumber: number; // 1 to 52
  title: string;
  learningObjective: string;
  deliverable: string;
  assessmentTitle: string;
  assessmentQuestions: {
    question: string;
    type: "multiple_choice" | "short_answer" | "practical";
    options?: string[];
    correctAnswer?: string;
  }[];
  dailyTasks: CurriculumDailyTaskTemplate[];
}

export interface CurriculumMonth {
  monthNumber: number; // 1 to 12
  title: string;
  description: string;
  mainSubjects: string[];
  deliverable: string;
  estimatedHours: number;
  learningObjectives: string[];
  assessmentCriteria: string[];
  weeks: CurriculumWeek[];
}

// -----------------------------------------------------------------------------
// KHANISHK: 52-WEEK ROBOTICS ENGINEERING ROADMAP
// -----------------------------------------------------------------------------
export const KHANISHK_CURRICULUM: CurriculumMonth[] = [
  // MONTH 1: PYTHON, GIT AND LINUX
  {
    monthNumber: 1,
    title: "Python, Git and Linux Foundations",
    description: "Master Python programming fundamentals, Linux command line fluency, and professional Git/GitHub workflow.",
    mainSubjects: ["Python", "Linux CLI", "Git & GitHub"],
    deliverable: "5 published Python automation scripts and robot log parser on GitHub.",
    estimatedHours: 130,
    learningObjectives: [
      "Set up a professional Linux and Python robotics development environment",
      "Write modular, error-resilient Python scripts for robotics data manipulation",
      "Manage version control with branching, pull requests, and semantic commits",
      "Automate file processing and telemetry parsing in Ubuntu terminal",
    ],
    assessmentCriteria: [
      "Pass Month 1 Python coding benchmark (>=80%)",
      "Verified GitHub repository with clean history and README documentation",
    ],
    weeks: [
      {
        weekNumber: 1,
        title: "Python Environment, Data Types and Flow Control",
        learningObjective: "Master Python primitive types, arithmetic/logical operators, and control flow.",
        deliverable: "CLI unit converter and sensor threshold classifier script.",
        assessmentTitle: "Week 1 Python Fundamentals Quiz",
        assessmentQuestions: [
          { question: "What is the difference between a float and an integer in memory?", type: "short_answer" },
          { question: "How does Python handle division of two integers in Python 3?", type: "multiple_choice", options: ["Always returns float", "Always truncates to int", "Returns float only if remainder exists"], correctAnswer: "Always returns float" },
        ],
        dailyTasks: [
          { dayOfWeek: 1, title: "Python 3 & VS Code Robotics Toolchain Setup", instructions: "Install Python 3.12, configure venv, install black, flake8, and configure VS Code debugger.", learningObjective: "Professional IDE configuration", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "Python Docs, VS Code Setup Guide", expectedOutput: "Configured IDE with virtual environment", completionCriteria: "Can run and debug python scripts with breakpoints" },
          { dayOfWeek: 1, title: "Variables, Numerical Primitives and String Formatting", instructions: "Practice integer, float, boolean operations, f-strings, and type casting for sensor metrics.", learningObjective: "Understand primitive data types", expectedDurationMinutes: 75, difficulty: "beginner", category: "practical", requiredResources: "Python Official Tutorial Ch 3", expectedOutput: "Script calculating robotics payload capacity", completionCriteria: "All 5 type conversion exercises pass assertions" },
          { dayOfWeek: 1, title: "AMR Kinematics Formulae in Python", instructions: "Implement differential drive wheel speed equations: v = (v_r + v_l)/2 and omega = (v_r - v_l)/L.", learningObjective: "Translate robotics math into clean code", expectedDurationMinutes: 75, difficulty: "beginner", category: "project", requiredResources: "Differential Drive Kinematics Paper", expectedOutput: "kinematics_test.py computing linear/angular velocity", completionCriteria: "Matches theoretical wheel velocity outputs" },
          { dayOfWeek: 1, title: "Conditionals & Logic Gate Emulation", instructions: "Build an obstacle response decision tree with if-elif-else statements mimicking distance thresholds.", learningObjective: "Master conditional branching", expectedDurationMinutes: 60, difficulty: "beginner", category: "exercise", requiredResources: "Robo Mates Python Guide", expectedOutput: "obstacle_decision.py", completionCriteria: "Handles near, medium, and clear distance branches correctly" },
          { dayOfWeek: 1, title: "Daily Code Review & Knowledge Check", instructions: "Review PEP-8 compliance, commit daily progress to local git branch.", learningObjective: "Maintain code cleanliness", expectedDurationMinutes: 30, difficulty: "beginner", category: "revision", requiredResources: "PEP 8 Style Guide", expectedOutput: "Formatted codebase", completionCriteria: "flake8 reports 0 errors" },
          // Day 2
          { dayOfWeek: 2, title: "Input/Output Streams and User Validation", instructions: "Write interactive scripts prompting user for wheel diameter and gear ratios with input sanitization.", learningObjective: "Handle user input safely", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "Python I/O Guide", expectedOutput: "robot_spec_collector.py", completionCriteria: "Rejects invalid numerical input without crashing" },
          { dayOfWeek: 2, title: "Nested Conditionals & Safety Interlocks", instructions: "Implement robot state machine conditions: e-stop engaged, battery low, motor stall detection.", learningObjective: "Construct multi-condition safety checks", expectedDurationMinutes: 90, difficulty: "beginner", category: "practical", requiredResources: "Safety Logic Handout", expectedOutput: "safety_interlock.py", completionCriteria: "Correctly flags unsafe operational states" },
          { dayOfWeek: 2, title: "AMR Power Consumption Estimator", instructions: "Write a script estimating runtime based on battery mAh rating and motor amperage draws.", learningObjective: "Apply physics equations in code", expectedDurationMinutes: 90, difficulty: "beginner", category: "project", requiredResources: "AMR Requirements Document", expectedOutput: "battery_runtime_calc.py", completionCriteria: "Outputs discharge curve estimation" },
          { dayOfWeek: 2, title: "Daily Review & Revision", instructions: "Practice writing 5 quick lambda functions and boolean comparisons.", learningObjective: "Speed and syntax fluency", expectedDurationMinutes: 30, difficulty: "beginner", category: "revision", requiredResources: "Python Interactive Shell", expectedOutput: "Interactive shell notes", completionCriteria: "All 5 functions return expected results" },
          // Day 3
          { dayOfWeek: 3, title: "Basic Programming Exercises: Unit Conversions", instructions: "Write a Python program that converts Celsius to Fahrenheit and meters to encoder ticks.", learningObjective: "Build reusable conversion utilities", expectedDurationMinutes: 60, difficulty: "beginner", category: "practical", requiredResources: "Encoder Math Sheet", expectedOutput: "conversions.py", completionCriteria: "Verified against reference values" },
          { dayOfWeek: 3, title: "Debugging Python Programs with pdb", instructions: "Learn to use Python's built-in pdb and VS Code visual debugger to inspect call stacks.", learningObjective: "Master debugging workflows", expectedDurationMinutes: 90, difficulty: "beginner", category: "theory", requiredResources: "pdb Documentation", expectedOutput: "Resolved intentional bugs in buggy_robot.py", completionCriteria: "Identifies off-by-one errors via breakpoint inspection" },
          { dayOfWeek: 3, title: "AMR Wheel Circumference & Odometry Calibration Script", instructions: "Calculate real-world distance traveled per revolution: distance = circumference * revolutions.", learningObjective: "Ground software in physical dimensions", expectedDurationMinutes: 90, difficulty: "beginner", category: "project", requiredResources: "Robo Mates AMR Chassis Specs", expectedOutput: "odometry_math.py", completionCriteria: "Prints distance for 100, 500, 1000 revolutions" },
          { dayOfWeek: 3, title: "Daily Documentation and Log", instructions: "Document findings in developer learning notebook.", learningObjective: "Technical writing habit", expectedDurationMinutes: 30, difficulty: "beginner", category: "revision", requiredResources: "Obsidian / Markdown", expectedOutput: "Day 3 entry in learning log", completionCriteria: "Saved markdown record" },
          // Day 4
          { dayOfWeek: 4, title: "Exception Handling Basics (try/except/finally)", instructions: "Wrap file access and numerical calculations in structured try/except blocks to prevent crashes.", learningObjective: "Write fault-tolerant code", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "Python Errors and Exceptions Docs", expectedOutput: "fault_resilient_calc.py", completionCriteria: "Handles ZeroDivisionError and ValueError cleanly" },
          { dayOfWeek: 4, title: "Interactive Robot Terminal Dashboard", instructions: "Build a curses/terminal text dashboard displaying robot uptime, battery, and fake motor speed.", learningObjective: "Create command-line user interfaces", expectedDurationMinutes: 90, difficulty: "beginner", category: "practical", requiredResources: "Rich / curses python guide", expectedOutput: "cli_dashboard.py", completionCriteria: "Refreshes live stats in terminal" },
          { dayOfWeek: 4, title: "AMR Telemetry Data Generator", instructions: "Generate simulated stream of timestamps, velocities, and simulated battery levels.", learningObjective: "Simulate sensor data feeds", expectedDurationMinutes: 90, difficulty: "beginner", category: "project", requiredResources: "Robotics Telemetry Spec", expectedOutput: "telemetry_generator.py", completionCriteria: "Produces 50 rows of structured sensor strings" },
          { dayOfWeek: 4, title: "Review & Syntax Flashcards", instructions: "Quick review of truthy/falsy rules and operator precedence.", learningObjective: "Eliminate syntax hesitations", expectedDurationMinutes: 30, difficulty: "beginner", category: "revision", requiredResources: "Flashcards", expectedOutput: "Revision completed", completionCriteria: "100% on operator precedence drill" },
          // Day 5
          { dayOfWeek: 5, title: "String Manipulation and Command Parsing", instructions: "Parse serial strings formatted as 'MOTOR:L:120,R:120' into component commands.", learningObjective: "Serial command parsing fundamentals", expectedDurationMinutes: 60, difficulty: "beginner", category: "practical", requiredResources: "Serial Communication Handout", expectedOutput: "command_parser.py", completionCriteria: "Extracts target motor and PWM values correctly" },
          { dayOfWeek: 5, title: "Comprehensive Problem Solving Lab", instructions: "Solve 10 algorithm challenges focusing on conditionals, type conversions, and boundary checks.", learningObjective: "Algorithmic problem solving", expectedDurationMinutes: 90, difficulty: "beginner", category: "exercise", requiredResources: "LeetCode / HackerRank Beginner", expectedOutput: "10 solved script solutions", completionCriteria: "All 10 scripts pass provided test cases" },
          { dayOfWeek: 5, title: "AMR Serial Protocol Design", instructions: "Draft the serial packet structure for communication between Python and ESP32 microcontroller.", learningObjective: "Define system interface contracts", expectedDurationMinutes: 90, difficulty: "beginner", category: "project", requiredResources: "Serial Protocol RFC", expectedOutput: "serial_protocol_spec.md", completionCriteria: "Documented packet header, payload, and checksum" },
          { dayOfWeek: 5, title: "Code Formatting & Linting", instructions: "Run Black and Flake8 on all week 1 scripts, fix formatting warnings.", learningObjective: "Production code hygiene", expectedDurationMinutes: 30, difficulty: "beginner", category: "revision", requiredResources: "Black Formatter", expectedOutput: "Clean linted codebase", completionCriteria: "Clean git diff" },
          // Day 6
          { dayOfWeek: 6, title: "Weekly Project Integration: Robot Telemetry Validator", instructions: "Combine serial parser, kinematics calc, and safety interlocks into a unified Python module.", learningObjective: "Component integration", expectedDurationMinutes: 120, difficulty: "intermediate", category: "project", requiredResources: "Week 1 Scripts", expectedOutput: "robot_validator_tool.py", completionCriteria: "Executes without exceptions across 20 mock packets" },
          { dayOfWeek: 6, title: "Weekly Demonstration Preparation", instructions: "Record terminal demo of kinematics calculator and push to local git branch.", learningObjective: "Technical demonstration", expectedDurationMinutes: 90, difficulty: "beginner", category: "practical", requiredResources: "Terminal recorder", expectedOutput: "Demo script and sample log", completionCriteria: "Outputs clear verification table" },
          { dayOfWeek: 6, title: "Pre-Assessment Self Evaluation", instructions: "Review Week 1 learning objectives checklist and prepare for quiz.", learningObjective: "Identify knowledge gaps", expectedDurationMinutes: 60, difficulty: "beginner", category: "revision", requiredResources: "Roadmap Checklist", expectedOutput: "Checklist completed", completionCriteria: "Ready for assessment" },
          // Day 7: REST, REVIEW & QUIZ DAY
          { dayOfWeek: 7, title: "Week 1 Robotics Programming Assessment", instructions: "Complete the timed 10-question Python fundamentals evaluation.", learningObjective: "Formal knowledge validation", expectedDurationMinutes: 45, difficulty: "intermediate", category: "assessment", requiredResources: "Robo Mates Quiz Engine", expectedOutput: "Completed quiz submission", completionCriteria: "Score >= 80%" },
          { dayOfWeek: 7, title: "Git Push & Weekly Reflection", instructions: "Commit clean code to GitHub, write 3-sentence summary of week 1 learnings, and rest.", learningObjective: "Weekly consolidation & rest", expectedDurationMinutes: 45, difficulty: "beginner", category: "revision", requiredResources: "GitHub Repository", expectedOutput: "Pushed commit and reflection", completionCriteria: "Clean working tree, rested mind" },
        ],
      },
      // WEEKS 2 to 4
      {
        weekNumber: 2,
        title: "Loops, Functions and Compound Data Structures",
        learningObjective: "Write reusable functions, iterate with loops, and manipulate lists, tuples, dicts, and sets.",
        deliverable: "CLI Task Manager & Sensor Telemetry Buffer.",
        assessmentTitle: "Week 2 Coding Assessment",
        assessmentQuestions: [
          { question: "What is the time complexity of searching a value in a Python dictionary vs list?", type: "multiple_choice", options: ["O(1) vs O(n)", "O(n) vs O(1)", "Both O(1)"], correctAnswer: "O(1) vs O(n)" },
          { question: "Why are tuples preferred over lists for immutable coordinates?", type: "short_answer" },
        ],
        dailyTasks: [
          { dayOfWeek: 1, title: "For and While Loops Mechanics", instructions: "Implement counter loops, while loops with break/continue, and list iterations.", learningObjective: "Iteration mastery", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "Python Tutorial", expectedOutput: "loops_practice.py", completionCriteria: "Passes 10 loop exercises" },
          { dayOfWeek: 1, title: "Function Signatures, Default Args and Keyword Arguments", instructions: "Write modular mathematical functions calculating angular velocity and acceleration.", learningObjective: "Functional modularity", expectedDurationMinutes: 75, difficulty: "beginner", category: "practical", requiredResources: "Python Functions Guide", expectedOutput: "math_utils.py", completionCriteria: "5 pure functions with type hints" },
          { dayOfWeek: 1, title: "AMR Sensor Rolling Buffer", instructions: "Implement a circular buffer with list and while loop to compute moving average of distance readings.", learningObjective: "Sensor noise filtering", expectedDurationMinutes: 90, difficulty: "intermediate", category: "project", requiredResources: "Moving Average Paper", expectedOutput: "moving_average_filter.py", completionCriteria: "Smooths noisy synthetic stream" },
          { dayOfWeek: 1, title: "Daily Practice & Revision", instructions: "Submit 5 list comprehension exercises.", learningObjective: "List comprehension fluency", expectedDurationMinutes: 45, difficulty: "beginner", category: "exercise", requiredResources: "Python Shell", expectedOutput: "5 comprehensions", completionCriteria: "All 5 produce valid filtered lists" },
          { dayOfWeek: 7, title: "Week 2 Knowledge Assessment & Review", instructions: "Complete Week 2 assessment on functions and data structures.", learningObjective: "Validate compound data structures", expectedDurationMinutes: 60, difficulty: "intermediate", category: "assessment", requiredResources: "Robo Mates Quiz Engine", expectedOutput: "Score report", completionCriteria: "Score >= 80%" },
        ],
      },
      {
        weekNumber: 3,
        title: "Object-Oriented Programming and Modular Architecture",
        learningObjective: "Model robotics hardware using Python classes, inheritance, encapsulation, and modules.",
        deliverable: "Robot, Sensor, and MotorDriver OOP module.",
        assessmentTitle: "Week 3 OOP Assessment",
        assessmentQuestions: [
          { question: "What is the purpose of the __init__ method in a Python class?", type: "short_answer" },
          { question: "How does inheritance promote code reuse in robotics software?", type: "short_answer" },
        ],
        dailyTasks: [
          { dayOfWeek: 1, title: "Classes, Objects and the Self Parameter", instructions: "Create a RobotChassis class storing wheel diameter, track width, and maximum speed.", learningObjective: "OOP foundation", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "Python OOP Guide", expectedOutput: "chassis_class.py", completionCriteria: "Class instantiates and calculates limits" },
          { dayOfWeek: 1, title: "Inheritance: Base Sensor and Ultrasonic/LiDAR Subclasses", instructions: "Create BaseSensor parent class and inherit UltrasonicSensor and LidarSensor with custom read() methods.", learningObjective: "Polymorphism and inheritance", expectedDurationMinutes: 90, difficulty: "intermediate", category: "practical", requiredResources: "OOP Inheritance Patterns", expectedOutput: "sensor_hierarchy.py", completionCriteria: "Polymorphic loop reads from all sensor instances" },
          { dayOfWeek: 1, title: "AMR DriveBase Controller Class", instructions: "Build DiffDriveController class with methods move(v, w), stop(), and get_telemetry().", learningObjective: "Encapsulate robot actuation", expectedDurationMinutes: 90, difficulty: "intermediate", category: "project", requiredResources: "Diff Drive Kinematics", expectedOutput: "diff_drive_controller.py", completionCriteria: "Accurately updates simulated pose (x, y, theta)" },
          { dayOfWeek: 7, title: "Week 3 Practical OOP Assessment", instructions: "Build and submit an automated robot telemetry logger class.", learningObjective: "Complete independent OOP deliverable", expectedDurationMinutes: 60, difficulty: "intermediate", category: "assessment", requiredResources: "Robo Mates Evaluation Suite", expectedOutput: "Validated OOP module", completionCriteria: "Passes automated unit tests" },
        ],
      },
      {
        weekNumber: 4,
        title: "Git, Linux Terminal and Python Automation Capstone",
        learningObjective: "Master Linux terminal commands, bash automation, and Git version control workflows.",
        deliverable: "Month 1 Capstone: Autonomous Log Analyzer CLI Tool.",
        assessmentTitle: "Month 1 Capstone Evaluation",
        assessmentQuestions: [
          { question: "Which command shows running background processes in Ubuntu Linux?", type: "multiple_choice", options: ["ps aux", "ls -la", "grep run", "cat /proc"], correctAnswer: "ps aux" },
          { question: "What does git commit -m vs git commit -am do?", type: "short_answer" },
        ],
        dailyTasks: [
          { dayOfWeek: 1, title: "Linux File System Hierarchy & CLI Essentials", instructions: "Master cd, ls, mkdir, rm, grep, chmod, and environment variables in Ubuntu.", learningObjective: "Linux command line fluency", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "Ubuntu CLI Guide", expectedOutput: "Terminal command cheat-sheet", completionCriteria: "Can navigate and manipulate files via CLI alone" },
          { dayOfWeek: 1, title: "Git Branching, Stashing, and Rebase Workflow", instructions: "Practice feature-branch development, resolving merge conflicts, and stashing uncommitted changes.", learningObjective: "Collaborative Git workflow", expectedDurationMinutes: 90, difficulty: "intermediate", category: "practical", requiredResources: "Pro Git Book", expectedOutput: "Verified GitHub commit graph", completionCriteria: "PR merged cleanly into main" },
          { dayOfWeek: 1, title: "Month 1 Capstone: Robot Telemetry Log Analyzer", instructions: "Develop full Python CLI reading CSV/JSON robot flight-logs, calculating total distance, and detecting e-stop triggers.", learningObjective: "End-to-end integration", expectedDurationMinutes: 120, difficulty: "intermediate", category: "project", requiredResources: "AMR Telemetry Sample Files", expectedOutput: "telemetry_analyzer.py with CLI flags (--file, --summary)", completionCriteria: "Generates formatted summary report" },
          { dayOfWeek: 7, title: "Month 1 Comprehensive Engineering Evaluation", instructions: "Demonstrate Month 1 Capstone and complete monthly evaluation quiz.", learningObjective: "Certify Month 1 Competency", expectedDurationMinutes: 90, difficulty: "intermediate", category: "assessment", requiredResources: "Robo Mates Assessment Portal", expectedOutput: "Published GitHub repo & quiz score", completionCriteria: "Score >= 80%, clean documentation" },
        ],
      },
    ],
  },
  // MONTHS 2 TO 12
  {
    monthNumber: 2,
    title: "C++ and Electronics Fundamentals",
    description: "C++ installation, pointers, memory management, and physical electronics (Ohm's law, multimeters, circuit analysis).",
    mainSubjects: ["C++", "Electronics", "Circuits", "Sensors"],
    deliverable: "C++ Robotics math library & breadboard sensor measurement lab report.",
    estimatedHours: 130,
    learningObjectives: ["Understand C++ pointers and memory", "Analyze series/parallel circuits with Ohm's law", "Measure voltage and current with a multimeter"],
    assessmentCriteria: ["Pass C++ pointers quiz", "Practical electronics lab sign-off"],
    weeks: [
      {
        weekNumber: 5,
        title: "C++ Environment and Variables",
        learningObjective: "Configure GCC/Clang, understand compiled languages, primitives, and headers.",
        deliverable: "Compiled C++ kinematics calculator.",
        assessmentTitle: "Week 5 C++ Intro Quiz",
        assessmentQuestions: [{ question: "Why is C++ preferred over Python for real-time motor control loops?", type: "short_answer" }],
        dailyTasks: [
          { dayOfWeek: 1, title: "C++ Compiler & CMake Toolchain", instructions: "Install build-essential, g++, and CMake on Ubuntu.", learningObjective: "C++ build system", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "C++ Setup Guide", expectedOutput: "Working CMakeLists.txt", completionCriteria: "Compiles hello_robot.cpp" },
          { dayOfWeek: 7, title: "Week 5 Assessment & Rest", instructions: "Submit week 5 code and review.", learningObjective: "Review", expectedDurationMinutes: 45, difficulty: "beginner", category: "assessment", requiredResources: "Assessment", expectedOutput: "Quiz result", completionCriteria: "Score >= 80%" },
        ],
      },
      {
        weekNumber: 6,
        title: "C++ Loops, Pointers and Memory",
        learningObjective: "Master pointer arithmetic, dereferencing, dynamic allocation, and references.",
        deliverable: "Dynamic array sensor buffer in C++.",
        assessmentTitle: "Week 6 Pointers Assessment",
        assessmentQuestions: [{ question: "What is a segmentation fault?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Pointer Fundamentals", instructions: "Understand & and * operators.", learningObjective: "Pointers", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "Pointers Handout", expectedOutput: "pointers.cpp", completionCriteria: "No memory leaks with Valgrind" }],
      },
      {
        weekNumber: 7,
        title: "C++ Classes and Object Lifecycles",
        learningObjective: "Implement constructors, destructors, RAII, and encapsulation in C++.",
        deliverable: "C++ MotorController class with unit tests.",
        assessmentTitle: "Week 7 C++ OOP Quiz",
        assessmentQuestions: [{ question: "What is RAII in C++?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Constructors and Destructors", instructions: "Implement RAII pattern.", learningObjective: "RAII", expectedDurationMinutes: 60, difficulty: "intermediate", category: "practical", requiredResources: "C++ Primer", expectedOutput: "motor.cpp", completionCriteria: "Clean compilation" }],
      },
      {
        weekNumber: 8,
        title: "Electronics Fundamentals and Circuit Analysis",
        learningObjective: "Apply Ohm's law, build voltage dividers, and measure circuits with a multimeter.",
        deliverable: "Sensor voltage divider circuit with breadboard demo.",
        assessmentTitle: "Week 8 Electronics Assessment",
        assessmentQuestions: [{ question: "Calculate the current through a 220-ohm resistor with 5V applied.", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Ohm's Law: V = I * R", instructions: "Calculate resistance for 20mA LED on 5V supply.", learningObjective: "Circuit math", expectedDurationMinutes: 60, difficulty: "beginner", category: "theory", requiredResources: "Electronics Handout", expectedOutput: "Calculations sheet", completionCriteria: "Correct resistor chosen" }],
      },
    ],
  },
  // MONTH 3: EMBEDDED SYSTEMS
  {
    monthNumber: 3,
    title: "Embedded Systems: Arduino and ESP32",
    description: "Microcontroller programming, GPIO, ADC, PWM motor drivers (L298N/DRV8833), and sensor interfacing.",
    mainSubjects: ["ESP32", "Arduino", "PWM", "Motor Drivers", "Sensors"],
    deliverable: "Autonomous obstacle-detection robot car prototype.",
    estimatedHours: 135,
    learningObjectives: ["Flash firmware to ESP32", "Control DC motors via H-Bridge PWM", "Read analog and digital sensors in real-time"],
    assessmentCriteria: ["Demonstrate functional motor driver control", "Complete obstacle-avoidance test track"],
    weeks: [
      {
        weekNumber: 9,
        title: "ESP32 Architecture and GPIO Control",
        learningObjective: "Understand microcontrollers, registers, and digital input/output.",
        deliverable: "Button-controlled LED state machine firmware.",
        assessmentTitle: "Week 9 GPIO Assessment",
        assessmentQuestions: [{ question: "What is debounce and why is it needed for physical buttons?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "ESP32 Pinout and Arduino Core Setup", instructions: "Install ESP32 board definitions in Arduino IDE / PlatformIO.", learningObjective: "Firmware setup", expectedDurationMinutes: 60, difficulty: "beginner", category: "practical", requiredResources: "ESP32 Datasheet", expectedOutput: "Blink script on ESP32", completionCriteria: "Firmware uploads successfully" }],
      },
      {
        weekNumber: 10,
        title: "Analog Inputs, ADC and Sensor Interfacing",
        learningObjective: "Read analog sensors, calibrate raw ADC values, and transmit over Serial.",
        deliverable: "Calibrated potentiometer & light sensor serial telemetry.",
        assessmentTitle: "Week 10 ADC Assessment",
        assessmentQuestions: [{ question: "What is the resolution of the ESP32 ADC in bits?", type: "multiple_choice", options: ["10-bit", "12-bit", "16-bit"], correctAnswer: "12-bit" }],
        dailyTasks: [{ dayOfWeek: 1, title: "ESP32 ADC Attenuation and Voltage Mapping", instructions: "Configure analogReadResolution(12) and map voltage curves.", learningObjective: "ADC calibration", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "ADC Guide", expectedOutput: "calibrated_adc.ino", completionCriteria: "Accurate within 50mV" }],
      },
      {
        weekNumber: 11,
        title: "PWM, H-Bridges and Motor Control",
        learningObjective: "Generate PWM signals to control DC motor speed and direction using H-bridge drivers.",
        deliverable: "Dual DC motor driver test bench with ramp up/down routines.",
        assessmentTitle: "Week 11 Motor Driver Assessment",
        assessmentQuestions: [{ question: "How does an H-bridge reverse the direction of a DC motor?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "PWM Duty Cycle and Motor Speed Control", instructions: "Configure ledcAttachPin on ESP32 to modulate motor voltage.", learningObjective: "PWM generation", expectedDurationMinutes: 60, difficulty: "intermediate", category: "practical", requiredResources: "Motor Driver Datasheet", expectedOutput: "motor_pwm.ino", completionCriteria: "Smooth speed control from 0 to 100%" }],
      },
      {
        weekNumber: 12,
        title: "Sensors & Obstacle Avoidance Car",
        learningObjective: "Integrate HC-SR04 ultrasonic sensors, motor drivers, and logic into an autonomous robot car.",
        deliverable: "Complete obstacle avoidance mobile robot demonstration.",
        assessmentTitle: "Month 3 Capstone Evaluation",
        assessmentQuestions: [{ question: "How does an ultrasonic sensor calculate distance from sound waves?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "HC-SR04 PulseIn Timing and Distance Calculation", instructions: "Trigger 10us pulse and compute distance from echo return duration.", learningObjective: "Acoustic sensor math", expectedDurationMinutes: 60, difficulty: "intermediate", category: "practical", requiredResources: "HC-SR04 Datasheet", expectedOutput: "ultrasonic_car.ino", completionCriteria: "Stops car 15cm before obstacle" }],
      },
    ],
  },
  // MONTH 4: MECHATRONICS AND CONTROL SYSTEMS
  {
    monthNumber: 4,
    title: "Mechatronics and PID Control Systems",
    description: "Wheel encoders, odometry calculation, closed-loop speed control, and PID tuning.",
    mainSubjects: ["Encoders", "PID", "Odometry", "Feedback Control"],
    deliverable: "PID-controlled motorized differential drive robot base.",
    estimatedHours: 140,
    learningObjectives: ["Read optical/magnetic wheel encoders with interrupts", "Compute odometry pose (x, y, theta)", "Tune Proportional-Integral-Derivative (PID) controller"],
    assessmentCriteria: ["Demonstrate straight-line travel with encoder feedback", "PID response curve with minimal overshoot"],
    weeks: [
      {
        weekNumber: 13,
        title: "Motors, Torque, RPM and Gear Ratios",
        learningObjective: "Calculate robot chassis acceleration, wheel torque, and gearbox efficiency.",
        deliverable: "AMR powertrain mechanical calculations sheet.",
        assessmentTitle: "Week 13 Powertrain Quiz",
        assessmentQuestions: [{ question: "If motor speed is 6000 RPM with a 50:1 gearbox, what is wheel RPM?", type: "multiple_choice", options: ["120 RPM", "300 RPM", "50 RPM"], correctAnswer: "120 RPM" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Torque vs Speed Characteristics", instructions: "Calculate stall torque, working torque, and required wheel power for 5kg AMR.", learningObjective: "Mechanical sizing", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "Motor Sizing Guide", expectedOutput: "torque_calc.py", completionCriteria: "Meets 0.5m/s top speed requirement" }],
      },
      {
        weekNumber: 14,
        title: "Wheel Encoders and Odometry",
        learningObjective: "Decode quadrature encoder signals via hardware interrupts to track distance.",
        deliverable: "Encoder ticks-to-meters odometry tracking node.",
        assessmentTitle: "Week 14 Encoders Assessment",
        assessmentQuestions: [{ question: "Why do quadrature encoders have Channel A and Channel B 90 degrees out of phase?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Interrupt Service Routines (ISRs) for Encoders", instructions: "Write attachInterrupt handler to count pulses on rising edge of Channel A.", learningObjective: "Fast hardware interrupts", expectedDurationMinutes: 60, difficulty: "advanced", category: "practical", requiredResources: "ESP32 Interrupts Guide", expectedOutput: "encoder_isr.ino", completionCriteria: "Zero missed pulses at 100 RPM" }],
      },
      {
        weekNumber: 15,
        title: "Closed-Loop Speed Control",
        learningObjective: "Compare open-loop PWM control with closed-loop RPM regulation.",
        deliverable: "Benchmarked speed controller holding constant RPM under load.",
        assessmentTitle: "Week 15 Control Theory Quiz",
        assessmentQuestions: [{ question: "What is the difference between open-loop and closed-loop control?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Feedback Error Computation", instructions: "Compute error = target_rpm - measured_rpm in real-time control loop.", learningObjective: "Control loop architecture", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "Control Systems Primer", expectedOutput: "speed_controller.ino", completionCriteria: "Calculates error at 50Hz" }],
      },
      {
        weekNumber: 16,
        title: "PID Controller Fundamentals and Tuning",
        learningObjective: "Implement P, I, and D terms, understand Ziegler-Nichols tuning, and eliminate steady-state error.",
        deliverable: "Tuned PID motor controller with live telemetry plots.",
        assessmentTitle: "Week 16 PID Assessment",
        assessmentQuestions: [{ question: "What problem occurs if the Integral gain (Ki) is set too high?", type: "multiple_choice", options: ["Integral windup and oscillations", "System becomes sluggish", "Derivative kick"], correctAnswer: "Integral windup and oscillations" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Implementing Discrete PID Algorithm in C++", instructions: "Write PID class with proportional, anti-windup integral, and filtered derivative.", learningObjective: "Discrete PID implementation", expectedDurationMinutes: 75, difficulty: "advanced", category: "practical", requiredResources: "PID Algorithm RFC", expectedOutput: "pid_controller.cpp", completionCriteria: "Stable response on test bench" }],
      },
      {
        weekNumber: 17,
        title: "Differential-Drive Robot Base Integration",
        learningObjective: "Combine dual PID motor loops, chassis geometry, and reliable robot base demonstration.",
        deliverable: "Month 4 Capstone: Calibrated differential-drive robot base running straight line.",
        assessmentTitle: "Month 4 Capstone Evaluation",
        assessmentQuestions: [{ question: "How does chassis track width affect angular rotation velocity?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Integrated Diff-Drive Base Demo", instructions: "Demonstrate robot driving 2 meters in a straight line with < 2cm lateral drift.", learningObjective: "Precision kinematics", expectedDurationMinutes: 90, difficulty: "advanced", category: "project", requiredResources: "AMR Prototype", expectedOutput: "Demonstration video & logs", completionCriteria: "Drift within tolerance" }],
      },
    ],
  },
  // MONTH 5: ROS 2 FUNDAMENTALS
  {
    monthNumber: 5,
    title: "ROS 2 Fundamentals and Architecture",
    description: "Linux ROS 2 environment, colcon build tools, nodes, topics, publishers, subscribers, services, and launch files.",
    mainSubjects: ["ROS 2", "Ubuntu", "rclpy", "PubSub", "DDS"],
    deliverable: "Custom ROS 2 workspace with sensor publishers, telemetry subscribers, and launch architecture.",
    estimatedHours: 135,
    learningObjectives: ["Understand ROS 2 computational graph", "Write clean rclpy publishers and subscribers", "Manage multi-node launch files and custom message types"],
    assessmentCriteria: ["Pass ROS 2 CLI & PubSub practical exam", "Colcon build executes with 0 warnings"],
    weeks: [
      {
        weekNumber: 18,
        title: "ROS 2 Environment, Workspaces and Colcon",
        learningObjective: "Install ROS 2 (Humble/Jazzy), configure dev overlay workspace, and build packages.",
        deliverable: "Configured robomates_ws with successful colcon build.",
        assessmentTitle: "Week 18 ROS 2 Setup Quiz",
        assessmentQuestions: [{ question: "What is an underlay vs overlay workspace in ROS 2?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "ROS 2 Installation and Sourcing in Bashrc", instructions: "Install ros-humble-desktop and configure ROS_DOMAIN_ID.", learningObjective: "Environment setup", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "ROS 2 Docs", expectedOutput: "echo $ROS_DISTRO prints active version", completionCriteria: "Environment sourced cleanly" }],
      },
      {
        weekNumber: 19,
        title: "Nodes, Topics and Publishers/Subscribers",
        learningObjective: "Write Python nodes using rclpy to publish telemetry and subscribe to velocity commands.",
        deliverable: "Wheel velocity publisher and odometry subscriber nodes.",
        assessmentTitle: "Week 19 PubSub Assessment",
        assessmentQuestions: [{ question: "What is the role of DDS in ROS 2 communication?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Writing a Python Publisher Node with rclpy", instructions: "Create MinimalPublisher publishing geometry_msgs/msg/Twist.", learningObjective: "Publisher mechanics", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "rclpy Tutorials", expectedOutput: "teleop_pub.py", completionCriteria: "ros2 topic echo confirms message arrival" }],
      },
      {
        weekNumber: 20,
        title: "Services, Actions and Custom Messages",
        learningObjective: "Implement request/response Services and goal-driven Actions with feedback.",
        deliverable: "Battery check service and navigate-to-waypoint action server.",
        assessmentTitle: "Week 20 Services & Actions Quiz",
        assessmentQuestions: [{ question: "When should an Action be used instead of a Service?", type: "multiple_choice", options: ["For long-running tasks that provide progress feedback", "For instantaneous sensor reads", "When no return data is needed"], correctAnswer: "For long-running tasks that provide progress feedback" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Action Server Implementation in Python", instructions: "Create an action server accepting distance goals and reporting remaining centimeters.", learningObjective: "Action interface", expectedDurationMinutes: 75, difficulty: "advanced", category: "practical", requiredResources: "ROS 2 Actions Guide", expectedOutput: "drive_action_server.py", completionCriteria: "Handles goal cancellation and completion" }],
      },
      {
        weekNumber: 21,
        title: "ROS 2 Launch Files and Parameter Management",
        learningObjective: "Write Python launch files that start multiple nodes with parameter overrides.",
        deliverable: "Production bringup.launch.py starting robot driver nodes.",
        assessmentTitle: "Month 5 Capstone Evaluation",
        assessmentQuestions: [{ question: "How are parameters passed dynamically in a ROS 2 launch file?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Creating a Modular Launch File", instructions: "Assemble bringup launch file spawning sensor node, controller node, and logger.", learningObjective: "Launch orchestration", expectedDurationMinutes: 90, difficulty: "intermediate", category: "project", requiredResources: "Launch Tutorials", expectedOutput: "bringup.launch.py", completionCriteria: "Single command starts all 3 nodes" }],
      },
    ],
  },
  // MONTH 6: ROBOT MODELLING AND SIMULATION
  {
    monthNumber: 6,
    title: "Robot Modelling, TF2 and Gazebo Simulation",
    description: "Coordinate frames, TF2 transformations, URDF, Xacro macros, RViz visualization, and Gazebo physics simulation.",
    mainSubjects: ["TF2", "URDF", "Xacro", "RViz", "Gazebo"],
    deliverable: "Complete simulated AMR robot model driving in Gazebo with visualized TF tree in RViz.",
    estimatedHours: 140,
    learningObjectives: ["Master coordinate transformation trees with TF2", "Build parametric robot descriptions with URDF and Xacro", "Simulate differential drive physics, friction, and sensors in Gazebo"],
    assessmentCriteria: ["TF tree has 0 disconnected branches in RViz", "Simulated AMR drives via teleop in Gazebo"],
    weeks: [
      {
        weekNumber: 22,
        title: "Coordinate Systems, Reference Frames and TF2",
        learningObjective: "Understand map -> odom -> base_link -> laser coordinate hierarchies and TF2 broadcasters.",
        deliverable: "TF2 static and dynamic broadcaster nodes.",
        assessmentTitle: "Week 22 TF2 Assessment",
        assessmentQuestions: [{ question: "Why must base_link to base_laser transform be published in ROS?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "REP 105 Coordinate Frame Standards", instructions: "Study earth, map, odom, base_footprint, and base_link conventions.", learningObjective: "Robotics coordinate standards", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "REP 105 Specification", expectedOutput: "TF diagram of AMR", completionCriteria: "Matches ROS 2 navigation standard" }],
      },
      {
        weekNumber: 23,
        title: "URDF and Xacro Robot Descriptions",
        learningObjective: "Define chassis link, wheel joints, inertias, collision geometries, and visual meshes.",
        deliverable: "Parametric robot.urdf.xacro for the ROBO MATES AMR.",
        assessmentTitle: "Week 23 URDF Quiz",
        assessmentQuestions: [{ question: "What is the difference between visual and collision tags in URDF?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Writing Robot Links and Continuous Joints", instructions: "Write Xacro macros generating left and right drive wheels with mass and inertia.", learningObjective: "URDF kinematics", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "URDF Tutorials", expectedOutput: "wheels.xacro", completionCriteria: "Check_urdf passes syntax test" }],
      },
      {
        weekNumber: 24,
        title: "RViz2 Visualizations and Joint State Publisher",
        learningObjective: "Visualize robot model in RViz2 and animate joints with joint_state_publisher_gui.",
        deliverable: "RViz configuration file displaying 3D AMR model with coordinate axes.",
        assessmentTitle: "Week 24 RViz2 Assessment",
        assessmentQuestions: [{ question: "What does the Robot State Publisher node do with URDF?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "RViz Display Configuration", instructions: "Add RobotModel, TF, and Grid displays in RViz2, save amr.rviz config.", learningObjective: "3D visualization", expectedDurationMinutes: 60, difficulty: "intermediate", category: "practical", requiredResources: "RViz2 User Guide", expectedOutput: "amr.rviz", completionCriteria: "Model loads without transform errors" }],
      },
      {
        weekNumber: 25,
        title: "Gazebo Physics Simulation and Differential Drive Plugin",
        learningObjective: "Spawn the Xacro robot into Gazebo world and control movement with gazebo_ros_diff_drive plugin.",
        deliverable: "Simulated AMR driving in indoor warehouse Gazebo world.",
        assessmentTitle: "Month 6 Capstone Evaluation",
        assessmentQuestions: [{ question: "How do friction parameters (mu1, mu2) in Gazebo affect wheel slip?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Diff Drive Gazebo Plugin Integration", instructions: "Configure <gazebo> tags with wheel separation and wheel diameter in Xacro.", learningObjective: "Physics engine integration", expectedDurationMinutes: 90, difficulty: "advanced", category: "project", requiredResources: "Gazebo ROS Plugin Docs", expectedOutput: "gazebo_amr.launch.py", completionCriteria: "Robot responds to cmd_vel topics in simulation" }],
      },
    ],
  },
  // MONTH 7: LOCALIZATION AND NAVIGATION (NAV2)
  {
    monthNumber: 7,
    title: "Localization, Mapping and Nav2 Navigation",
    description: "Odometry estimation, occupancy grid mapping, costmaps, A* and Dijkstra path planning, and Nav2 navigation stack.",
    mainSubjects: ["Nav2", "SLAM", "Occupancy Grids", "Costmaps", "Localization"],
    deliverable: "Autonomous waypoint navigation in simulation with obstacle avoidance.",
    estimatedHours: 145,
    learningObjectives: ["Understand occupancy grid maps", "Configure Nav2 global and local costmaps", "Command autonomous goal navigation with recovery behaviors"],
    assessmentCriteria: ["Robot reaches 5 sequential navigation waypoints without collisions"],
    weeks: [
      {
        weekNumber: 26,
        title: "Odometry and Coordinate Frame Localization",
        learningObjective: "Integrate wheel encoder velocities into an odom transform frame.",
        deliverable: "Wheel odometry broadcaster with drift analysis.",
        assessmentTitle: "Week 26 Odometry Quiz",
        assessmentQuestions: [{ question: "Why does pure wheel odometry accumulate error over distance?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Dead Reckoning Math", instructions: "Compute dx, dy, dtheta and integrate over time steps.", learningObjective: "Odometry calculation", expectedDurationMinutes: 60, difficulty: "intermediate", category: "theory", requiredResources: "Probabilistic Robotics Ch 5", expectedOutput: "odom_calc.py", completionCriteria: "Produces valid odom pose" }],
      },
      {
        weekNumber: 27,
        title: "Occupancy Grids and 2D Map Representation",
        learningObjective: "Understand log-odds representation of obstacle probabilities in 2D grid maps.",
        deliverable: "Saved 2D occupancy grid map of test environment (map.yaml + map.pgm).",
        assessmentTitle: "Week 27 Mapping Assessment",
        assessmentQuestions: [{ question: "What values do pixels in an occupancy grid map represent (0, 100, -1)?", type: "multiple_choice", options: ["0=free, 100=occupied, -1=unknown", "0=occupied, 100=free", "Always binary"], correctAnswer: "0=free, 100=occupied, -1=unknown" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Nav2 Map Server Configuration", instructions: "Configure nav2_map_server to publish map topic.", learningObjective: "Map serving", expectedDurationMinutes: 60, difficulty: "intermediate", category: "practical", requiredResources: "Nav2 Docs", expectedOutput: "map_server.launch.py", completionCriteria: "Map renders in RViz" }],
      },
      {
        weekNumber: 28,
        title: "Nav2 Architecture: Costmaps and Planners",
        learningObjective: "Configure global costmap (inflation, static layer) and global path planner (NavFn/SmacPlanner).",
        deliverable: "Nav2 parameters YAML with tuned inflation radius.",
        assessmentTitle: "Week 28 Nav2 Architecture Quiz",
        assessmentQuestions: [{ question: "What is an inflation layer in a costmap and why is it essential?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Costmap Inflation Radius Tuning", instructions: "Set robot footprint and calculate optimal inflation decay to avoid wall scrapes.", learningObjective: "Costmap tuning", expectedDurationMinutes: 75, difficulty: "advanced", category: "practical", requiredResources: "Nav2 Costmap Tuning Guide", expectedOutput: "nav2_params.yaml", completionCriteria: "Safe clearance around obstacles" }],
      },
      {
        weekNumber: 29,
        title: "Local Controllers and Obstacle Avoidance",
        learningObjective: "Configure DWB local controller, obstacle avoidance, and recovery behaviors.",
        deliverable: "Tuned DWB trajectory generator avoiding dynamic obstacles.",
        assessmentTitle: "Week 29 Local Planner Quiz",
        assessmentQuestions: [{ question: "How does DWB controller evaluate candidate trajectories?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "DWB Trajectory Critic Weights", instructions: "Tune PathAlign, GoalAlign, and PathDist critics for smooth movement.", learningObjective: "Local controller tuning", expectedDurationMinutes: 90, difficulty: "advanced", category: "practical", requiredResources: "DWB Documentation", expectedOutput: "dwb_critics_tuning.txt", completionCriteria: "Smooth obstacle evasion" }],
      },
      {
        weekNumber: 30,
        title: "Autonomous Waypoint Navigation Capstone",
        learningObjective: "Command the AMR through multiple waypoints autonomously in Gazebo simulation.",
        deliverable: "Month 7 Capstone: Full autonomous waypoint run demo video and navigation log.",
        assessmentTitle: "Month 7 Capstone Evaluation",
        assessmentQuestions: [{ question: "What recovery behavior triggers when path planner fails to find a valid route?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Multi-Goal Navigation Script in Python", instructions: "Write Python script using BasicNavigator API to visit 4 target waypoints in sequence.", learningObjective: "Autonomous mission execution", expectedDurationMinutes: 120, difficulty: "advanced", category: "project", requiredResources: "Nav2 Simple Commander API", expectedOutput: "waypoint_mission.py", completionCriteria: "Visits all 4 goals successfully" }],
      },
    ],
  },
  // MONTH 8: COMPUTER VISION
  {
    monthNumber: 8,
    title: "Computer Vision and OpenCV for Robotics",
    description: "OpenCV pipeline, color filtering, contours, edge detection, camera calibration, and object perception in ROS 2.",
    mainSubjects: ["OpenCV", "Computer Vision", "Camera Calibration", "Object Perception"],
    deliverable: "Vision-based object detector tracking colored marker and outputting target coordinates.",
    estimatedHours: 135,
    learningObjectives: ["Process image streams in OpenCV", "Calibrate camera intrinsics and distortion coefficients", "Publish visual detections over ROS 2 topics"],
    assessmentCriteria: ["Pass OpenCV algorithm benchmark", "Demonstrate object tracking at >= 20 FPS"],
    weeks: [
      {
        weekNumber: 31,
        title: "OpenCV Setup, Color Spaces and Transformations",
        learningObjective: "Convert between BGR and HSV, resize, threshold, and filter image arrays.",
        deliverable: "Color-based object mask generator script.",
        assessmentTitle: "Week 31 OpenCV Basics Quiz",
        assessmentQuestions: [{ question: "Why is HSV color space preferred over RGB for color thresholding under changing lighting?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "HSV Color Space Masking", instructions: "Tune inRange thresholds to isolate red/blue robotics target markers.", learningObjective: "Color thresholding", expectedDurationMinutes: 60, difficulty: "beginner", category: "practical", requiredResources: "OpenCV Docs", expectedOutput: "hsv_filter.py", completionCriteria: "Isolates marker cleanly from background" }],
      },
      {
        weekNumber: 32,
        title: "Filtering, Thresholding, Contours and Edges",
        learningObjective: "Apply Gaussian blur, Canny edge detection, and findContours to compute bounding boxes.",
        deliverable: "Contour-based obstacle detection and area calculator.",
        assessmentTitle: "Week 32 Contours Assessment",
        assessmentQuestions: [{ question: "What does cv2.findContours return and what do hierarchy flags indicate?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Canny Edge Detection and Bounding Rectangles", instructions: "Detect edges, find outer contours, and draw cv2.boundingRect around targets.", learningObjective: "Object bounding boxes", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "OpenCV Contours Guide", expectedOutput: "contour_tracker.py", completionCriteria: "Draws accurate boxes around target shapes" }],
      },
      {
        weekNumber: 33,
        title: "Camera Calibration and Distortion Correction",
        learningObjective: "Use chessboard pattern to calculate camera intrinsic matrix (K) and distortion coefficients (D).",
        deliverable: "Calibrated camera YAML parameter file.",
        assessmentTitle: "Week 33 Camera Calibration Quiz",
        assessmentQuestions: [{ question: "What is barrel distortion and how is it corrected mathematically?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Chessboard Calibration Routine", instructions: "Capture 20 chessboard images and run cv2.calibrateCamera().", learningObjective: "Camera intrinsics", expectedDurationMinutes: 90, difficulty: "intermediate", category: "practical", requiredResources: "Checkerboard Printout", expectedOutput: "camera_info.yaml", completionCriteria: "Reprojection error < 0.5 pixels" }],
      },
      {
        weekNumber: 34,
        title: "ROS 2 Camera Pipeline and Visual Tracking",
        learningObjective: "Bridge OpenCV and ROS 2 using cv_bridge to publish detection centroids.",
        deliverable: "Month 8 Capstone: ROS 2 visual tracker publishing target (x, y) coordinates.",
        assessmentTitle: "Month 8 Capstone Evaluation",
        assessmentQuestions: [{ question: "What role does cv_bridge play between ROS 2 image messages and OpenCV matrices?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "CvBridge Vision Node", instructions: "Subscribe to /camera/image_raw, convert via cv_bridge, detect marker, publish /target_pose.", learningObjective: "Perception integration", expectedDurationMinutes: 90, difficulty: "advanced", category: "project", requiredResources: "cv_bridge Tutorials", expectedOutput: "vision_tracker_node.py", completionCriteria: "Publishes target coordinates at >= 20Hz" }],
      },
    ],
  },
  // MONTH 9: SLAM AND SENSOR FUSION
  {
    monthNumber: 9,
    title: "SLAM and Sensor Fusion",
    description: "2D LiDAR range data, IMU calibration, Extended Kalman Filter (EKF), and SLAM mapping workflows.",
    mainSubjects: ["LiDAR", "IMU", "EKF", "SLAM Toolbox", "Sensor Fusion"],
    deliverable: "Fused EKF odometry + SLAM generated accurate 2D indoor facility map.",
    estimatedHours: 140,
    learningObjectives: ["Parse LiDAR scan messages (sensor_msgs/LaserScan)", "Calibrate and read 6-DOF IMU accelerometer/gyroscope", "Fuse wheel odometry and IMU with robot_localization EKF", "Build accurate maps with SLAM Toolbox"],
    assessmentCriteria: ["SLAM map closes loops without distortion", "EKF orientation drift < 1 degree per minute"],
    weeks: [
      {
        weekNumber: 35,
        title: "2D LiDAR Range Scans and Point Clouds",
        learningObjective: "Understand laser triangulation, range arrays, scan angles, and filtering laser noise.",
        deliverable: "LiDAR scan visualizer and obstacle proximity safety zone node.",
        assessmentTitle: "Week 35 LiDAR Quiz",
        assessmentQuestions: [{ question: "What data does sensor_msgs/LaserScan contain?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "LaserScan Subscriber and Collision Sector Node", instructions: "Partition 360-degree scan into front, left, right zones and detect breaches under 30cm.", learningObjective: "LiDAR data processing", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "LaserScan Spec", expectedOutput: "lidar_safety_zone.py", completionCriteria: "Triggers virtual e-stop on breach" }],
      },
      {
        weekNumber: 36,
        title: "IMU Fundamentals and Calibration",
        learningObjective: "Calibrate accelerometer zero-g offset, gyroscope drift, and calculate yaw angle.",
        deliverable: "Calibrated IMU ROS 2 publisher broadcasting angular velocity and linear acceleration.",
        assessmentTitle: "Week 36 IMU Assessment",
        assessmentQuestions: [{ question: "Why do gyroscopes exhibit drift over time?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Gyroscope Bias Removal Routine", instructions: "Sample 1000 stationary readings and calculate mean drift offset.", learningObjective: "Sensor calibration", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "MPU6050 / BNO055 Guide", expectedOutput: "imu_calibration.py", completionCriteria: "Reduces angular drift by 90%" }],
      },
      {
        weekNumber: 37,
        title: "SLAM Principles and SLAM Toolbox",
        learningObjective: "Configure SLAM Toolbox for online synchronous mapping with loop closure.",
        deliverable: "Configured slam_toolbox_params.yaml for differential-drive AMR.",
        assessmentTitle: "Week 37 SLAM Theory Quiz",
        assessmentQuestions: [{ question: "What is loop closure in SLAM and why is it critical?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "SLAM Toolbox Tuning", instructions: "Tune minimum travel distance and scan buffer parameters for clean indoor maps.", learningObjective: "SLAM configuration", expectedDurationMinutes: 90, difficulty: "advanced", category: "practical", requiredResources: "SLAM Toolbox Docs", expectedOutput: "slam_toolbox.yaml", completionCriteria: "Generates square rooms without skew" }],
      },
      {
        weekNumber: 38,
        title: "Sensor Fusion with Robot Localization (EKF)",
        learningObjective: "Configure robot_localization node to fuse wheel odometry and IMU into robust odom frame.",
        deliverable: "Month 9 Capstone: Complete SLAM mapping run with fused EKF odometry.",
        assessmentTitle: "Month 9 Capstone Evaluation",
        assessmentQuestions: [{ question: "How does the Extended Kalman Filter fuse complementary sensors?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "EKF Configuration and Testing", instructions: "Configure ekf.yaml with covariance matrices for wheel encoders and IMU.", learningObjective: "State estimation", expectedDurationMinutes: 90, difficulty: "advanced", category: "project", requiredResources: "robot_localization Docs", expectedOutput: "ekf.yaml", completionCriteria: "Odometry matches physical wheel distance" }],
      },
    ],
  },
  // MONTH 10: ROBOT INTELLIGENCE
  {
    monthNumber: 10,
    title: "Robot Intelligence: Behavior Trees and State Machines",
    description: "Finite State Machines, BehaviorTree.CPP / PyTrees, goal dispatching, and vision-integrated behaviors.",
    mainSubjects: ["Behavior Trees", "FSM", "Decision Making", "Autonomous Missions"],
    deliverable: "Autonomous AMR mission dispatch: search, navigate to object, inspect, and return to dock.",
    estimatedHours: 140,
    learningObjectives: ["Design robot behavior trees with sequence, fallback, and action nodes", "Handle runtime exceptions, low battery interrupts, and mission aborts", "Connect computer vision perception directly to navigation targets"],
    assessmentCriteria: ["Robot executes full 3-phase mission autonomously in simulation"],
    weeks: [
      {
        weekNumber: 39,
        title: "Finite State Machines and Robot Behavior Models",
        learningObjective: "Model robot mission states: IDLE, NAVIGATING, INSPECTING, CHARGING, ERROR.",
        deliverable: "Python FSM module managing mission transitions.",
        assessmentTitle: "Week 39 FSM Quiz",
        assessmentQuestions: [{ question: "What is the primary drawback of deeply nested FSMs compared to Behavior Trees?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "FSM Architecture in Python", instructions: "Implement transitions with guard conditions and entry/exit hooks.", learningObjective: "State machine design", expectedDurationMinutes: 75, difficulty: "intermediate", category: "theory", requiredResources: "FSM Patterns", expectedOutput: "robot_fsm.py", completionCriteria: "All 5 states transition safely" }],
      },
      {
        weekNumber: 40,
        title: "Behavior Tree Architecture with PyTrees",
        learningObjective: "Construct behavior tree with Sequence, Selector, and Condition nodes.",
        deliverable: "Behavior tree XML and Python execution script.",
        assessmentTitle: "Week 40 Behavior Trees Assessment",
        assessmentQuestions: [{ question: "How does a Selector (Fallback) node handle RUNNING and SUCCESS statuses?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Building a Patrolling Behavior Tree", instructions: "Assemble tree that checks battery, navigates route, and returns to dock if battery low.", learningObjective: "Behavior tree construction", expectedDurationMinutes: 90, difficulty: "advanced", category: "practical", requiredResources: "PyTrees Guide", expectedOutput: "patrol_bt.py", completionCriteria: "Tree ticks and branches correctly" }],
      },
      {
        weekNumber: 41,
        title: "Integrating Vision Percepts into Navigation Goals",
        learningObjective: "Transform 2D camera detection pixel into 3D world navigation target coordinates.",
        deliverable: "Perception-to-goal dispatcher node.",
        assessmentTitle: "Week 41 Vision-Nav Integration Quiz",
        assessmentQuestions: [{ question: "How do you project a camera pixel to world coordinates using camera height and angle?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Coordinate Transformation from Camera to Map Frame", instructions: "Use TF2 to transform optical frame target vector into map frame coordinate.", learningObjective: "Spatial transforms", expectedDurationMinutes: 90, difficulty: "advanced", category: "practical", requiredResources: "Pinhole Camera Math", expectedOutput: "target_projector.py", completionCriteria: "Target coordinates within 5cm accuracy" }],
      },
      {
        weekNumber: 42,
        title: "Safety Watchdogs and Fault Recovery Behaviors",
        learningObjective: "Implement heartbeat monitoring, motor stall detection, and emergency graceful stops.",
        deliverable: "Safety watchdog daemon node with auto-recovery.",
        assessmentTitle: "Week 42 Safety Watchdog Quiz",
        assessmentQuestions: [{ question: "What is a dead-man switch and how is it implemented in robotics software?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Heartbeat Watchdog Implementation", instructions: "Subscribe to teleop and navigation; trigger safe stop if no packets received within 500ms.", learningObjective: "Fault tolerance", expectedDurationMinutes: 75, difficulty: "advanced", category: "practical", requiredResources: "Robotics Safety Standards", expectedOutput: "safety_watchdog.py", completionCriteria: "Stops robot on connection drop" }],
      },
      {
        weekNumber: 43,
        title: "Intelligent Robot Demonstration Capstone",
        learningObjective: "Demonstrate end-to-end intelligent mission: detect target, plan path, approach, verify, and dock.",
        deliverable: "Month 10 Capstone: Complete autonomous mission demonstration in simulated facility.",
        assessmentTitle: "Month 10 Capstone Evaluation",
        assessmentQuestions: [{ question: "Explain the complete autonomy pipeline from sensor reading to motor voltage.", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Full Autonomous Mission Execution", instructions: "Execute mission script in Gazebo; log telemetry and state transitions.", learningObjective: "Mission verification", expectedDurationMinutes: 120, difficulty: "advanced", category: "project", requiredResources: "Gazebo + Nav2 + BT", expectedOutput: "Full mission log and screen recording", completionCriteria: "Zero manual interventions required" }],
      },
    ],
  },
  // MONTH 11: PHYSICAL ROBOT INTEGRATION
  {
    monthNumber: 11,
    title: "Physical Robot Hardware Integration",
    description: "Component selection, battery power distribution, ESP32 micro-ROS bridge, real-world sensor wiring, and reliability testing.",
    mainSubjects: ["micro-ROS", "Hardware Integration", "Power Systems", "Physical Testing"],
    deliverable: "Assembled, wired, and driving physical autonomous mobile robot.",
    estimatedHours: 145,
    learningObjectives: ["Build safe power distribution (LiPo/LiFePO4 with buck converters)", "Interface ESP32 with ROS 2 via micro-ROS / serial protocol", "Perform real-world sensor calibration and navigation testing"],
    assessmentCriteria: ["Physical robot drives smoothly via ROS 2 teleop", "Continuous 1-hour physical reliability run"],
    weeks: [
      {
        weekNumber: 44,
        title: "Hardware Architecture and Power Distribution",
        learningObjective: "Design wiring harness, fuse protection, emergency kill switch, and voltage regulators.",
        deliverable: "Complete electrical schematic diagram and assembled power distribution board.",
        assessmentTitle: "Week 44 Electrical Safety Quiz",
        assessmentQuestions: [{ question: "Why must motors and compute boards have separate voltage regulation?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Power Budget and Fuse Sizing", instructions: "Calculate total current draw under load and select appropriate fuse and wire gauges.", learningObjective: "Electrical engineering", expectedDurationMinutes: 75, difficulty: "intermediate", category: "theory", requiredResources: "Wiring Gauge Table", expectedOutput: "power_schematic.pdf", completionCriteria: "All circuits fuse-protected" }],
      },
      {
        weekNumber: 45,
        title: "micro-ROS / Serial Hardware Interface",
        learningObjective: "Establish bidirectional communication between single-board computer (Raspberry Pi/Jetson) and ESP32.",
        deliverable: "Functional hardware bridge node publishing physical encoder and battery status.",
        assessmentTitle: "Week 45 Hardware Bridge Assessment",
        assessmentQuestions: [{ question: "How does micro-ROS enable microcontroller integration into ROS 2 graphs?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "micro-ROS Agent Setup and Teleop Test", instructions: "Run micro-ROS agent on SBC and verify ESP32 node discovery.", learningObjective: "Embedded-ROS bridge", expectedDurationMinutes: 90, difficulty: "advanced", category: "practical", requiredResources: "micro-ROS Docs", expectedOutput: "Physical motor response to /cmd_vel", completionCriteria: "Motors spin on teleop commands" }],
      },
      {
        weekNumber: 46,
        title: "Real-World Localization and Navigation Testing",
        learningObjective: "Test physical LiDAR and wheel odometry in real indoor room and build physical map.",
        deliverable: "Physical 2D SLAM map of learning space.",
        assessmentTitle: "Week 46 Real-World SLAM Assessment",
        assessmentQuestions: [{ question: "What physical challenges affect real LiDAR compared to simulated Gazebo scans?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Physical Room SLAM Mapping", instructions: "Drive physical robot around room to build and save 2D occupancy grid.", learningObjective: "Real-world mapping", expectedDurationMinutes: 90, difficulty: "advanced", category: "practical", requiredResources: "Physical AMR", expectedOutput: "physical_room_map.yaml", completionCriteria: "Clean loop closure in physical room" }],
      },
      {
        weekNumber: 47,
        title: "Reliability, Safety and Endurance Testing",
        learningObjective: "Stress-test battery life, motor temperature, obstacle avoidance response time, and safety interlocks.",
        deliverable: "Month 11 Capstone: Physical robot 60-minute autonomous indoor patrol demonstration.",
        assessmentTitle: "Month 11 Capstone Evaluation",
        assessmentQuestions: [{ question: "Document any wheel slip observed on floor surfaces and mitigation applied.", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "60-Minute Autonomous Endurance Test", instructions: "Command robot to patrol continuous waypoints for 1 hour; monitor battery and temperatures.", learningObjective: "Hardware reliability", expectedDurationMinutes: 120, difficulty: "advanced", category: "project", requiredResources: "Physical AMR + Multimeter", expectedOutput: "Endurance test log and video", completionCriteria: "No system crashes or stalls for 60 min" }],
      },
    ],
  },
  // MONTH 12: ENGINEERING PORTFOLIO AND CAREER
  {
    monthNumber: 12,
    title: "Engineering Portfolio, Documentation and Career",
    description: "System architecture documentation, open-source GitHub release, technical video presentation, and engineering CV.",
    mainSubjects: ["Technical Writing", "Open Source", "System Architecture", "Interview Prep"],
    deliverable: "Published open-source AMR GitHub repository, demonstration video, technical paper, and CV.",
    estimatedHours: 125,
    learningObjectives: ["Produce professional system architecture diagrams", "Document complete codebase with build instructions and Docker environment", "Prepare engineering case studies for robotics systems engineering interviews"],
    assessmentCriteria: ["Public GitHub repository with 100% complete documentation", "Passed technical capstone presentation review"],
    weeks: [
      {
        weekNumber: 48,
        title: "System Architecture and Codebase Refactoring",
        learningObjective: "Clean all ROS 2 packages, format source code, write unit tests, and remove hardcoded values.",
        deliverable: "Production-grade, PEP-8 and Google C++ style compliant robotics repository.",
        assessmentTitle: "Week 48 Code Quality Audit",
        assessmentQuestions: [{ question: "What are the benefits of Dockerizing a ROS 2 development environment?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Codebase Linting and Test Coverage", instructions: "Run colcon test and ensure all unit tests pass with 0 warnings.", learningObjective: "Code quality audit", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "colcon test", expectedOutput: "Test report with 100% passing tests", completionCriteria: "Clean test execution" }],
      },
      {
        weekNumber: 49,
        title: "Technical Documentation and GitHub Publication",
        learningObjective: "Write comprehensive README, wiring diagrams, launch instructions, and troubleshooting guide.",
        deliverable: "Published GitHub repository with architecture diagrams and quickstart guide.",
        assessmentTitle: "Week 49 Documentation Review",
        assessmentQuestions: [{ question: "What sections must a production open-source robotics README include?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Writing the Project Technical Specification", instructions: "Document kinematics, electrical schematics, software graph, and bill of materials.", learningObjective: "Technical writing", expectedDurationMinutes: 90, difficulty: "intermediate", category: "project", requiredResources: "Markdown + Mermaid", expectedOutput: "README.md and ARCHITECTURE.md", completionCriteria: "Reproducible by another engineer" }],
      },
      {
        weekNumber: 50,
        title: "Demonstration Video and Technical Presentation",
        learningObjective: "Produce 3-minute technical demonstration video showing simulation, physical build, and autonomous navigation.",
        deliverable: "High-definition technical demonstration video and presentation slide deck.",
        assessmentTitle: "Week 50 Presentation Assessment",
        assessmentQuestions: [{ question: "How do you clearly explain a complex engineering tradeoff to stakeholders?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Recording and Editing Technical Demo Video", instructions: "Record screen captures of RViz/Gazebo and physical robot navigating real environment.", learningObjective: "Engineering communication", expectedDurationMinutes: 90, difficulty: "intermediate", category: "project", requiredResources: "Screen Recorder + Camera", expectedOutput: "3-minute demo video", completionCriteria: "Clear explanation of autonomous features" }],
      },
      {
        weekNumber: 51,
        title: "Robotics Engineering CV and Interview Preparation",
        learningObjective: "Tailor robotics systems engineering resume, prepare answers for technical kinematics and ROS 2 questions.",
        deliverable: "Polished Robotics Systems Engineer CV and technical portfolio website link.",
        assessmentTitle: "Week 51 Mock Technical Interview",
        assessmentQuestions: [{ question: "Explain how you would troubleshoot an intermittent communication loss between micro-ROS and SBC.", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Resume Crafting with Project Metrics", instructions: "Highlight ROS 2, C++, SLAM, PID tuning, and physical integration with concrete quantitative metrics.", learningObjective: "Career readiness", expectedDurationMinutes: 75, difficulty: "intermediate", category: "practical", requiredResources: "Engineering Resume Template", expectedOutput: "Robotics_Systems_Engineer_CV.pdf", completionCriteria: "Reviewed against top industry profiles" }],
      },
      {
        weekNumber: 52,
        title: "Final Capstone Evaluation and Specialization Roadmap",
        learningObjective: "Final program review, certification of 365-day robotics journey, and specialization planning for year 2.",
        deliverable: "Final ROBO MATES Capstone Certification & Year 2 Commercialization Roadmap.",
        assessmentTitle: "Final Robotics Engineering Capstone Review",
        assessmentQuestions: [{ question: "What are your primary goals for commercializing or scaling the ROBO MATES AMR platform next year?", type: "short_answer" }],
        dailyTasks: [{ dayOfWeek: 1, title: "Final Capstone Review & Celebration", instructions: "Demonstrate complete system to co-founder Akshaya, record joint retrospective, celebrate 12-month completion.", learningObjective: "Celebration and forward planning", expectedDurationMinutes: 90, difficulty: "advanced", category: "assessment", requiredResources: "All Capstone Deliverables", expectedOutput: "Year 1 Completed Portfolio", completionCriteria: "52 Weeks Completed Successfully!" }],
      },
    ],
  },
];
