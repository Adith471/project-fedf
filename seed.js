const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load models
const User = require('./models/user');
const Sport = require('./models/sport');
const Event = require('./models/event');
const Team = require('./models/team');
const Registration = require('./models/registration');
const Result = require('./models/result');
const Announcement = require('./models/announcement');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    // Clear DB
    await User.deleteMany();
    await Sport.deleteMany();
    await Event.deleteMany();
    await Team.deleteMany();
    await Registration.deleteMany();
    await Result.deleteMany();
    await Announcement.deleteMany();
    console.log('Cleared all collections.');

    // 1. Create Sports
    const sports = await Sport.create([
      { name: 'Cricket', category: 'Team', icon: 'Activity', description: 'T20 college tournament' },
      { name: 'Football', category: 'Team', icon: 'Target', description: 'Inter-college championship' },
      { name: 'Basketball', category: 'Team', icon: 'Award', description: '3v3 and 5v5 basketball games' },
      { name: 'Badminton', category: 'Individual', icon: 'Zap', description: 'Singles and Doubles matches' },
      { name: 'Athletics', category: 'Individual', icon: 'Flame', description: '100m, 200m track events' }
    ]);
    console.log('Seeded Sports categories.');

    // 2. Create Users
    // Passwords will be encrypted via Pre-save hook
    const admin = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'admin@sportsync.com',
      password: 'password123',
      role: 'admin',
      collegeId: 'ADM001',
      profilePhoto: '',
      sportPreferences: ['Cricket', 'Football']
    });

    const captain = await User.create({
      name: 'Alex Mercer',
      email: 'captain@sportsync.com',
      password: 'password123',
      role: 'captain',
      collegeId: 'CAP001',
      profilePhoto: '',
      sportPreferences: ['Football', 'Basketball']
    });

    const student1 = await User.create({
      name: 'John Doe',
      email: 'student1@sportsync.com',
      password: 'password123',
      role: 'student',
      collegeId: 'STU001',
      profilePhoto: '',
      sportPreferences: ['Cricket', 'Badminton']
    });

    const student2 = await User.create({
      name: 'Jane Smith',
      email: 'student2@sportsync.com',
      password: 'password123',
      role: 'student',
      collegeId: 'STU002',
      profilePhoto: '',
      sportPreferences: ['Basketball', 'Athletics']
    });
    console.log('Seeded Users (1 Admin, 1 Captain, 2 Students).');

    // 3. Create Events
    const today = new Date();
    
    const upcomingDate = new Date();
    upcomingDate.setDate(today.getDate() + 10);
    const upcomingDeadline = new Date();
    upcomingDeadline.setDate(today.getDate() + 4);

    const ongoingDate = new Date();
    ongoingDate.setDate(today.getDate() + 1);
    const ongoingDeadline = new Date();
    ongoingDeadline.setDate(today.getDate() - 1); // deadline passed

    const completedDate = new Date();
    completedDate.setDate(today.getDate() - 10);
    const completedDeadline = new Date();
    completedDeadline.setDate(today.getDate() - 15);

    const event1 = await Event.create({
      title: 'Annual College Cricket Cup',
      description: 'The ultimate T20 college faceoff. Teams of 11 will play knockouts.',
      sportType: 'Cricket',
      date: upcomingDate,
      venue: 'Main Sports Arena Ground',
      maxParticipants: 16,
      registrationDeadline: upcomingDeadline,
      status: 'upcoming',
      createdBy: admin._id
    });

    const event2 = await Event.create({
      title: 'Monsoon Football League',
      description: '9v9 Football tournament open to all departments.',
      sportType: 'Football',
      date: ongoingDate,
      venue: 'North Campus Turf',
      maxParticipants: 8,
      registrationDeadline: ongoingDeadline,
      status: 'ongoing',
      createdBy: admin._id
    });

    const event3 = await Event.create({
      title: 'Spring Basketball Showdown',
      description: 'Standard 5v5 full court basketball tournament.',
      sportType: 'Basketball',
      date: completedDate,
      venue: 'Indoor Sports Hall',
      maxParticipants: 12,
      registrationDeadline: completedDeadline,
      status: 'completed',
      createdBy: admin._id
    });
    console.log('Seeded Events (1 Upcoming, 1 Ongoing, 1 Completed).');

    // 4. Create Team
    const team = await Team.create({
      name: 'Vanguard FC',
      sport: 'Football',
      captainId: captain._id,
      members: [student1._id],
      eventId: event2._id
    });
    console.log('Seeded Team (Vanguard FC).');

    // 5. Create registrations
    // Register Student 1 for Cricket
    await Registration.create({
      studentId: student1._id,
      eventId: event1._id,
      teamId: null,
      status: 'approved'
    });

    // Register Student 2 for Basketball
    await Registration.create({
      studentId: student2._id,
      eventId: event3._id,
      teamId: null,
      status: 'approved'
    });

    // Register Captain for Football
    await Registration.create({
      studentId: captain._id,
      eventId: event2._id,
      teamId: team._id,
      status: 'pending'
    });
    console.log('Seeded event Registrations.');

    // 6. Create Result for Completed Basketball Event
    await Result.create({
      eventId: event3._id,
      studentId: student2._id,
      position: '1st Place Winner',
      score: '96 - 88 (Overtime)',
      remarks: 'Jane Smith played exceptionally, scoring 32 points in the final match.',
      approved: true,
      approvedBy: admin._id,
      submittedBy: captain._id
    });
    console.log('Seeded Result.');

    // 7. Create Announcement
    await Announcement.create({
      title: 'Welcome to SportSync!',
      message: 'Registration is now open for the Annual College Cricket Cup! Head over to the events page to secure your spot.',
      postedBy: admin._id,
      targetRole: 'all'
    });
    console.log('Seeded Announcements.');

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data: ', error);
    process.exit(1);
  }
};

seedData();
