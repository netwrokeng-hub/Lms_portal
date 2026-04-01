const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const { Trainer } = require('./models/index');

dotenv.config();

const trainers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@cybertech.com',
    designation: 'Senior Security Engineer',
    experience: '12+ Years',
    bio: 'CISSP & CEH certified security expert with experience at Fortune 500 companies. Specializes in ethical hacking and penetration testing.',
    specializations: ['Cyber Security', 'Ethical Hacking', 'Penetration Testing', 'SIEM'],
    certifications: ['CISSP', 'CEH', 'OSCP', 'CompTIA Security+'],
    rating: 4.9,
    studentsCount: 1840
  },
  {
    name: 'Priya Sharma',
    email: 'priya@cybertech.com',
    designation: 'Cloud Solutions Architect',
    experience: '10+ Years',
    bio: 'AWS & GCP certified architect with extensive experience designing cloud-native solutions for enterprise clients across banking and healthcare sectors.',
    specializations: ['AWS', 'Google Cloud', 'Cloud Architecture', 'DevOps'],
    certifications: ['AWS Solutions Architect Pro', 'GCP Professional', 'Azure Expert', 'CKA'],
    rating: 4.8,
    studentsCount: 2100
  },
  {
    name: 'Arun Mehta',
    email: 'arun@cybertech.com',
    designation: 'Network Infrastructure Expert',
    experience: '15+ Years',
    bio: 'CCIE certified network engineer who has designed and implemented enterprise networks for 200+ organizations globally.',
    specializations: ['CCNA', 'CCNP', 'CCIE', 'SD-WAN', 'Network Security'],
    certifications: ['CCIE Enterprise', 'CCNP', 'CCNA', 'Juniper JNCIP'],
    rating: 4.9,
    studentsCount: 3200
  },
  {
    name: 'Sneha Patel',
    email: 'sneha@cybertech.com',
    designation: 'VMware & Data Center Specialist',
    experience: '9+ Years',
    bio: 'VCP certified virtualization expert specializing in VMware vSphere, NSX, and Nutanix HCI deployments for enterprise data centers.',
    specializations: ['VMware', 'Nutanix', 'Data Center', 'Virtualization', 'Storage'],
    certifications: ['VCP-DCV', 'VCP-NV', 'Nutanix NCP', 'VCIX'],
    rating: 4.7,
    studentsCount: 1560
  }
];

