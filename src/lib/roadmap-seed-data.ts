// src/lib/roadmap-seed-data.ts

export interface SeedMonth {
  monthNumber: number;
  title: string;
  description: string;
  mainSubjects: string[];
  deliverable: string;
  estimatedHours: number;
  modules: {
    weekNumber: number;
    title: string;
    description: string;
    tasks: {
      title: string;
      subject: string;
      durationMinutes: number;
      priority: "low" | "medium" | "high" | "critical";
      taskType: "theory" | "practical" | "exercise" | "assessment" | "project" | "revision";
      learningObjective: string;
    }[];
  }[];
}

export const BOY_MODE_CURRICULUM: SeedMonth[] = [
  {
    monthNumber: 1,
    title: "Programming Foundations",
    description: "Master Python fundamentals, Git, GitHub workflow, and basic problem solving.",
    mainSubjects: ["Python", "Git", "Linux Basics"],
    deliverable: "Build 5 small Python automation scripts and publish to GitHub.",
    estimatedHours: 120,
    modules: [
      {
        weekNumber: 1,
        title: "Python Syntax & Flow Control",
        description: "Variables, primitive data types, conditionals, and loops.",
        tasks: [
          { title: "Study Python primitives and type conversions", subject: "Python", durationMinutes: 60, priority: "high", taskType: "theory", learningObjective: "Understand dynamic typing and memory basics" },
          { title: "Code exercises: While & For loops algorithms", subject: "Python", durationMinutes: 75, priority: "high", taskType: "exercise", learningObjective: "Write iterative solutions independently" },
          { title: "Git setup and repository creation", subject: "Git", durationMinutes: 45, priority: "medium", taskType: "practical", learningObjective: "Init, commit, branch, and push to GitHub" },
        ],
      },
      {
        weekNumber: 2,
        title: "Functions & Data Structures",
        description: "Lists, tuples, dictionaries, sets, and function scopes.",
        tasks: [
          { title: "Python dictionary & list comprehension deep-dive", subject: "Python", durationMinutes: 60, priority: "high", taskType: "theory", learningObjective: "Master O(1) lookups and clean syntax" },
          { title: "Build CLI Task Manager script", subject: "Python", durationMinutes: 90, priority: "critical", taskType: "practical", learningObjective: "Create an interactive CLI application" },
          { title: "Git branching & pull request workflow", subject: "Git", durationMinutes: 45, priority: "medium", taskType: "exercise", learningObjective: "Simulate team PR review" },
        ],
      },
      {
        weekNumber: 3,
        title: "File Handling & Error Handling",
        description: "File I/O (JSON, CSV), exceptions, and clean modular code.",
        tasks: [
          { title: "Study Python try-except-finally & custom exceptions", subject: "Python", durationMinutes: 60, priority: "medium", taskType: "theory", learningObjective: "Handle runtime faults gracefully" },
          { title: "JSON & CSV data logger parser", subject: "Python", durationMinutes: 90, priority: "high", taskType: "practical", learningObjective: "Log sensor-like data to disk" },
        ],
      },
      {
        weekNumber: 4,
        title: "Month 1 Capstone & Assessment",
        description: "Build an automated robot tele-log analyzer and pass assessment.",
        tasks: [
          { title: "Develop Robot Telemetry Log Analyzer in Python", subject: "Python", durationMinutes: 120, priority: "critical", taskType: "project", learningObjective: "Complete independent Python project" },
          { title: "Complete Month 1 Robotics Programming Quiz", subject: "Assessment", durationMinutes: 45, priority: "critical", taskType: "assessment", learningObjective: "Score >= 80% on theory & practical" },
        ],
      },
    ],
  },
  {
    monthNumber: 2,
    title: "C++, Electronics and Linux",
    description: "C++ fundamentals, basic electronics (Ohm's law, sensors), and Linux command line.",
    mainSubjects: ["C++", "Electronics", "Linux", "Arduino"],
    deliverable: "Read analog/digital sensor data with C++ and Arduino.",
    estimatedHours: 130,
    modules: [
      {
        weekNumber: 5,
        title: "Linux CLI & C++ Intro",
        description: "Linux shell, bash scripting, GCC compiler, and C++ pointers.",
        tasks: [
          { title: "Linux navigation, permissions, and grep/sed", subject: "Linux", durationMinutes: 60, priority: "high", taskType: "practical", learningObjective: "Fluency in Ubuntu terminal" },
          { title: "C++ memory model: Pointers and references", subject: "C++", durationMinutes: 90, priority: "critical", taskType: "theory", learningObjective: "Understand stack vs heap memory" },
        ],
      },
      {
        weekNumber: 6,
        title: "C++ OOP & Structures",
        description: "Classes, constructors, inheritance, and header files.",
        tasks: [
          { title: "Build RobotState and Sensor C++ classes", subject: "C++", durationMinutes: 90, priority: "high", taskType: "practical", learningObjective: "Implement clean OOP design" },
          { title: "Study basic circuit theory: V=IR, voltage dividers", subject: "Electronics", durationMinutes: 60, priority: "high", taskType: "theory", learningObjective: "Calculate resistor values for sensors" },
        ],
      },
      {
        weekNumber: 7,
        title: "Arduino & Sensor Interfacing",
        description: "Microcontroller architecture, ADC, ultrasonic and infrared sensors.",
        tasks: [
          { title: "Breadboard setup: Arduino Uno + HC-SR04 sonar", subject: "Electronics", durationMinutes: 90, priority: "high", taskType: "practical", learningObjective: "Accurately measure distance via pulses" },
          { title: "Write C++ calibration filter for analog inputs", subject: "C++", durationMinutes: 75, priority: "medium", taskType: "exercise", learningObjective: "Moving average noise filter" },
        ],
      },
      {
        weekNumber: 8,
        title: "Month 2 Assessment & Sensor Station",
        description: "Complete automated environmental & distance sensing station.",
        tasks: [
          { title: "Sensor Station Prototype Demo & Documentation", subject: "Hardware", durationMinutes: 120, priority: "critical", taskType: "project", learningObjective: "Working hardware sensor rig" },
          { title: "Month 2 Electronics & C++ Assessment", subject: "Assessment", durationMinutes: 45, priority: "critical", taskType: "assessment", learningObjective: "Pass evaluation" },
        ],
      },
    ],
  },
  {
    monthNumber: 3,
    title: "Embedded Systems and Motors",
    description: "ESP32 dual-core, FreeRTOS basics, PWM, H-bridge motor drivers, DC & servo motors.",
    mainSubjects: ["ESP32", "PWM", "Motor Drivers", "Actuators"],
    deliverable: "Build a controllable mobile robot chassis prototype.",
    estimatedHours: 140,
    modules: [
      {
        weekNumber: 9,
        title: "ESP32 Architecture & GPIOs",
        description: "ESP32 pinout, hardware timers, and FreeRTOS tasks.",
        tasks: [
          { title: "ESP32 pin mapping and interrupt service routines (ISR)", subject: "ESP32", durationMinutes: 60, priority: "high", taskType: "theory", learningObjective: "Configure hardware interrupts safely" },
          { title: "Implement dual-core tasks in FreeRTOS", subject: "ESP32", durationMinutes: 90, priority: "high", taskType: "practical", learningObjective: "Separate telemetry and control loops" },
        ],
      },
      {
        weekNumber: 10,
        title: "PWM & DC Motor Drivers",
        description: "L298N / TB6612FNG driver circuits and direction control.",
        tasks: [
          { title: "H-bridge principles and shoot-through protection", subject: "Electronics", durationMinutes: 60, priority: "high", taskType: "theory", learningObjective: "Understand motor drive topologies" },
          { title: "Wire TB6612FNG driver to dual DC motors", subject: "Motors", durationMinutes: 90, priority: "critical", taskType: "practical", learningObjective: "Test forward, reverse, and PWM speed" },
        ],
      },
      {
        weekNumber: 11,
        title: "Servo Motors & Serial Control",
        description: "PWM duty cycles for servo positioning, BLE and Serial control.",
        tasks: [
          { title: "Control 180° pan-tilt servo gimbal with ESP32", subject: "Actuators", durationMinutes: 75, priority: "medium", taskType: "practical", learningObjective: "Smooth servo positioning" },
          { title: "Implement Serial packet protocol for speed/direction", subject: "ESP32", durationMinutes: 90, priority: "high", taskType: "exercise", learningObjective: "Robust communication framing" },
        ],
      },
      {
        weekNumber: 12,
        title: "Month 3 Chassis Drive Milestone",
        description: "Complete wireless controllable mobile robot platform.",
        tasks: [
          { title: "Assemble 2WD mobile base with ESP32 controller", subject: "Hardware", durationMinutes: 150, priority: "critical", taskType: "project", learningObjective: "Controllable rolling robot" },
          { title: "Month 3 Embedded Systems Assessment", subject: "Assessment", durationMinutes: 45, priority: "critical", taskType: "assessment", learningObjective: "Validate motor control mastery" },
        ],
      },
    ],
  },
  {
    monthNumber: 4,
    title: "Mechatronics and Control Systems",
    description: "Quadrature encoders, PID velocity/position control, differential drive kinematics.",
    mainSubjects: ["PID Control", "Encoders", "Kinematics", "Mechatronics"],
    deliverable: "Build a robot driving in precise straight lines and turning exact angles.",
    estimatedHours: 135,
    modules: [],
  },
  {
    monthNumber: 5,
    title: "ROS 2 Fundamentals",
    description: "Ubuntu 22.04 LTS, ROS 2 Humble/Iron, nodes, topics, publishers, subscribers, services.",
    mainSubjects: ["ROS 2", "Ubuntu", "rclpy", "rclcpp"],
    deliverable: "Create a multi-node ROS 2 robot telemetry system.",
    estimatedHours: 140,
    modules: [],
  },
  {
    monthNumber: 6,
    title: "Robot Modelling and Simulation",
    description: "URDF, Xacro, TF2 coordinate transforms, Gazebo Classic/Ignition physics.",
    mainSubjects: ["URDF", "TF2", "Gazebo", "Simulation"],
    deliverable: "Simulate a mobile robot in a virtual arena.",
    estimatedHours: 140,
    modules: [],
  },
  {
    monthNumber: 7,
    title: "Navigation and Localization",
    description: "ROS 2 Nav2 stack, wheel odometry, IMU sensor fusion (Robot Localization EKF).",
    mainSubjects: ["Nav2", "EKF", "Odometry", "Path Planning"],
    deliverable: "Navigate a simulated robot between waypoints autonomously.",
    estimatedHours: 145,
    modules: [],
  },
  {
    monthNumber: 8,
    title: "Computer Vision and AI",
    description: "OpenCV in Python/C++, color thresholding, contours, ArUco markers, YOLO inference.",
    mainSubjects: ["OpenCV", "Computer Vision", "YOLO", "Camera Calibration"],
    deliverable: "Camera-based object detection and real-time visual tracking.",
    estimatedHours: 140,
    modules: [],
  },
  {
    monthNumber: 9,
    title: "SLAM and Autonomous Robotics",
    description: "2D LiDAR, Cartographer / Slam Toolbox, loop closure, occupancy grid mapping.",
    mainSubjects: ["SLAM", "LiDAR", "Cartographer", "Grid Mapping"],
    deliverable: "Generate a 2D map of a room and localize within it.",
    estimatedHours: 150,
    modules: [],
  },
  {
    monthNumber: 10,
    title: "Intelligent Robot Development",
    description: "Integrate vision with Nav2 for visual obstacle avoidance and target inspection.",
    mainSubjects: ["System Integration", "Behavior Trees", "Autonomous Navigation"],
    deliverable: "Intelligent autonomous mobile robot prototype.",
    estimatedHours: 150,
    modules: [],
  },
  {
    monthNumber: 11,
    title: "Integration and Testing",
    description: "Hardware-in-the-loop testing, thermal & power profiling, fail-safes, ROS diagnostics.",
    mainSubjects: ["Testing", "Hardware Debugging", "Reliability", "Benchmarking"],
    deliverable: "Complete working autonomous mobile robot platform ready for demo.",
    estimatedHours: 140,
    modules: [],
  },
  {
    monthNumber: 12,
    title: "Portfolio and Career Preparation",
    description: "Demonstration videos, technical documentation, GitHub repo polish, interview prep.",
    mainSubjects: ["Portfolio", "GitHub", "System Architecture", "Interviews"],
    deliverable: "A complete professional robotics systems engineering portfolio.",
    estimatedHours: 130,
    modules: [],
  },
];

