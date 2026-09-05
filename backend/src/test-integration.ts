import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './lib/prisma';
import { signToken } from './lib/jwt';
import { LeadStatus, Role } from '@prisma/client';

async function run() {
  console.log('--- Starting Comprehensive E2E Integration Test ---');

  const userEmail = 'integration-test-user@example.com';
  const adminEmail = 'integration-test-admin@example.com';

  // 1. Clean up old test data from previous runs if any
  console.log('Cleaning up old integration test data...');
  const testUsers = await prisma.user.findMany({
    where: { email: { in: [userEmail, adminEmail] } },
  });

  for (const u of testUsers) {
    await prisma.score.deleteMany({ where: { portfolio: { userId: u.id } } });
    await prisma.portfolioRow.deleteMany({
      where: { portfolio: { userId: u.id } },
    });
    await prisma.portfolio.deleteMany({ where: { userId: u.id } });
    await prisma.lead.deleteMany({ where: { userId: u.id } });
    await prisma.advisorySession.deleteMany({ where: { userId: u.id } });
    await prisma.client.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }
  console.log('Old test data cleaned.');

  // 2. Create user (GUEST) and admin (ADMIN)
  const user = await prisma.user.create({
    data: {
      email: userEmail,
      role: Role.GUEST,
      name: 'Test Guest',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      role: Role.ADMIN,
      name: 'Test Admin',
    },
  });

  console.log(`Created user: ${user.id} (${user.role})`);
  console.log(`Created admin: ${admin.id} (${admin.role})`);

  // 3. Generate JWT Tokens
  const userToken = signToken({
    userId: user.id,
    email: user.email || '',
    role: user.role,
  });

  const adminToken = signToken({
    userId: admin.id,
    email: admin.email || '',
    role: admin.role,
  });

  console.log('Tokens generated successfully.');

  // ==========================================
  // A. LEADS WORKFLOW
  // ==========================================
  console.log('\n--- Testing Leads Workflow ---');

  // A1. Create a lead (User)
  const leadPayload = {
    name: 'Test User Booking',
    phone: '+15551234567',
    slot: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  };

  console.log('Sending lead booking request...');
  const leadRes = await fetch('http://localhost:8000/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify(leadPayload),
  });

  const leadJson = (await leadRes.json()) as any;
  console.log('Lead Booking Response Status:', leadRes.status);
  console.log('Lead Booking Response:', JSON.stringify(leadJson, null, 2));

  if (!leadRes.ok || !leadJson.success) {
    throw new Error(
      `Failed to create lead: ${leadJson.error || leadRes.statusText}`,
    );
  }
  const leadId = leadJson.data.leadId;

  // A2. Get all leads (Admin)
  console.log('Admin requesting leads list...');
  const getLeadsRes = await fetch(
    'http://localhost:8000/api/leads?status=NEW',
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    },
  );

  const getLeadsJson = (await getLeadsRes.json()) as any;
  console.log('Admin List Leads Status:', getLeadsRes.status);
  if (!getLeadsRes.ok || !getLeadsJson.success) {
    throw new Error('Admin failed to list leads');
  }

  const foundLead = getLeadsJson.data.leads.find((l: any) => l.id === leadId);
  if (!foundLead) {
    throw new Error('Created lead was not found in admin leads list!');
  }
  console.log('Successfully verified lead present in admin list.');

  // A3. Update lead status (Admin)
  console.log('Admin updating lead status to CONTACTED...');
  const updateLeadRes = await fetch(
    `http://localhost:8000/api/leads/${leadId}/status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: LeadStatus.CONTACTED,
        notes: 'Spoke with client, scheduling presentation',
      }),
    },
  );

  const updateLeadJson = (await updateLeadRes.json()) as any;
  console.log('Lead Update Status:', updateLeadRes.status);
  if (!updateLeadRes.ok || !updateLeadJson.success) {
    throw new Error('Failed to update lead status');
  }
  if (
    updateLeadJson.data.status !== LeadStatus.CONTACTED ||
    updateLeadJson.data.notes !== 'Spoke with client, scheduling presentation'
  ) {
    throw new Error('Lead status or notes did not update correctly!');
  }
  console.log('Lead status successfully updated to CONTACTED.');

  // ==========================================
  // B. FREE ADVISORY SESSION BOOKING WORKFLOW
  // ==========================================
  console.log('\n--- Testing Advisory Session Booking Workflow ---');

  // B1. Book preferred slots (User)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const threeDaysLater = new Date(
    Date.now() + 72 * 60 * 60 * 1000,
  ).toISOString();

  console.log('User scheduling slot preferences...');
  const bookSessionRes = await fetch(
    'http://localhost:8000/api/leads/book-session',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        slot1: tomorrow,
        slot2: dayAfter,
        slot3: threeDaysLater,
      }),
    },
  );

  const bookSessionJson = (await bookSessionRes.json()) as any;
  console.log('Book Session Status:', bookSessionRes.status);
  console.log(
    'Book Session Response:',
    JSON.stringify(bookSessionJson, null, 2),
  );

  if (!bookSessionRes.ok || !bookSessionJson.success) {
    throw new Error(
      `Failed to book advisory session: ${bookSessionJson.error || bookSessionRes.statusText}`,
    );
  }
  const sessionId = bookSessionJson.data.id;

  // B2. Get user sessions (User)
  console.log('User requesting their own sessions...');
  const getMySessionsRes = await fetch(
    'http://localhost:8000/api/leads/my-sessions',
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  );
  const getMySessionsJson = (await getMySessionsRes.json()) as any;
  console.log('User Sessions Response Status:', getMySessionsRes.status);
  if (!getMySessionsRes.ok || !getMySessionsJson.success) {
    throw new Error('User failed to fetch their own sessions');
  }
  const userSessionMatch = getMySessionsJson.data.find(
    (s: any) => s.id === sessionId,
  );
  if (!userSessionMatch) {
    throw new Error('Scheduled session not found in user sessions list!');
  }
  console.log('Verified scheduled session is present in user sessions list.');

  // B3. Get sessions (Admin)
  console.log('Admin requesting sessions queue...');
  const getAdminSessionsRes = await fetch(
    'http://localhost:8000/api/leads/admin/sessions',
    {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    },
  );
  const getAdminSessionsJson = (await getAdminSessionsRes.json()) as any;
  console.log('Admin Sessions Response Status:', getAdminSessionsRes.status);
  if (!getAdminSessionsRes.ok || !getAdminSessionsJson.success) {
    throw new Error('Admin failed to fetch sessions list');
  }
  const adminSessionMatch = getAdminSessionsJson.data.find(
    (s: any) => s.id === sessionId,
  );
  if (!adminSessionMatch) {
    throw new Error('Scheduled session not found in admin sessions list!');
  }
  console.log('Verified scheduled session is present in admin sessions list.');

  // B4. Confirm slots (Admin)
  console.log('Admin confirming session slot...');
  const confirmSessionRes = await fetch(
    `http://localhost:8000/api/leads/admin/sessions/${sessionId}/confirm`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        confirmedSlot: tomorrow,
        googleMeetLink: 'https://meet.google.com/abc-defg-hij',
      }),
    },
  );
  const confirmSessionJson = (await confirmSessionRes.json()) as any;
  console.log('Confirm Session Response Status:', confirmSessionRes.status);
  if (!confirmSessionRes.ok || !confirmSessionJson.success) {
    throw new Error(
      `Admin failed to confirm session: ${confirmSessionJson.error}`,
    );
  }
  console.log('Session slot successfully confirmed.');

  // B5. Cancel session (Admin)
  console.log('Admin cancelling session...');
  const cancelSessionRes = await fetch(
    `http://localhost:8000/api/leads/admin/sessions/${sessionId}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    },
  );
  const cancelSessionJson = (await cancelSessionRes.json()) as any;
  console.log('Cancel Session Response Status:', cancelSessionRes.status);
  if (!cancelSessionRes.ok || !cancelSessionJson.success) {
    throw new Error(
      `Admin failed to cancel session: ${cancelSessionJson.error}`,
    );
  }
  console.log('Session successfully cancelled.');

  console.log('--- ALL LEADS & BOOKING TESTS PASSED SUCCESSFULLY ---');

  // 4. Clean up test records
  console.log('Cleaning up test records from database...');
  await prisma.client.deleteMany({
    where: { userId: { in: [user.id, admin.id] } },
  });
  await prisma.advisorySession.deleteMany({
    where: { userId: { in: [user.id, admin.id] } },
  });
  await prisma.lead.deleteMany({
    where: { userId: { in: [user.id, admin.id] } },
  });
  await prisma.user.deleteMany({ where: { id: { in: [user.id, admin.id] } } });
  console.log('Test clean up completed.');
}

run()
  .then(() => {
    console.log('Integration test script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Integration test script failed:', err);
    process.exit(1);
  });