const coursesData = [
  {
    title: 'Complete Cyber Security Bootcamp',
    slug: 'complete-cyber-security-bootcamp',
    description: 'Master cyber security from fundamentals to advanced penetration testing. Covers network security, ethical hacking, malware analysis, incident response, and SIEM tools. Aligned with CEH and OSCP exam objectives.',
    shortDescription: 'From zero to certified ethical hacker in 90 days',
    category: 'cybersecurity',
    level: 'Beginner',
    price: 35000,
    discountPrice: 28000,
    duration: '90 Days',
    isFeatured: true,
    tags: ['CEH', 'OSCP', 'Ethical Hacking', 'Penetration Testing', 'SOC'],
    whatYouLearn: [
      'Network security fundamentals and protocols',
      'Ethical hacking methodologies',
      'Web application security (OWASP Top 10)',
      'Penetration testing with Kali Linux',
      'Incident response and forensics',
      'SIEM tools: Splunk, IBM QRadar',
      'Malware analysis and reverse engineering',
      'Preparation for CEH & CompTIA Security+'
    ],
    requirements: ['Basic networking knowledge', 'Windows/Linux fundamentals', 'Laptop with 8GB RAM'],
    syllabus: [
      { topic: 'Module 1: Security Fundamentals', subtopics: ['CIA Triad', 'Types of Attacks', 'Security Policies', 'Risk Management'] },
      { topic: 'Module 2: Network Security', subtopics: ['Firewalls', 'IDS/IPS', 'VPN', 'Network Protocols'] },
      { topic: 'Module 3: Ethical Hacking', subtopics: ['Reconnaissance', 'Scanning', 'Exploitation', 'Post Exploitation'] },
      { topic: 'Module 4: Web App Security', subtopics: ['OWASP Top 10', 'SQL Injection', 'XSS', 'CSRF', 'Burp Suite'] },
      { topic: 'Module 5: Incident Response', subtopics: ['IR Planning', 'Forensics', 'Log Analysis', 'Threat Intelligence'] }
    ],
    batchTimings: [
      { day: 'Monday & Wednesday', time: '7:00 PM - 9:00 PM', mode: 'Online', seats: 30, availableSeats: 12 },
      { day: 'Saturday & Sunday', time: '10:00 AM - 1:00 PM', mode: 'Offline', seats: 20, availableSeats: 8 }
    ],
    rating: 4.9,
    totalReviews: 342,
    enrolledCount: 1240,
    certificationIncluded: true
  },
  {
    title: 'CCNA Complete Course (200-301)',
    slug: 'ccna-complete-course',
    description: 'Comprehensive CCNA 200-301 preparation with hands-on lab sessions. Covers routing, switching, network access, IP services, security fundamentals, and automation.',
    shortDescription: 'Pass CCNA 200-301 with hands-on lab sessions',
    category: 'networking',
    level: 'Beginner',
    price: 25000,
    discountPrice: 19999,
    duration: '60 Days',
    isFeatured: true,
    tags: ['CCNA', 'Cisco', 'Networking', 'Routing', 'Switching'],
    whatYouLearn: [
      'Network fundamentals (OSI, TCP/IP)',
      'Ethernet switching and VLANs',
      'IPv4 and IPv6 routing protocols',
      'OSPF, EIGRP configuration',
      'Network security fundamentals',
      'Wireless networking concepts',
      'Network automation with Python',
      'Cisco IOS CLI mastery'
    ],
    requirements: ['Basic computer knowledge', 'No prior networking required'],
    syllabus: [
      { topic: 'Module 1: Network Fundamentals', subtopics: ['OSI Model', 'TCP/IP', 'IPv4/IPv6', 'Subnetting'] },
      { topic: 'Module 2: LAN Switching', subtopics: ['VLANs', 'STP', 'EtherChannel', 'Port Security'] },
      { topic: 'Module 3: Routing', subtopics: ['Static Routing', 'OSPF', 'EIGRP', 'BGP Basics'] },
      { topic: 'Module 4: WAN & Services', subtopics: ['NAT/PAT', 'DHCP', 'DNS', 'QoS'] },
      { topic: 'Module 5: Security & Automation', subtopics: ['ACLs', 'AAA', 'REST APIs', 'Ansible Basics'] }
    ],
    batchTimings: [
      { day: 'Tuesday & Thursday', time: '6:30 PM - 8:30 PM', mode: 'Online', seats: 25, availableSeats: 10 },
      { day: 'Saturday', time: '9:00 AM - 12:00 PM', mode: 'Hybrid', seats: 20, availableSeats: 5 }
    ],
    rating: 4.8,
    totalReviews: 518,
    enrolledCount: 2100,
    certificationIncluded: true
  },
  {
    title: 'AWS Solutions Architect Associate',
    slug: 'aws-solutions-architect-associate',
    description: 'Prepare for the AWS SAA-C03 exam with comprehensive coverage of all AWS services. Includes 50+ hands-on labs, mock exams, and real-world projects.',
    shortDescription: 'Ace the AWS SAA-C03 with hands-on practice',
    category: 'aws',
    level: 'Intermediate',
    price: 30000,
    discountPrice: 24999,
    duration: '75 Days',
    isFeatured: true,
    tags: ['AWS', 'Cloud', 'SAA-C03', 'EC2', 'S3', 'Lambda'],
    whatYouLearn: [
      'AWS core services: EC2, S3, RDS, VPC',
      'High availability and fault-tolerant architectures',
      'AWS security best practices and IAM',
      'Serverless computing with Lambda',
      'Database services: RDS, DynamoDB, Aurora',
      'Content delivery with CloudFront',
      'Cost optimization strategies',
      'AWS Well-Architected Framework'
    ],
    requirements: ['Basic IT knowledge', 'Understanding of networking concepts'],
    syllabus: [
      { topic: 'Module 1: AWS Fundamentals', subtopics: ['Cloud Computing', 'Global Infrastructure', 'IAM', 'CLI Setup'] },
      { topic: 'Module 2: Compute & Storage', subtopics: ['EC2', 'Auto Scaling', 'ELB', 'S3', 'EBS', 'EFS'] },
      { topic: 'Module 3: Networking', subtopics: ['VPC', 'Route 53', 'CloudFront', 'Direct Connect'] },
      { topic: 'Module 4: Databases', subtopics: ['RDS', 'DynamoDB', 'ElastiCache', 'Redshift'] },
      { topic: 'Module 5: Security & Cost', subtopics: ['KMS', 'WAF', 'CloudTrail', 'Cost Explorer', 'Trusted Advisor'] }
    ],
    batchTimings: [
      { day: 'Monday, Wednesday, Friday', time: '7:00 PM - 9:00 PM', mode: 'Online', seats: 30, availableSeats: 15 },
      { day: 'Sunday', time: '9:00 AM - 1:00 PM', mode: 'Online', seats: 25, availableSeats: 20 }
    ],
    rating: 4.8,
    totalReviews: 287,
    enrolledCount: 980,
    certificationIncluded: true
  },
  {
    title: 'VMware vSphere 8 Masterclass',
    slug: 'vmware-vsphere-8-masterclass',
    description: 'Deep dive into VMware vSphere 8.x with hands-on labs on vCenter, ESXi, vSAN, NSX-T, and vRealize Operations. Aligned with VCP-DCV certification.',
    shortDescription: 'Master virtualization with VMware vSphere 8',
    category: 'vmware',
    level: 'Intermediate',
    price: 28000,
    discountPrice: 22000,
    duration: '60 Days',
    isFeatured: true,
    tags: ['VMware', 'vSphere', 'vCenter', 'ESXi', 'vSAN', 'VCP'],
    whatYouLearn: [
      'VMware vSphere architecture and components',
      'ESXi installation and configuration',
      'vCenter Server deployment and management',
      'Virtual machine creation and management',
      'vSAN storage and NSX-T networking',
      'vSphere security and hardening',
      'High availability and fault tolerance',
      'VCP-DCV exam preparation'
    ],
    requirements: ['Basic server administration', 'Understanding of x86 hardware'],
    syllabus: [
      { topic: 'Module 1: vSphere Architecture', subtopics: ['ESXi Basics', 'vCenter Setup', 'Datacenters', 'Clusters'] },
      { topic: 'Module 2: Networking', subtopics: ['vSwitches', 'Distributed Switches', 'NSX-T Basics', 'VLANs'] },
      { topic: 'Module 3: Storage', subtopics: ['vSAN', 'NFS', 'iSCSI', 'Datastores', 'VMFS'] },
      { topic: 'Module 4: Resource Management', subtopics: ['DRS', 'vMotion', 'HA', 'FT', 'Resource Pools'] },
      { topic: 'Module 5: Security & Monitoring', subtopics: ['vSphere Security', 'Certificates', 'vROps', 'Log Insight'] }
    ],
    batchTimings: [
      { day: 'Tuesday & Friday', time: '7:00 PM - 9:30 PM', mode: 'Online', seats: 20, availableSeats: 7 },
      { day: 'Saturday & Sunday', time: '11:00 AM - 1:30 PM', mode: 'Offline', seats: 15, availableSeats: 6 }
    ],
    rating: 4.7,
    totalReviews: 195,
    enrolledCount: 670,
    certificationIncluded: true
  },
  {
    title: 'Nutanix Certified Professional (NCP)',
    slug: 'nutanix-certified-professional',
    description: 'Comprehensive NCP training covering Nutanix AOS, Prism Central, AHV hypervisor, and HCI infrastructure management.',
    shortDescription: 'Become a certified Nutanix HCI expert',
    category: 'nutanix',
    level: 'Intermediate',
    price: 26000,
    discountPrice: 20999,
    duration: '45 Days',
    tags: ['Nutanix', 'HCI', 'Prism', 'AHV', 'NCP'],
    whatYouLearn: [
      'Nutanix HCI architecture and concepts',
      'Nutanix AOS cluster management',
      'Prism Central administration',
      'AHV hypervisor management',
      'Data protection and DR',
      'Network and storage management',
      'Nutanix Files and Objects',
      'NCP exam preparation'
    ],
    requirements: ['Virtualization basics', 'Understanding of storage concepts'],
    syllabus: [
      { topic: 'Module 1: HCI Fundamentals', subtopics: ['Nutanix Architecture', 'CVM', 'Prism Element', 'Cluster Setup'] },
      { topic: 'Module 2: Compute & Storage', subtopics: ['AHV', 'VMs', 'Storage Containers', 'Data Resiliency'] },
      { topic: 'Module 3: Networking', subtopics: ['AHV Networking', 'Flow Network Security', 'VPC'] },
      { topic: 'Module 4: Data Protection', subtopics: ['Snapshots', 'Replication', 'Leap DR', 'Xi Cloud'] }
    ],
    batchTimings: [
      { day: 'Monday & Wednesday', time: '6:00 PM - 8:00 PM', mode: 'Online', seats: 20, availableSeats: 11 }
    ],
    rating: 4.6,
    totalReviews: 142,
    enrolledCount: 450,
    certificationIncluded: true
  },
  {
    title: 'Google Cloud Professional (GCP)',
    slug: 'google-cloud-professional',
    description: 'Master Google Cloud Platform services and prepare for GCP Professional certifications. Covers Compute, Storage, Networking, Big Data, ML, and DevOps.',
    shortDescription: 'Become a GCP certified cloud professional',
    category: 'gcp',
    level: 'Intermediate',
    price: 29000,
    discountPrice: 23499,
    duration: '60 Days',
    tags: ['GCP', 'Google Cloud', 'Kubernetes', 'BigQuery', 'Cloud Run'],
    whatYouLearn: [
      'GCP core services and infrastructure',
      'Compute Engine and GKE (Kubernetes)',
      'Cloud Storage and database services',
      'BigQuery and data analytics',
      'Cloud Security and IAM',
      'CI/CD with Cloud Build',
      'ML services: Vertex AI, AutoML',
      'GCP Professional exam prep'
    ],
    requirements: ['Cloud computing basics', 'Linux fundamentals'],
    syllabus: [
      { topic: 'Module 1: GCP Fundamentals', subtopics: ['Cloud Concepts', 'IAM', 'Billing', 'Console'] },
      { topic: 'Module 2: Compute', subtopics: ['Compute Engine', 'GKE', 'Cloud Run', 'App Engine'] },
      { topic: 'Module 3: Storage & Databases', subtopics: ['Cloud Storage', 'Cloud SQL', 'Firestore', 'Bigtable'] },
      { topic: 'Module 4: Networking & Security', subtopics: ['VPC', 'Cloud CDN', 'Cloud Armor', 'Security Command Center'] }
    ],
    batchTimings: [
      { day: 'Wednesday & Friday', time: '7:30 PM - 9:30 PM', mode: 'Online', seats: 25, availableSeats: 18 }
    ],
    rating: 4.7,
    totalReviews: 210,
    enrolledCount: 720,
    certificationIncluded: true
  },
  {
    title: 'Firewall & Network Security (Palo Alto + Fortinet)',
    slug: 'firewall-network-security',
    description: 'Hands-on training on enterprise firewalls: Palo Alto Networks (PCNSA/PCNSE) and Fortinet FortiGate (NSE 4/7). Real lab environments.',
    shortDescription: 'Master enterprise firewalls - Palo Alto & Fortinet',
    category: 'firewall',
    level: 'Intermediate',
    price: 32000,
    discountPrice: 26000,
    duration: '75 Days',
    tags: ['Palo Alto', 'Fortinet', 'FortiGate', 'PCNSA', 'NSE', 'Firewall'],
    whatYouLearn: [
      'Palo Alto NGFW architecture and deployment',
      'Security policies and NAT rules',
      'App-ID, User-ID, Content-ID',
      'SSL decryption and threat prevention',
      'Fortinet FortiGate administration',
      'FortiManager and FortiAnalyzer',
      'High availability configurations',
      'PCNSA and NSE 4/7 exam preparation'
    ],
    requirements: ['Networking fundamentals', 'Basic security knowledge'],
    syllabus: [
      { topic: 'Module 1: Palo Alto Fundamentals', subtopics: ['Architecture', 'Interface Types', 'Security Zones', 'Policies'] },
      { topic: 'Module 2: Palo Alto Advanced', subtopics: ['App-ID', 'User-ID', 'SSL Inspect', 'Panorama'] },
      { topic: 'Module 3: Fortinet Basics', subtopics: ['FortiOS', 'Interfaces', 'Policies', 'VPN'] },
      { topic: 'Module 4: Fortinet Advanced', subtopics: ['HA', 'FortiManager', 'FortiAnalyzer', 'NSE Labs'] }
    ],
    batchTimings: [
      { day: 'Tuesday & Thursday', time: '7:00 PM - 9:30 PM', mode: 'Online', seats: 20, availableSeats: 9 },
      { day: 'Sunday', time: '10:00 AM - 1:00 PM', mode: 'Offline', seats: 15, availableSeats: 4 }
    ],
    rating: 4.8,
    totalReviews: 176,
    enrolledCount: 580,
    certificationIncluded: true
  },
  {
    title: 'CCNP Enterprise (ENCOR + ENARSI)',
    slug: 'ccnp-enterprise',
    description: 'Advanced Cisco networking with CCNP Enterprise tracks. Covers advanced routing, SD-WAN, network assurance, automation, and security.',
    shortDescription: 'Advanced Cisco networking for career professionals',
    category: 'networking',
    level: 'Advanced',
    price: 40000,
    discountPrice: 33000,
    duration: '120 Days',
    tags: ['CCNP', 'Cisco', 'ENCOR', 'ENARSI', 'SD-WAN', 'Network Automation'],
    whatYouLearn: [
      'Advanced OSPF, EIGRP, and BGP',
      'Network architecture and design patterns',
      'SD-WAN deployment and management',
      'Wireless LAN architecture',
      'Network security with 802.1X',
      'Network automation and programmability',
      'Network assurance with Cisco DNA Center',
      'CCNP ENCOR & ENARSI exam prep'
    ],
    requirements: ['Valid CCNA certification or equivalent knowledge'],
    syllabus: [
      { topic: 'ENCOR Part 1: Architecture', subtopics: ['Enterprise Architecture', 'Virtualization', 'Network Assurance'] },
      { topic: 'ENCOR Part 2: Routing & Switching', subtopics: ['Advanced OSPF', 'BGP', 'MPLS', 'QoS'] },
      { topic: 'ENARSI: Advanced Routing', subtopics: ['VRF', 'Route Maps', 'Policy-Based Routing', 'IP SLA'] },
      { topic: 'Automation', subtopics: ['Python for Network Engineers', 'REST APIs', 'YANG', 'NetConf', 'Ansible'] }
    ],
    batchTimings: [
      { day: 'Monday, Wednesday, Friday', time: '6:30 PM - 9:00 PM', mode: 'Online', seats: 20, availableSeats: 8 }
    ],
    rating: 4.9,
    totalReviews: 289,
    enrolledCount: 890,
    certificationIncluded: true
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Trainer.deleteMany({});

    // Create admin
    const adminUser = await User.create({
      name: 'Admin CyberTech',
      email: 'admin@cybertech.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210'
    });
    console.log('✅ Admin created:', adminUser.email);

    // Create sample students
    const student1 = await User.create({
      name: 'John Student',
      email: 'student@cybertech.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 87654 32109'
    });
    console.log('✅ Student created:', student1.email);

    // Create trainers
    const createdTrainers = await Trainer.insertMany(trainers);
    console.log('✅ Trainers created:', createdTrainers.length);

    // Assign trainers to courses
    const trainerMap = {
      cybersecurity: createdTrainers[0]._id,
      networking: createdTrainers[2]._id,
      aws: createdTrainers[1]._id,
      gcp: createdTrainers[1]._id,
      vmware: createdTrainers[3]._id,
      nutanix: createdTrainers[3]._id,
      firewall: createdTrainers[0]._id,
      datacenter: createdTrainers[3]._id,
      hardware: createdTrainers[2]._id,
    };

    const trainerNames = {
      cybersecurity: 'Rajesh Kumar',
      networking: 'Arun Mehta',
      aws: 'Priya Sharma',
      gcp: 'Priya Sharma',
      vmware: 'Sneha Patel',
      nutanix: 'Sneha Patel',
      firewall: 'Rajesh Kumar',
      datacenter: 'Sneha Patel',
      hardware: 'Arun Mehta',
    };

    const coursesWithTrainers = coursesData.map(c => ({
      ...c,
      trainer: trainerMap[c.category],
      trainerName: trainerNames[c.category]
    }));

    const createdCourses = await Course.insertMany(coursesWithTrainers);
    console.log('✅ Courses created:', createdCourses.length);

    console.log('\n🎉 Database seeded successfully!');
    console.log('-------------------------------------------');
    console.log('Admin login:   admin@cybertech.com / Admin@123');
    console.log('Student login: student@cybertech.com / Student@123');
    console.log('-------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedDB();