export const GIRL_MODE_CURRICULUM: SeedMonth[] = [
  {
    monthNumber: 1,
    title: "Drawing and Design Foundations",
    description: "Line control, primitive 3D geometries, 1-point and 2-point perspective, product observation.",
    mainSubjects: ["Freehand Sketching", "Perspective", "Shading", "Design Principles"],
    deliverable: "50 clean product sketches bound in a foundational sketchbook.",
    estimatedHours: 110,
    modules: [
      {
        weekNumber: 1,
        title: "Lines, Ellipses & Dynamic Contour",
        description: "Muscle memory training for clean strokes and precision ellipses.",
        tasks: [
          { title: "Ghosting method & confidence lines exercise", subject: "Sketching", durationMinutes: 60, priority: "high", taskType: "practical", learningObjective: "Draw straight, smooth lines without ruler" },
          { title: "Minor/major axis ellipse drilling across perspective planes", subject: "Sketching", durationMinutes: 60, priority: "high", taskType: "exercise", learningObjective: "Accurate round shapes in 3D" },
          { title: "Study Form Language in Modern Consumer Robotics", subject: "Design Theory", durationMinutes: 45, priority: "medium", taskType: "theory", learningObjective: "Analyze friendly vs aggressive styling" },
        ],
      },
      {
        weekNumber: 2,
        title: "Perspective Construction",
        description: "1-point and 2-point box construction and horizon lines.",
        tasks: [
          { title: "Construct 20 perspective boxes with dividing lines", subject: "Sketching", durationMinutes: 75, priority: "high", taskType: "practical", learningObjective: "Master vanishing points and foreshortening" },
          { title: "Filleting and carving forms from bounding boxes", subject: "Sketching", durationMinutes: 75, priority: "high", taskType: "exercise", learningObjective: "Subtractive modeling on paper" },
        ],
      },
      {
        weekNumber: 3,
        title: "Material Indication & Light Shading",
        description: "Core shadow, cast shadow, matte vs gloss plastic rendering.",
        tasks: [
          { title: "Lighting direction: 5-value grayscale shading on spheres", subject: "Rendering", durationMinutes: 60, priority: "medium", taskType: "theory", learningObjective: "Render depth with tonal values" },
          { title: "Marker & fineliner rendering of handheld tech products", subject: "Sketching", durationMinutes: 90, priority: "high", taskType: "practical", learningObjective: "Texture and material reflection" },
        ],
      },
      {
        weekNumber: 4,
        title: "Month 1 Review & 50-Sketch Portfolio",
        description: "Compile and curate Month 1 deliverables and take assessment.",
        tasks: [
          { title: "Finalize and curate 50 Sketches Presentation PDF", subject: "Portfolio", durationMinutes: 120, priority: "critical", taskType: "project", learningObjective: "Presentable design sketchbook" },
          { title: "Complete Month 1 Industrial Design Foundations Quiz", subject: "Assessment", durationMinutes: 45, priority: "critical", taskType: "assessment", learningObjective: "Score >= 80% on perspective & form" },
        ],
      },
    ],
  },
  {
    monthNumber: 2,
    title: "Industrial Design Sketching",
    description: "Product form development, robot body concepts, orthographic & exploded sketches.",
    mainSubjects: ["Concept Sketching", "Orthographic Views", "Robot Anatomy", "Form Studies"],
    deliverable: "A comprehensive robot concept sketchbook with 4 distinctive directions.",
    estimatedHours: 125,
    modules: [],
  },
  {
    monthNumber: 3,
    title: "Fusion 360 Fundamentals",
    description: "Parametric sketching, geometric constraints, extrude/revolve/sweep, timeline management.",
    mainSubjects: ["Fusion 360", "CAD Modeling", "Parametric Design"],
    deliverable: "Three parametric 3D product models with clean timeline history.",
    estimatedHours: 135,
    modules: [],
  },
  {
    monthNumber: 4,
    title: "Advanced CAD and Technical Drawings",
    description: "Complex surface modeling, assemblies, joints, GD&T, and engineering drawings.",
    mainSubjects: ["CAD Assemblies", "Technical Drawings", "Exploded Views", "Tolerances"],
    deliverable: "Complete robot chassis and outer enclosure CAD assembly with 2D drawings.",
    estimatedHours: 140,
    modules: [],
  },
  {
    monthNumber: 5,
    title: "Ergonomics and Human Factors",
    description: "Anthropometric data (5th-95th percentile), reach envelopes, accessibility, safety clearances.",
    mainSubjects: ["Ergonomics", "Anthropometry", "Usability", "Safety Standards"],
    deliverable: "Comprehensive ergonomic study report for human-robot interaction.",
    estimatedHours: 120,
    modules: [],
  },
  {
    monthNumber: 6,
    title: "Materials and Manufacturing",
    description: "Plastics (ABS, PC), sheet metal, 3D printing (FDM/SLA), injection molding, DFM and DFA.",
    mainSubjects: ["DFM", "DFA", "Injection Molding", "Sheet Metal", "Materials"],
    deliverable: "Material selection matrix and DFM manufacturing feasibility report.",
    estimatedHours: 130,
    modules: [],
  },
  {
    monthNumber: 7,
    title: "Blender and Product Visualization",
    description: "Subdivision surface modeling, procedural CMF materials, studio lighting, Cycles renders.",
    mainSubjects: ["Blender", "CMF", "Studio Lighting", "Photorealistic Rendering"],
    deliverable: "4 high-resolution cinematic marketing renders of the robot.",
    estimatedHours: 140,
    modules: [],
  },
  {
    monthNumber: 8,
    title: "Physical Prototyping",
    description: "Foam and cardboard mockups, rapid FDM 3D printing, snap-fit joints, assembly iteration.",
    mainSubjects: ["Prototyping", "3D Printing", "Model Making", "Physical Fit"],
    deliverable: "Physical scale prototype of the robot enclosure with snap-fit lid.",
    estimatedHours: 130,
    modules: [],
  },
  {
    monthNumber: 9,
    title: "Human-Robot Interaction (HRI)",
    description: "UI/UX for robot control panels, touchscreen Figma prototypes, expressive LED/sound feedback.",
    mainSubjects: ["HRI", "Figma", "UI/UX Design", "Sound & LED Feedback"],
    deliverable: "Interactive Figma prototype of the robot control interface.",
    estimatedHours: 125,
    modules: [],
  },
  {
    monthNumber: 10,
    title: "Complete Robotics Product Design",
    description: "Full robot enclosure integration with internal electronics, thermal vents, and battery access.",
    mainSubjects: ["Product Architecture", "Internal Packaging", "CMF", "Branding"],
    deliverable: "Complete production-ready robotics product CAD and CMF spec sheet.",
    estimatedHours: 145,
    modules: [],
  },
  {
    monthNumber: 11,
    title: "Design Validation and Refinement",
    description: "Drop testing simulation, assembly time optimization, user testing with prototype.",
    mainSubjects: ["Design Validation", "User Testing", "Refinement", "Documentation"],
    deliverable: "Validated robotics product design package with user test findings.",
    estimatedHours: 130,
    modules: [],
  },
  {
    monthNumber: 12,
    title: "Portfolio and Career Preparation",
    description: "3 deep case studies, Behance / website portfolio, resume, design interview presentation.",
    mainSubjects: ["Portfolio Website", "Case Studies", "Behance", "Design Interviews"],
    deliverable: "Professional industrial design portfolio ready for robotics industry applications.",
    estimatedHours: 120,
    modules: [],
  },
];

