require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, WorkerProfile, Job } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced (tables dropped and recreated)');

    // Create admin
    const adminPass = await bcrypt.hash('admin123', 12);
    await User.create({
      fullname: 'Admin User', email: 'admin@trabawho.com',
      password: adminPass, role: 'admin',
    });
    console.log('Admin created: admin@trabawho.com / admin123');

    // Create sample workers
    const workerPass = await bcrypt.hash('password123', 12);
    const workers = await User.bulkCreate([
      { fullname: 'Juan Dela Cruz', email: 'juan@email.com', password: workerPass, role: 'worker' },
      { fullname: 'Maria Santos', email: 'maria@email.com', password: workerPass, role: 'worker' },
      { fullname: 'Pedro Reyes', email: 'pedro@email.com', password: workerPass, role: 'worker' },
      { fullname: 'Ana Garcia', email: 'ana@email.com', password: workerPass, role: 'worker' },
      { fullname: 'Carlo Mendoza', email: 'carlo@email.com', password: workerPass, role: 'worker' },
    ]);

    // Create worker profiles
    await WorkerProfile.bulkCreate([
      { userId: workers[0].id, skills: ['Electrician', 'Plumber'], bio: 'Licensed electrician with 5 years experience. Specializing in residential wiring and repairs.', experience: '5 years in residential electrical work', location: 'Manila', availability: 'available', contactInfo: '09171234567', hourlyRate: 500 },
      { userId: workers[1].id, skills: ['Graphic Designer', 'Photographer'], bio: 'Creative graphic designer and photographer. Expert in branding, social media graphics, and event photography.', experience: '3 years freelance design work', location: 'Quezon City', availability: 'available', contactInfo: '09181234567', hourlyRate: 800 },
      { userId: workers[2].id, skills: ['Programmer', 'Tutor'], bio: 'Full-stack developer and programming tutor. Python, JavaScript, and React specialist.', experience: '4 years software development', location: 'Makati', availability: 'available', contactInfo: '09191234567', hourlyRate: 1000 },
      { userId: workers[3].id, skills: ['Cleaner', 'Cook'], bio: 'Professional house cleaner and home cook. Experienced in deep cleaning and meal prep services.', experience: '6 years in home services', location: 'Pasig', availability: 'available', contactInfo: '09201234567', hourlyRate: 400 },
      { userId: workers[4].id, skills: ['Delivery Rider', 'Driver'], bio: 'Reliable delivery rider and personal driver. Know Metro Manila roads by heart.', experience: '3 years delivery and driving services', location: 'Taguig', availability: 'available', contactInfo: '09211234567', hourlyRate: 350 },
    ]);
    console.log('5 sample workers created');

    // Create sample customers
    const customerPass = await bcrypt.hash('password123', 12);
    const customers = await User.bulkCreate([
      { fullname: 'Lisa Tan', email: 'lisa@email.com', password: customerPass, role: 'customer' },
      { fullname: 'Mark Lim', email: 'mark@email.com', password: customerPass, role: 'customer' },
      { fullname: 'Sofia Cruz', email: 'sofia@email.com', password: customerPass, role: 'customer' },
    ]);

    // Create sample jobs
    await Job.bulkCreate([
      { customerId: customers[0].id, title: 'Fix Kitchen Sink Leak', description: 'Our kitchen sink has been leaking for a week. Need a plumber to fix it ASAP. Faucet may need replacement.', skillRequired: 'Plumber', budget: 1500, location: 'BGC, Taguig', schedule: 'This weekend', status: 'open' },
      { customerId: customers[0].id, title: 'Design Logo for Bakery', description: 'Need a creative logo for my new bakery business. Modern, clean design with pastel colors preferred.', skillRequired: 'Graphic Designer', budget: 3000, location: 'Remote', schedule: 'Within 1 week', status: 'open' },
      { customerId: customers[1].id, title: 'Install Ceiling Fan', description: 'Need to install 3 ceiling fans in bedrooms. Wiring already available. Just need professional installation.', skillRequired: 'Electrician', budget: 2000, location: 'Makati', schedule: 'Weekday afternoon', status: 'open' },
      { customerId: customers[1].id, title: 'Python Tutoring Sessions', description: 'Looking for a Python tutor for my teenager. 2 hours per session, twice a week. Beginner level.', skillRequired: 'Tutor', budget: 800, location: 'Online', schedule: 'MWF 4-6pm', status: 'open' },
      { customerId: customers[2].id, title: 'Deep Clean 3BR Condo', description: 'Moving out of a 3-bedroom condo. Need thorough deep cleaning including kitchen, bathrooms, and all rooms.', skillRequired: 'Cleaner', budget: 2500, location: 'Ortigas, Pasig', schedule: 'May 15, 2026', status: 'open' },
      { customerId: customers[2].id, title: 'Food Delivery for Event', description: 'Need a delivery rider to transport catered food from Makati to BGC for a corporate event. Multiple trips may be needed.', skillRequired: 'Delivery Rider', budget: 1000, location: 'Makati to BGC', schedule: 'May 20, 2026 morning', status: 'open' },
    ]);
    console.log('6 sample jobs created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('  Admin:    admin@trabawho.com / admin123');
    console.log('  Worker:   juan@email.com / password123');
    console.log('  Customer: lisa@email.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
