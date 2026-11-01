-- supabase/seed.sql
-- =============================================================================
-- ROBO MATES: Seed Data for 12-Month Robotics Curriculum & Shared AMR Project
-- =============================================================================

-- 1. Insert Initial Workspace
INSERT INTO public.workspaces (id, name, member_limit)
VALUES ('00000000-0000-0000-0000-000000000001', 'ROBO MATES Autonomous Robotics Workspace', 2)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Shared Robotics Project
INSERT INTO public.projects (id, workspace_id, title, description, status, completion_percentage)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'ROBO MATES AUTONOMOUS MOBILE ROBOT (AMR)',
    'Dual-specialization venture: A market-ready autonomous indoor transport robot fusing differential drive kinematics, ROS 2 Nav2, SLAM, and ergonomic ABS packaging.',
    'in_progress',
    35
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed 12-Month Curriculum: BOY MODE (Robotics Systems Engineer)
INSERT INTO public.roadmap_months (persona, month_number, title, description, main_subjects, deliverable, estimated_hours)
VALUES
('boy', 1, 'Programming Foundations', 'Master Python fundamentals, variables, loops, data structures, Git, and Linux.', ARRAY['Python', 'Git', 'Linux'], 'Build small Python automation programs independently.', 120),
('boy', 2, 'C++, Electronics and Linux', 'C++ fundamentals, OOP, Ohm law, sensors, and Arduino interfacing.', ARRAY['C++', 'Electronics', 'Linux', 'Arduino'], 'Read sensor data and write independent C++ programs.', 130),
('boy', 3, 'Embedded Systems and Motors', 'ESP32 dual-core, FreeRTOS, GPIO, PWM, DC motors, and servo control.', ARRAY['ESP32', 'PWM', 'Motor Drivers', 'Actuators'], 'Build a controllable mobile robot chassis prototype.', 140),
('boy', 4, 'Mechatronics and Control Systems', 'Quadrature encoders, PID velocity/position tuning, and differential drive.', ARRAY['PID Control', 'Encoders', 'Kinematics', 'Mechatronics'], 'Build a basic robot with controlled straight-line movement.', 135),
('boy', 5, 'ROS 2 Fundamentals', 'Ubuntu 22.04 LTS, ROS 2 Humble, nodes, topics, publishers, and services.', ARRAY['ROS 2', 'Ubuntu', 'rclpy', 'rclcpp'], 'Create a multi-node ROS 2 robot telemetry system.', 140),
('boy', 6, 'Robot Modelling and Simulation', 'URDF, Xacro, TF2 coordinate frames, and Gazebo physics simulation.', ARRAY['URDF', 'TF2', 'Gazebo', 'Simulation'], 'Simulate a mobile robot in a virtual physics arena.', 140),
('boy', 7, 'Navigation and Localization', 'ROS 2 Nav2 stack, wheel odometry, and IMU sensor fusion via Robot Localization EKF.', ARRAY['Nav2', 'EKF', 'Odometry', 'Path Planning'], 'Navigate a simulated mobile robot between waypoints.', 145),
('boy', 8, 'Computer Vision and AI', 'OpenCV in Python/C++, color thresholding, contours, and YOLO AI inference.', ARRAY['OpenCV', 'Computer Vision', 'YOLO', 'Camera Calibration'], 'Camera-based real-time object detection and tracking.', 140),
('boy', 9, 'SLAM and Autonomous Robotics', '2D LiDAR, Cartographer / Slam Toolbox, loop closure, and grid mapping.', ARRAY['SLAM', 'LiDAR', 'Cartographer', 'Grid Mapping'], 'Autonomous mapping and room localization simulation.', 150),
('boy', 10, 'Intelligent Robot Development', 'Combine computer vision with Nav2 for visual obstacle avoidance.', ARRAY['System Integration', 'Behavior Trees', 'Autonomous Navigation'], 'Intelligent autonomous mobile robot prototype.', 150),
('boy', 11, 'Integration and Testing', 'Hardware/software integration, power profiling, and fail-safe diagnostics.', ARRAY['Testing', 'Hardware Debugging', 'Reliability', 'Optimization'], 'Complete working physical robotics prototype.', 140),
('boy', 12, 'Portfolio and Career Preparation', 'Technical documentation, demonstration videos, GitHub polish, and interview prep.', ARRAY['Portfolio', 'GitHub', 'System Architecture', 'Interviews'], 'A complete robotics systems engineering portfolio.', 130)
ON CONFLICT (persona, month_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    main_subjects = EXCLUDED.main_subjects,
    deliverable = EXCLUDED.deliverable,
    estimated_hours = EXCLUDED.estimated_hours;

-- 4. Seed 12-Month Curriculum: GIRL MODE (Industrial Product Designer)
INSERT INTO public.roadmap_months (persona, month_number, title, description, main_subjects, deliverable, estimated_hours)
VALUES
('girl', 1, 'Drawing and Design Foundations', 'Line control, primitive 3D geometries, 1-point and 2-point perspective, product observation.', ARRAY['Freehand Sketching', 'Perspective', 'Shading', 'Design Principles'], '50 basic product sketches bound in a foundational sketchbook.', 110),
('girl', 2, 'Industrial Design Sketching', 'Product form development, robot body concepts, orthographic & exploded sketches.', ARRAY['Concept Sketching', 'Orthographic Views', 'Robot Anatomy', 'Form Studies'], 'A robot concept sketchbook with 4 distinctive directions.', 125),
('girl', 3, 'Fusion 360 Fundamentals', 'Parametric sketching, geometric constraints, extrude/revolve/sweep, timeline management.', ARRAY['Fusion 360', 'CAD Modeling', 'Parametric Design'], 'Three parametric 3D product models with clean timeline history.', 135),
('girl', 4, 'Advanced CAD and Technical Drawings', 'Complex surface modeling, assemblies, joints, GD&T, and engineering drawings.', ARRAY['CAD Assemblies', 'Technical Drawings', 'Exploded Views', 'Tolerances'], 'A complete robot chassis and enclosure CAD model with 2D drawings.', 140),
('girl', 5, 'Ergonomics and Human Factors', 'Anthropometric data (5th-95th percentile), reach envelopes, accessibility, safety clearances.', ARRAY['Ergonomics', 'Anthropometry', 'Usability', 'Safety Standards'], 'An ergonomic robot design study report.', 120),
('girl', 6, 'Materials and Manufacturing', 'Plastics (ABS, PC), sheet metal, 3D printing (FDM/SLA), injection molding, DFM and DFA.', ARRAY['DFM', 'DFA', 'Injection Molding', 'Sheet Metal', 'Materials'], 'Material selection matrix and manufacturing feasibility report.', 130),
('girl', 7, 'Blender and Product Visualization', 'Subdivision surface modeling, procedural CMF materials, studio lighting, Cycles renders.', ARRAY['Blender', 'CMF', 'Studio Lighting', 'Photorealistic Rendering'], 'Professional photorealistic robot product renders.', 140),
('girl', 8, 'Physical Prototyping', 'Foam and cardboard mockups, rapid FDM 3D printing, snap-fit joints, assembly iteration.', ARRAY['Prototyping', '3D Printing', 'Model Making', 'Physical Fit'], 'Physical scale prototype of a robot enclosure with snap-fit lid.', 130),
('girl', 9, 'Human-Robot Interaction (HRI)', 'UI/UX for robot control panels, touchscreen Figma prototypes, expressive LED/sound feedback.', ARRAY['HRI', 'Figma', 'UI/UX Design', 'Sound & LED Feedback'], 'Robot interaction interface interactive prototype.', 125),
('girl', 10, 'Complete Robotics Product Design', 'Full robot enclosure integration with internal electronics, thermal vents, and battery access.', ARRAY['Product Architecture', 'Internal Packaging', 'CMF', 'Branding'], 'Complete production-ready robotics product design CAD & spec.', 145),
('girl', 11, 'Design Validation and Refinement', 'Drop testing simulation, assembly time optimization, user testing with prototype.', ARRAY['Design Validation', 'User Testing', 'Refinement', 'Documentation'], 'Validated robotics product design package.', 130),
('girl', 12, 'Portfolio and Career Preparation', '3 deep case studies, Behance / website portfolio, resume, design interview presentation.', ARRAY['Portfolio Website', 'Case Studies', 'Behance', 'Design Interviews'], 'Professional industrial design portfolio ready for industry applications.', 120)
ON CONFLICT (persona, month_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    main_subjects = EXCLUDED.main_subjects,
    deliverable = EXCLUDED.deliverable,
    estimated_hours = EXCLUDED.estimated_hours;

